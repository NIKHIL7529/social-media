import type { Chat } from "@/types/social";

export function chatLabel(chat: Chat) {
  if (chat.group) {
    return chat.name?.trim() || chat.users.join(", ") || "Group";
  }
  return chat.users.join(", ");
}
