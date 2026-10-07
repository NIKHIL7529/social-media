"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useCurrentUser } from "@/components/app-shell";
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
  const { data: user } = useCurrentUser();
  const [draft, setDraft] = useState("");
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [renamingGroup, setRenamingGroup] = useState(false);
  const [groupNameDraft, setGroupNameDraft] = useState("");

  const chatsQuery = useQuery({
    queryKey: queryKeys.chatList,
    queryFn: chatService.getChats,
    enabled: Boolean(user),
  });
  const chats = chatsQuery.data?.chats || [];
  const { activeChat, backToChatList, replaceDraftWithChat, resolvedActiveChatId, selectChat, setActiveChatId } = useChatSelection(chats);
  const presence = useChatPresence(user?.name);
  const chatMessages = useChatMessages(resolvedActiveChatId);

  const realtime = useChatRealtime({
    enabled: Boolean(user),
    activeChatId: resolvedActiveChatId,
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
        currentUserName: user?.name,
        incrementUnread: !isActiveChat,
        message,
      });
    },
  });

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
        if (!resolvedActiveChatId) queryClient.invalidateQueries({ queryKey: queryKeys.chatList });
        if (!resolvedActiveChatId) replaceDraftWithChat(nextChatId);
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
      realtime.send({ type: "group", users: data.group.users, chat: data.group });
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
    isChatOnline: presence.isChatOnline,
    loadOlder: chatMessages.loadOlder,
    messageListRef: chatMessages.messageListRef,
    messages: chatMessages.messages,
    messagesQuery: chatMessages.messagesQuery,
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
    typingUsers: presence.typingUsers,
    updateDraft,
    updateGroupNameDraft: setGroupNameDraft,
    user,
    backToChatList,
  };
}
