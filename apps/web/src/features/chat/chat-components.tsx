"use client";

import { FormEvent } from "react";
import { ArrowLeft, MessageCircle, Pencil, Send, Users } from "lucide-react";

import { localDateTime, relativeTime } from "@/lib/time";
import type { Chat, ChatMessage } from "@/types/social";
import { chatLabel } from "@/features/chat/chat-label";

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

export function PresenceDot({ online }: { online: boolean }) {
  return <span className={`size-2 flex-shrink-0 rounded-full ${online ? "bg-emerald-500" : "bg-slate-300"}`} aria-hidden="true" />;
}

export function typingText(users?: Record<string, boolean>) {
  const names = Object.keys(users || {});
  if (!names.length) return "";
  return `${names.join(", ")} ${names.length === 1 ? "is" : "are"} typing`;
}

export function ChatLoginRequired() {
  return (
    <section className="mx-auto w-full max-w-feed rounded-lg border border-line bg-white p-5 shadow-card">
      <h1 className="text-2xl font-extrabold text-ink">Messages</h1>
      <p className="mt-2 text-ink-muted">Login to view your conversations and live status.</p>
    </section>
  );
}

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
          {chat.lastMessage?.createdAt ? ` · ${relativeTime(chat.lastMessage.createdAt)}` : ""}
        </span>
      </span>
    </button>
  );
}

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
        {typing ? ` · ${typing}` : ""}
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
