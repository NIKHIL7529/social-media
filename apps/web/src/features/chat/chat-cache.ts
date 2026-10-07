import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import type { Chat, ChatMessage } from "@/types/social";
import type { chatService } from "@/features/chat/chat-service";

type ChatListCache = { status: number; chats: Chat[]; user: string };
type MessagesCache = Awaited<ReturnType<typeof chatService.getMessages>>;

function messageTimestamp(message: ChatMessage) {
  return message.updatedAt || message.createdAt;
}

function lastMessage(message: ChatMessage) {
  return {
    message: message.message,
    sender: message.sender,
    createdAt: message.createdAt || message.updatedAt,
  };
}

function sortByRecentActivity(chats: Chat[]) {
  return [...chats].sort(
    (first, second) => new Date(second.updatedAt || 0).getTime() - new Date(first.updatedAt || 0).getTime(),
  );
}

export function addGroupToChatList(queryClient: QueryClient, chat: Chat) {
  queryClient.setQueryData<ChatListCache>(queryKeys.chatList, (current) => {
    if (!current) return current;
    if (current.chats.some((item) => item.chatId === chat.chatId)) {
      return {
        ...current,
        chats: current.chats.map((item) => (item.chatId === chat.chatId ? { ...item, ...chat, group: true } : item)),
      };
    }
    return { ...current, chats: [{ ...chat, group: true }, ...current.chats] };
  });
}

export function renameGroupInChatList(queryClient: QueryClient, chat: Chat) {
  queryClient.setQueryData<ChatListCache>(queryKeys.chatList, (current) => {
    if (!current) return current;
    return {
      ...current,
      chats: current.chats.map((item) => (item.chatId === chat.chatId ? { ...item, name: chat.name } : item)),
    };
  });
}

export function markChatReadInList(queryClient: QueryClient, chatId: string) {
  queryClient.setQueryData<ChatListCache>(queryKeys.chatList, (current) => {
    if (!current) return current;
    return {
      ...current,
      chats: current.chats.map((chat) => (chat.chatId === chatId ? { ...chat, unreadCount: 0 } : chat)),
    };
  });
}

export function appendMessageToChat(queryClient: QueryClient, chatId: string, message: ChatMessage) {
  queryClient.setQueryData<MessagesCache>(queryKeys.chatMessages(chatId), (current) => {
    if (!current) {
      return {
        status: 200,
        messages: { _id: chatId, messages: [message] },
        pagination: { hasMore: false, nextCursor: null },
      };
    }
    if (current.messages.messages.some((item) => item._id === message._id)) return current;
    return {
      ...current,
      messages: {
        ...current.messages,
        messages: [...current.messages.messages, message],
      },
    };
  });
}

export function prependMessagesToChat(queryClient: QueryClient, chatId: string, page: MessagesCache) {
  queryClient.setQueryData<MessagesCache>(queryKeys.chatMessages(chatId), (current) => {
    const currentMessages = current?.messages.messages || [];
    const currentIds = new Set(currentMessages.map((message) => message._id).filter(Boolean));
    return {
      ...page,
      messages: {
        ...page.messages,
        messages: [...page.messages.messages.filter((message) => !currentIds.has(message._id)), ...currentMessages],
      },
      pagination: page.pagination,
    };
  });
}

export function upsertChatPreview(
  queryClient: QueryClient,
  options: {
    activeChat: Chat | null;
    chatId: string;
    currentUserName?: string;
    incrementUnread: boolean;
    message: ChatMessage;
  },
) {
  queryClient.setQueryData<ChatListCache>(queryKeys.chatList, (current) => {
    if (!current) return current;

    const existing = current.chats.some((chat) => chat.chatId === options.chatId);
    if (!existing) {
      const newChat: Chat = {
        chatId: options.chatId,
        users: options.message.sender === options.currentUserName ? options.activeChat?.users || [] : [options.message.sender],
        group: false,
        lastMessage: lastMessage(options.message),
        updatedAt: messageTimestamp(options.message),
        unreadCount: options.incrementUnread ? 1 : 0,
      };
      return { ...current, chats: [newChat, ...current.chats] };
    }

    return {
      ...current,
      chats: sortByRecentActivity(
        current.chats.map((chat) =>
          chat.chatId === options.chatId
            ? {
                ...chat,
                lastMessage: lastMessage(options.message),
                updatedAt: messageTimestamp(options.message),
                unreadCount: options.incrementUnread ? (chat.unreadCount || 0) + 1 : 0,
              }
            : chat,
        ),
      ),
    };
  });
}
