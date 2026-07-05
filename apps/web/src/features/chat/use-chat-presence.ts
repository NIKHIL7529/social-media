"use client";

import { useState } from "react";

import type { Chat } from "@/types/social";

type OnlineUser = { user: string };
type TypingUsers = Record<string, Record<string, boolean>>;

export function useChatPresence(currentUserName?: string) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUsers>({});

  function isChatOnline(chat: Chat) {
    return chat.users.some((chatUser) => onlineUsers.some((online) => online.user === chatUser));
  }

  function applyTyping({ chatId, user, isTyping }: { chatId: string; user: string; isTyping: boolean }) {
    if (user === currentUserName) return;
    setTypingUsers((current) => {
      const chatTyping = { ...(current[chatId] || {}) };
      if (isTyping) chatTyping[user] = true;
      else delete chatTyping[user];
      return { ...current, [chatId]: chatTyping };
    });
  }

  return { applyTyping, isChatOnline, setOnlineUsers, typingUsers };
}
