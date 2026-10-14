import { localDateTime, relativeTime } from "@/lib/time";
import type { ChatMessage } from "@/types/social";

export function MessageBubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] rounded px-3 py-2 text-sm ${mine ? "message-mine" : "message-other bg-surface text-ink shadow-soft"}`}>
        {!mine && <p className="mb-1 text-xs font-bold opacity-70">{message.sender}</p>}
        <p className="break-words leading-6">{message.message}</p>
        <time
          dateTime={message.createdAt}
          title={localDateTime(message.createdAt)}
          className={`mt-1 block text-[11px] ${mine ? "text-white/80" : "text-ink-muted"}`}
        >
          {relativeTime(message.createdAt)}
        </time>
      </div>
    </div>
  );
}
