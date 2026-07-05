"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { markChatReadInList, prependMessagesToChat } from "@/features/chat/chat-cache";
import { chatService } from "@/features/chat/chat-service";
import { useMessageScroll } from "@/features/chat/use-message-scroll";
import { queryKeys } from "@/lib/query-keys";

export function useChatMessages(chatId: string | null) {
  const queryClient = useQueryClient();
  const [olderCursor, setOlderCursor] = useState<string | null>(null);
  const messagesQuery = useQuery({
    queryKey: queryKeys.chatMessages(chatId),
    queryFn: () => chatService.getMessages(chatId as string),
    enabled: Boolean(chatId),
  });
  const messages = messagesQuery.data?.messages.messages || [];
  const messageListRef = useMessageScroll({ dependency: `${chatId || ""}:${messages.length}` });

  useEffect(() => {
    if (!chatId || !messages.length) return;
    chatService.markRead(chatId).catch(() => undefined);
    markChatReadInList(queryClient, chatId);
  }, [chatId, messages.length, queryClient]);

  async function loadOlder() {
    if (!chatId || !messagesQuery.data?.pagination.hasMore) return;
    try {
      const page = await chatService.getMessages(chatId, {
        before: olderCursor || messagesQuery.data.pagination.nextCursor,
        limit: 50,
      });
      setOlderCursor(page.pagination.nextCursor);
      prependMessagesToChat(queryClient, chatId, page, messages);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load older messages");
    }
  }

  return {
    loadOlder,
    messageListRef,
    messages,
    messagesQuery,
    resetPagination: () => setOlderCursor(null),
  };
}
