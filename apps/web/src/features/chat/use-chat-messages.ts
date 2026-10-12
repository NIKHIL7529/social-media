"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { markChatReadInList, prependMessagesToChat } from "@/features/chat/chat-cache";
import { chatService } from "@/features/chat/chat-service";
import { useMessageScroll } from "@/features/chat/use-message-scroll";
import { queryKeys } from "@/lib/query-keys";

export function useChatMessages(chatId: string | null, currentUserName?: string) {
  const queryClient = useQueryClient();
  const loadingOlder = useRef(new Set<string>());
  const messagesQuery = useQuery({
    queryKey: queryKeys.chatMessages(chatId),
    queryFn: ({ signal }) => chatService.getMessages(chatId as string, {}, signal),
    enabled: Boolean(chatId && currentUserName),
  });
  const messages = messagesQuery.data?.messages.messages || [];
  const latestMessage = messages.findLast((message) => message.sender !== currentUserName && message.type !== "system");
  const latestMessageId = latestMessage && latestMessage._id;
  const messageListRef = useMessageScroll({ dependency: `${chatId || ""}:${messages.length}` });

  useEffect(() => {
    if (!chatId || !currentUserName || !latestMessageId) return;
    // Update the preview only after the server accepts the read receipt.
    chatService.markRead(chatId).then(() => markChatReadInList(queryClient, chatId)).catch(error => toast.error(error instanceof Error ? error.message : "Unable to mark messages as read."));
  }, [chatId, currentUserName, latestMessageId, queryClient]);

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
