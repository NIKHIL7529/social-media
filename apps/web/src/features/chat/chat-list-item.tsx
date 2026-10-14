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
      aria-current={active ? "page" : undefined}
      className={`chat-item flex w-full items-start gap-3 border-b border-line p-4 text-left hover:bg-accent-soft ${
        active ? "bg-accent-soft" : ""
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-bold leading-6 text-ink">
          {!chat.group && <PresenceDot online={online} />}
          <span className="min-w-0 truncate">{chatLabel(chat)}</span>
          {Boolean(chat.unreadCount) && (
            <span className="ml-auto rounded bg-accent px-2 py-0.5 text-xs font-extrabold text-accent-contrast">
              {chat.unreadCount}
            </span>
          )}
        </span>
        <span className={`block truncate text-sm leading-5 text-ink-muted ${chat.group ? "" : "pl-4"}`}>
          {chat.lastMessage?.message || "No messages yet"}
          {chat.lastMessage?.createdAt ? ` - ${relativeTime(chat.lastMessage.createdAt)}` : ""}
        </span>
      </span>
    </Link>
  );
}
