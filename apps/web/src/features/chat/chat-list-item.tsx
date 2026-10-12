import Link from "next/link";

import { chatLabel } from "@/features/chat/chat-label";
import { PresenceDot } from "@/features/chat/chat-presence-ui";
import { relativeTime } from "@/lib/time";
import type { Chat } from "@/types/social";

export function ChatListItem({
  active,
  chat,
  online,
}: {
  active: boolean;
  chat: Chat;
  online: boolean;
}) {
  return (
    <Link
      href={`/chat/${chat.chatId}`}
      className={`flex w-full items-start gap-3 border-b border-line p-4 text-left hover:bg-accent-soft ${
        active ? "bg-accent-soft" : ""
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 truncate font-bold text-ink">
          {!chat.group && <PresenceDot online={online} />}
          {chatLabel(chat)}
          {Boolean(chat.unreadCount) && (
            <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-xs font-extrabold text-accent-contrast">
              {chat.unreadCount}
            </span>
          )}
        </span>
        <span className="block truncate text-sm text-ink-muted">
          {chat.lastMessage?.message || "No messages yet"}
          {chat.lastMessage?.createdAt ? ` - ${relativeTime(chat.lastMessage.createdAt)}` : ""}
        </span>
      </span>
    </Link>
  );
}
