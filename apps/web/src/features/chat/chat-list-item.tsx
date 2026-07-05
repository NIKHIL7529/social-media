import { MessageCircle, Users } from "lucide-react";

import { chatLabel } from "@/features/chat/chat-label";
import { PresenceDot } from "@/features/chat/chat-presence-ui";
import { relativeTime } from "@/lib/time";
import type { Chat } from "@/types/social";

export function ChatListItem({
  active,
  chat,
  online,
  onSelect,
}: {
  active: boolean;
  chat: Chat;
  online: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-start gap-3 border-b border-line p-4 text-left hover:bg-accent-soft ${
        active ? "bg-accent-soft" : ""
      }`}
    >
      <span className="grid size-10 flex-shrink-0 place-items-center rounded-full bg-slate-100 text-accent-deep">
        {chat.group ? <Users size={19} /> : <MessageCircle size={19} />}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 truncate font-bold text-ink">
          {!chat.group && <PresenceDot online={online} />}
          {chatLabel(chat)}
          {Boolean(chat.unreadCount) && (
            <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-xs font-extrabold text-white">
              {chat.unreadCount}
            </span>
          )}
        </span>
        <span className="block truncate text-sm text-ink-muted">
          {chat.lastMessage?.message || "No messages yet"}
          {chat.lastMessage?.createdAt ? ` - ${relativeTime(chat.lastMessage.createdAt)}` : ""}
        </span>
      </span>
    </button>
  );
}
