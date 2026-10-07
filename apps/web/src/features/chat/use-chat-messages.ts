"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { markChatReadInList, prependMessagesToChat } from "@/features/chat/chat-cache";
import { chatService } from "@/features/chat/chat-service";
import { useMessageScroll } from "@/features/chat/use-message-scroll";
import { queryKeys } from "@/lib/query-keys";

export function useChatMessages(chatId: string | null) {
  const queryClient = useQueryClient();
  const loadingOlder = useRef(new Set<string>());
  const messagesQuery = useQuery({
    queryKey: queryKeys.chatMessages(chatId),
    queryFn: () => chatService.getMessages(chatId as string),
    enabled: Boolean(chatId),
  });
  const messages = messagesQuery.data?.messages.messages || [];
  const latestMessage = messages[messages.length - 1];
  const latestMessageId = latestMessage && (latestMessage._id || latestMessage.createdAt || latestMessage.updatedAt || latestMessage.message);
  const messageListRef = useMessageScroll({ dependency: `${chatId || ""}:${messages.length}` });

  useEffect(() => {
    if (!chatId || !latestMessageId) return;
    chatService.markRead(chatId).catch(() => undefined);
    markChatReadInList(queryClient, chatId);
  }, [chatId, latestMessageId, queryClient]);

  async function loadOlder() {
    if (!chatId || !messagesQuery.data?.pagination.hasMore || loadingOlder.current.has(chatId)) return;
    loadingOlder.current.add(chatId);
    try {
      const page = await chatService.getMessages(chatId, {
        before: messagesQuery.data.pagination.nextCursor,
        limit: 50,
      });
      prependMessagesToChat(queryClient, chatId, page);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load older messages");
    } finally {
      loadingOlder.current.delete(chatId);
    }
  }

  return {
    loadOlder,
    messageListRef,
    messages,
    messagesQuery,
  };
}
