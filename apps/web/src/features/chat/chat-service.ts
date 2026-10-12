import { apiFetch, jsonPost } from "@/lib/api";
import type { Chat, ChatMessage } from "@/types/social";

export const chatService = {
  getChats: (signal?: AbortSignal) => apiFetch<{ status: number; chats: Chat[]; user: string }>("/api/message/allChats", { signal }),
  getMessages: (conversationId: string, options: { before?: string | null; limit?: number } = {}, signal?: AbortSignal) =>
    jsonPost<
      {
        status: number;
        messages: { _id: string; messages: ChatMessage[] };
        pagination: { hasMore: boolean; nextCursor: string | null };
      },
      { _id: string; before?: string | null; limit?: number }
    >("/api/message/messages", {
      _id: conversationId,
      ...options,
    }, signal),
  sendMessage: ({ conversationId, receiver, message }: { conversationId?: string | null; receiver: string[]; message: string }) =>
    jsonPost<
      {
        status: number;
        conversationId: string;
        recipients: string[];
        message: { messages: ChatMessage[] };
      },
      { _id?: string | null; receiver: string[]; msg: string }
    >("/api/message/sendMessage", {
      _id: conversationId,
      receiver,
      msg: message,
    }),
  getFollowings: (signal?: AbortSignal) => apiFetch<{ status: number; followings: Array<{ followings: string[] }> }>("/api/message/followings", { signal }),
  markRead: (conversationId: string) =>
    jsonPost<{ status: number; message: string }, { _id: string }>("/api/message/markRead", {
      _id: conversationId,
    }),
  getDirect: (userName: string) =>
    jsonPost<{ status: number; chat: Chat | null; recipient?: { username: string } }, { userName: string }>("/api/message/direct", { userName }),
  createGroup: (group: { name: string; users: string[] }) =>
    jsonPost<{ status: number; addGroup: Chat }, typeof group>("/api/group/createGroup", group),
  renameGroup: (group: { chatId: string; name: string }) =>
    jsonPost<{ status: number; group: Chat }, typeof group>("/api/group/renameGroup", group),
};
