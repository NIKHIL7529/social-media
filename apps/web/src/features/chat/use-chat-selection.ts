"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import type { Chat } from "@/types/social";

export function useChatSelection(chats: Chat[]) {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

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

  function selectChat(chatId: string) {
    setActiveChatId(chatId);
    router.push(`/chat/${chatId}`);
  }

  return {
    activeChat,
    backToChatList: () => router.push("/chat"),
    replaceDraftWithChat: (chatId: string) => router.replace(`/chat/${chatId}`),
    resolvedActiveChatId,
    selectChat,
    setActiveChatId,
  };
}
