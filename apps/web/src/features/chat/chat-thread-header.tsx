"use client";

import { FormEvent } from "react";
import { ArrowLeft, Pencil } from "lucide-react";

import { chatLabel } from "@/features/chat/chat-label";
import { PresenceDot } from "@/features/chat/chat-presence-ui";
import type { Chat } from "@/types/social";

export function ChatThreadHeader({
  activeChat,
  groupNameDraft,
  isOnline,
  isRenaming,
  onBack,
  onRename,
  onRenameChange,
  onToggleRename,
  typing,
}: {
  activeChat: Chat;
  groupNameDraft: string;
  isOnline: boolean;
  isRenaming: boolean;
  onBack: () => void;
  onRename: (event: FormEvent) => void;
  onRenameChange: (value: string) => void;
  onToggleRename: () => void;
  typing: string;
}) {
  return (
    <header className="border-b border-line p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="grid size-9 flex-shrink-0 place-items-center rounded-md text-ink-muted hover:bg-accent-soft lg:hidden"
            aria-label="Back to conversations"
            title="Back"
          >
            <ArrowLeft size={19} />
          </button>
          <h2 className="flex min-w-0 items-center gap-2 font-extrabold text-ink">
            {!activeChat.group && <PresenceDot online={isOnline} />}
            <span className="truncate">{chatLabel(activeChat)}</span>
          </h2>
        </div>
        {activeChat.group && activeChat.chatId !== "new" && (
          <button
            type="button"
            onClick={onToggleRename}
            className="grid size-9 place-items-center rounded-md text-accent-deep hover:bg-accent-soft"
            aria-label="Rename group"
            title="Rename group"
          >
            <Pencil size={17} />
          </button>
        )}
      </div>
      <p className="text-sm text-ink-muted">
        {activeChat.group ? "Group chat" : isOnline ? "Online" : "Offline"}
        {typing ? ` - ${typing}` : ""}
      </p>
      {isRenaming && activeChat.group && (
        <form onSubmit={onRename} className="mt-3 flex gap-2">
          <input
            value={groupNameDraft}
            onChange={(event) => onRenameChange(event.target.value)}
            className="min-h-10 min-w-0 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
            placeholder="Group name optional"
          />
          <button className="min-h-10 rounded-md bg-accent px-3 text-sm font-bold text-white">Save</button>
        </form>
      )}
    </header>
  );
}
