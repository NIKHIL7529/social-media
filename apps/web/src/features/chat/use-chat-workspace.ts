"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useCurrentUser } from "@/components/app-shell";
import { queryKeys } from "@/lib/query-keys";
import type { Chat } from "@/types/social";
import {
  addGroupToChatList,
  appendMessageToChat,
  markChatReadInList,
  prependMessagesToChat,
  renameGroupInChatList,
  upsertChatPreview,
} from "@/features/chat/chat-cache";
import { chatService } from "@/features/chat/chat-service";
import { useChatRealtime } from "@/features/chat/use-chat-realtime";
import { useMessageScroll } from "@/features/chat/use-message-scroll";

export function useChatWorkspace() {
  const queryClient = useQueryClient();
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user } = useCurrentUser();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [olderCursor, setOlderCursor] = useState<string | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [renamingGroup, setRenamingGroup] = useState(false);
  const [groupNameDraft, setGroupNameDraft] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Array<{ user: string }>>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, Record<string, boolean>>>({});

  const chatsQuery = useQuery({
    queryKey: queryKeys.chatList,
    queryFn: chatService.getChats,
    enabled: Boolean(user),
  });
  const chats = chatsQuery.data?.chats || [];
  const draftRecipient = params.id === "new" ? searchParams.get("user") : null;
  const draftChat = useMemo<Chat | null>(() => (draftRecipient ? { chatId: "new", users: [draftRecipient], group: false } : null), [draftRecipient]);
  const activeChat = useMemo(
    () => draftChat || chats.find((chat) => chat.chatId === activeChatId) || null,
    [activeChatId, chats, draftChat],
  );
  const resolvedActiveChatId = activeChat && activeChat.chatId !== "new" ? activeChat.chatId : null;

  useEffect(() => {
    if (params.id && params.id !== "new") {
      setActiveChatId(params.id);
      return;
    }
    setActiveChatId(null);
  }, [params.id]);

  const messagesQuery = useQuery({
    queryKey: queryKeys.chatMessages(resolvedActiveChatId),
    queryFn: () => chatService.getMessages(resolvedActiveChatId as string),
    enabled: Boolean(resolvedActiveChatId),
  });
  const messages = messagesQuery.data?.messages.messages || [];
  const messageListRef = useMessageScroll({ dependency: `${resolvedActiveChatId || ""}:${messages.length}` });

  const isChatOnline = (chat: Chat) => chat.users.some((chatUser) => onlineUsers.some((online) => online.user === chatUser));

  const realtime = useChatRealtime({
    enabled: Boolean(user),
    activeChatId: resolvedActiveChatId,
    onOnlineUsers: setOnlineUsers,
    onGroup: (chat) => addGroupToChatList(queryClient, chat),
    onTyping: ({ chatId, user: typingUser, isTyping }) => {
      if (typingUser === user?.name) return;
      setTypingUsers((current) => {
        const chatTyping = { ...(current[chatId] || {}) };
        if (isTyping) chatTyping[typingUser] = true;
        else delete chatTyping[typingUser];
        return { ...current, [chatId]: chatTyping };
      });
    },
    onMessage: (message) => {
      const isActiveChat = message.chatId === resolvedActiveChatId;
      if (isActiveChat) {
        appendMessageToChat(queryClient, message.chatId, message);
        chatService.markRead(message.chatId).catch(() => undefined);
      }
      upsertChatPreview(queryClient, {
        activeChat,
        chatId: message.chatId,
        currentUserName: user?.name,
        incrementUnread: !isActiveChat,
        message,
      });
    },
  });

  useEffect(() => {
    if (!resolvedActiveChatId || !messages.length) return;
    chatService.markRead(resolvedActiveChatId).catch(() => undefined);
    markChatReadInList(queryClient, resolvedActiveChatId);
  }, [messages.length, queryClient, resolvedActiveChatId]);

  const sendMutation = useMutation({
    mutationFn: () =>
      chatService.sendMessage({
        conversationId: resolvedActiveChatId,
        receiver: activeChat?.users || [],
        message: draft,
      }),
    onSuccess: (data) => {
      const savedMessage = data.message.messages[data.message.messages.length - 1];
      const nextChatId = resolvedActiveChatId || data.conversationId;
      if (nextChatId && savedMessage) {
        appendMessageToChat(queryClient, nextChatId, savedMessage);
        realtime.send({ type: "message", chatId: nextChatId, message: savedMessage });
        upsertChatPreview(queryClient, {
          activeChat,
          chatId: nextChatId,
          currentUserName: user?.name,
          incrementUnread: false,
          message: savedMessage,
        });
        setActiveChatId(nextChatId);
        queryClient.invalidateQueries({ queryKey: queryKeys.chatList });
        if (!resolvedActiveChatId) router.replace(`/chat/${nextChatId}`);
      }
      setDraft("");
      if (nextChatId) realtime.send({ type: "typing", chatId: nextChatId, isTyping: false });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Message failed"),
  });

  const renameGroupMutation = useMutation({
    mutationFn: () => chatService.renameGroup({ chatId: resolvedActiveChatId || "", name: groupNameDraft }),
    onSuccess: (data) => {
      renameGroupInChatList(queryClient, data.group);
      setRenamingGroup(false);
      toast.success("Group updated");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not rename group"),
  });

  function send(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    if (!activeChat) {
      toast("Choose a conversation first");
      return;
    }
    sendMutation.mutate();
  }

  async function loadOlder() {
    if (!resolvedActiveChatId || !messagesQuery.data?.pagination.hasMore) return;
    try {
      const page = await chatService.getMessages(resolvedActiveChatId, {
        before: olderCursor || messagesQuery.data.pagination.nextCursor,
        limit: 50,
      });
      setOlderCursor(page.pagination.nextCursor);
      prependMessagesToChat(queryClient, resolvedActiveChatId, page, messages);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load older messages");
    }
  }

  function selectChat(chatId: string) {
    setActiveChatId(chatId);
    setOlderCursor(null);
    router.push(`/chat/${chatId}`);
  }

  function updateDraft(value: string) {
    setDraft(value);
    if (resolvedActiveChatId) realtime.send({ type: "typing", chatId: resolvedActiveChatId, isTyping: value.length > 0 });
  }

  function stopTyping() {
    if (resolvedActiveChatId) realtime.send({ type: "typing", chatId: resolvedActiveChatId, isTyping: false });
  }

  function toggleRenameGroup() {
    if (!activeChat) return;
    setGroupNameDraft(activeChat.name || "");
    setRenamingGroup((value) => !value);
  }

  function renameGroup(event: FormEvent) {
    event.preventDefault();
    renameGroupMutation.mutate();
  }

  function notifyGroupCreated(chat?: Chat) {
    setShowGroupForm(false);
    if (chat) realtime.send({ type: "group", users: chat.users, chat });
  }

  return {
    activeChat,
    chats,
    chatsQuery,
    draft,
    groupNameDraft,
    isChatOnline,
    loadOlder,
    messageListRef,
    messages,
    messagesQuery,
    notifyGroupCreated,
    realtimeStatus: realtime.status,
    renameGroup,
    renamingGroup,
    selectChat,
    send,
    sendPending: sendMutation.isPending,
    showGroupForm,
    stopTyping,
    toggleGroupForm: () => setShowGroupForm((value) => !value),
    toggleRenameGroup,
    typingUsers,
    updateDraft,
    updateGroupNameDraft: setGroupNameDraft,
    user,
    backToChatList: () => router.push("/chat"),
  };
}
