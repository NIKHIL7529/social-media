"use client";

import { useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import type { Chat } from "@/types/social";

export function useChatSelection(chats: Chat[]) {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeChatId = params.id;

  const draftRecipient = params.id === "new" ? searchParams.get("user") : null;
  const draftChat = useMemo<Chat | null>(() => (draftRecipient ? { chatId: "new", users: [draftRecipient], group: false } : null), [draftRecipient]);
  const activeChat = useMemo(
    () => draftChat || chats.find((chat) => chat.chatId === activeChatId) || null,
    [activeChatId, chats, draftChat],
  );
  const resolvedActiveChatId = activeChat && activeChat.chatId !== "new" ? activeChat.chatId : null;


  return {
    activeChat,
    replaceDraftWithChat: (chatId: string) => router.replace(`/chat/${chatId}`),
    resolvedActiveChatId,
  };
}
