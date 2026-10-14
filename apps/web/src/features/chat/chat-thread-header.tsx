"use client";

import { FormEvent } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";

import { chatLabel } from "@/features/chat/chat-label";
import { PresenceDot } from "@/features/chat/chat-presence-ui";
import type { Chat } from "@/types/social";

export function ChatThreadHeader({
  activeChat,
  groupNameDraft,
  isOnline,
  isRenaming,
  onRename,
  onRenameChange,
  onToggleRename,
  typing,
}: {
  activeChat: Chat;
  groupNameDraft: string;
  isOnline: boolean;
  isRenaming: boolean;
  onRename: (event: FormEvent) => void;
  onRenameChange: (value: string) => void;
  onToggleRename: () => void;
  typing: string;
}) {
  return (
    <header className="shrink-0">
      <div className="chat-header-bar justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/chat"
            className="grid size-9 flex-shrink-0 place-items-center rounded text-ink-muted hover:bg-accent-soft lg:hidden"
            aria-label="Back to conversations"
            title="Back"
          >
            <ArrowLeft size={19} />
          </Link>
          <div className="min-w-0">
            <h2 className="truncate font-extrabold leading-6 text-ink">{chatLabel(activeChat)}</h2>
            <p className="flex items-center gap-2 text-sm leading-5 text-ink-muted">
              {!activeChat.group && <PresenceDot online={isOnline} />}
              <span className="truncate">
                {activeChat.group ? "Group chat" : isOnline ? "Online" : "Offline"}
                {typing ? ` - ${typing}` : ""}
              </span>
            </p>
          </div>
        </div>
        {activeChat.group && activeChat.chatId !== "new" && (
          <button
            type="button"
            onClick={onToggleRename}
            className="grid size-9 place-items-center rounded text-accent-deep hover:bg-accent-soft"
            aria-label="Rename group"
            title="Rename group"
          >
            <Pencil size={17} />
          </button>
        )}
      </div>
      {isRenaming && activeChat.group && (
        <form onSubmit={onRename} className="flex gap-2 border-b border-line px-4 pb-4">
          <input
            value={groupNameDraft}
            onChange={(event) => onRenameChange(event.target.value)}
            className="min-h-10 min-w-0 flex-1 rounded border border-line px-3 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
            placeholder="Group name optional"
          />
          <button className="min-h-10 rounded bg-accent px-3 text-sm font-bold text-accent-contrast">Save</button>
        </form>
      )}
    </header>
  );
}
