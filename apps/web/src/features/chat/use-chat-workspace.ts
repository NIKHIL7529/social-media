"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useCurrentUser } from "@/features/auth/use-current-user";
import { queryKeys } from "@/lib/query-keys";
import type { Chat } from "@/types/social";
import {
  addGroupToChatList,
  appendMessageToChat,
  renameGroupInChatList,
  upsertChatPreview,
} from "@/features/chat/chat-cache";
import { chatService } from "@/features/chat/chat-service";
import { useChatMessages } from "@/features/chat/use-chat-messages";
import { useChatPresence } from "@/features/chat/use-chat-presence";
import { useChatRealtime } from "@/features/chat/use-chat-realtime";
import { useChatSelection } from "@/features/chat/use-chat-selection";

export function useChatWorkspace() {
  const queryClient = useQueryClient();
  const { data: user, error: userError, isLoading: isLoadingUser } = useCurrentUser();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupRename, setGroupRename] = useState<{ chatId: string; name: string } | null>(null);

  const chatsQuery = useQuery({
    queryKey: queryKeys.chatList,
    queryFn: ({ signal }) => chatService.getChats(signal),
    enabled: Boolean(user),
  });
  const chats = chatsQuery.data?.chats || [];
  const { activeChat, replaceDraftWithChat, resolvedActiveChatId } = useChatSelection(chats);
  const draftKey = activeChat?.chatId === "new" ? `new:${activeChat.users.join(",")}` : resolvedActiveChatId || "";
  const draft = drafts[draftKey] || "";
  const renamingGroup = groupRename?.chatId === resolvedActiveChatId && groupRename !== null;
  const groupNameDraft = renamingGroup ? groupRename.name : "";
  const presence = useChatPresence(user?.username);
  const chatMessages = useChatMessages(resolvedActiveChatId, user?.username);

  const realtime = useChatRealtime({
    enabled: Boolean(user),
    onOnlineUsers: presence.setOnlineUsers,
    onGroup: (chat) => addGroupToChatList(queryClient, chat),
    onTyping: presence.applyTyping,
    onMessage: (message) => {
      const isActiveChat = message.chatId === resolvedActiveChatId;
      if (isActiveChat) {
        appendMessageToChat(queryClient, message.chatId, message);
      }
      upsertChatPreview(queryClient, {
        activeChat,
        chatId: message.chatId,
        currentUserName: user?.username,
        incrementUnread: !isActiveChat && message.sender !== user?.username,
        message,
      });
    },
  });

  const sendMutation = useMutation({
    mutationFn: (submission: { conversationId: string | null; chat: Chat; draftKey: string; message: string; sender: string }) =>
      chatService.sendMessage({
        conversationId: submission.conversationId,
        receiver: submission.chat.users,
        message: submission.message,
      }),
    onSuccess: (data, submission) => {
      const savedMessage = data.message.messages[data.message.messages.length - 1];
      const nextChatId = data.conversationId;
      if (savedMessage) {
        appendMessageToChat(queryClient, nextChatId, savedMessage);
        realtime.send({ type: "message", chatId: nextChatId, message: savedMessage });
        upsertChatPreview(queryClient, {
          activeChat: submission.chat,
          chatId: nextChatId,
          currentUserName: submission.sender,
          incrementUnread: false,
          message: savedMessage,
        });
        if (!submission.conversationId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.chatList });
          if (draftKey === submission.draftKey) replaceDraftWithChat(nextChatId);
        }
      }
      setDrafts((current) => {
        if (current[submission.draftKey] !== submission.message) return current;
        const next = { ...current };
        delete next[submission.draftKey];
        return next;
      });
      realtime.send({ type: "typing", chatId: nextChatId, isTyping: false });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Message failed"),
  });

  const renameGroupMutation = useMutation({
    mutationFn: (submission: { chatId: string; name: string }) => chatService.renameGroup(submission),
    onSuccess: (data) => {
      renameGroupInChatList(queryClient, data.group);
      realtime.send({ type: "group", users: data.group.users, chat: data.group });
      setGroupRename((current) => current?.chatId === data.group.chatId ? null : current);
      toast.success("Group updated");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not rename group"),
  });

  function send(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim() || sendMutation.isPending) return;
    if (!activeChat || !user) {
      toast("Choose a conversation first");
      return;
    }
    sendMutation.mutate({ conversationId: resolvedActiveChatId, chat: activeChat, draftKey, message: draft, sender: user.username });
  }

  function updateDraft(value: string) {
    setDrafts((current) => ({ ...current, [draftKey]: value }));
    if (resolvedActiveChatId) realtime.send({ type: "typing", chatId: resolvedActiveChatId, isTyping: value.length > 0 });
  }

  function stopTyping() {
    if (resolvedActiveChatId) realtime.send({ type: "typing", chatId: resolvedActiveChatId, isTyping: false });
  }

  function toggleRenameGroup() {
    if (!activeChat) return;
    setGroupRename((current) => current?.chatId === activeChat.chatId ? null : { chatId: activeChat.chatId, name: activeChat.name || "" });
  }

  function renameGroup(event: FormEvent) {
    event.preventDefault();
    if (groupRename && renamingGroup && !renameGroupMutation.isPending) renameGroupMutation.mutate(groupRename);
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
    isChatOnline: presence.isChatOnline,
    loadOlder: chatMessages.loadOlder,
    messageListRef: chatMessages.messageListRef,
    messages: chatMessages.messages,
    messagesQuery: chatMessages.messagesQuery,
    notifyGroupCreated,
    realtimeStatus: realtime.status,
    renameGroup,
    renamingGroup,
    send,
    sendPending: sendMutation.isPending,
    showGroupForm,
    stopTyping,
    toggleGroupForm: () => setShowGroupForm((value) => !value),
    toggleRenameGroup,
    typingUsers: presence.typingUsers,
    updateDraft,
    updateGroupNameDraft: (name: string) => setGroupRename((current) => current ? { ...current, name } : null),
    user,
    userError,
    isLoadingUser,
  };
}
