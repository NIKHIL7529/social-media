import { localDateTime, relativeTime } from "@/lib/time";
import type { ChatMessage } from "@/types/social";

export function MessageBubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-accent text-white" : "bg-white text-ink shadow-soft"}`}>
        {!mine && <p className="mb-1 text-xs font-bold opacity-70">{message.sender}</p>}
        <p className="break-words leading-6">{message.message}</p>
        <time
          dateTime={message.updatedAt || message.createdAt}
          title={localDateTime(message.updatedAt || message.createdAt)}
          className={`mt-1 block text-[11px] ${mine ? "text-white/75" : "text-ink-muted"}`}
        >
          {relativeTime(message.updatedAt || message.createdAt)}
        </time>
      </div>
    </div>
  );
}
