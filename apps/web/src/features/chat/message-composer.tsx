"use client";

import { FormEvent } from "react";
import { Send } from "lucide-react";

export function MessageComposer({
  draft,
  isSending,
  onBlur,
  onChange,
  onSubmit,
}: {
  draft: string;
  isSending: boolean;
  onBlur: () => void;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 border-t border-line p-3">
      <input
        value={draft}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="min-h-11 min-w-0 flex-1 rounded-md border border-line px-3 outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
        placeholder="Message"
      />
      <button
        disabled={isSending}
        className="grid size-11 place-items-center rounded-md bg-accent text-white disabled:cursor-wait disabled:opacity-60"
        aria-label="Send message"
      >
        <Send size={19} />
      </button>
    </form>
  );
}
