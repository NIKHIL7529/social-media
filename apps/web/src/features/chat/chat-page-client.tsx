"use client";

import { Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import {
  ChatListItem,
  ChatLoginRequired,
  ChatThreadHeader,
  MessageBubble,
  MessageComposer,
  typingText,
} from "@/features/chat/chat-components";
import { GroupForm } from "@/features/chat/group-form";
import { useChatWorkspace } from "@/features/chat/use-chat-workspace";

export function ChatPageClient() {
  return (
    <AppShell>
      <ChatWorkspace />
    </AppShell>
  );
}

function ChatWorkspace() {
  const chat = useChatWorkspace();

  if (!chat.user) return <ChatLoginRequired />;
  const user = chat.user;

  return (
    <section className="mx-auto grid h-[calc(100dvh-var(--nav-height)-18px-var(--bottom-nav-height))] w-full max-w-6xl overflow-hidden rounded-lg border border-line bg-white shadow-card lg:h-[calc(100vh-var(--nav-height)-48px)] lg:grid-cols-[320px_1fr]">
      <aside className={`${chat.activeChat ? "hidden" : "flex"} min-h-0 flex-col lg:flex lg:border-r`}>
        <div className="flex items-center justify-between border-b border-line p-4">
          <div>
            <h1 className="text-xl font-extrabold text-ink">Messages</h1>
            <p className="text-sm text-ink-muted">
              {chat.chats.length} conversations · {chat.realtimeStatus}
            </p>
          </div>
          <button
            onClick={chat.toggleGroupForm}
            className="grid size-10 place-items-center rounded-md text-accent-deep hover:bg-accent-soft"
            aria-label="Create group"
            title="Create group"
          >
            <Plus />
          </button>
        </div>
        {chat.showGroupForm && <GroupForm onDone={chat.notifyGroupCreated} />}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {chat.chatsQuery.isLoading && <p className="p-4 text-sm text-ink-muted">Loading chats...</p>}
          {chat.chats.map((item) => (
            <ChatListItem
              key={item.chatId}
              active={chat.activeChat?.chatId === item.chatId}
              chat={item}
              online={chat.isChatOnline(item)}
              onSelect={() => chat.selectChat(item.chatId)}
            />
          ))}
          {!chat.chatsQuery.isLoading && chat.chats.length === 0 && <p className="p-4 text-sm text-ink-muted">No conversations yet.</p>}
        </div>
      </aside>

      <main className={`${chat.activeChat ? "flex" : "hidden"} min-h-0 flex-col lg:flex`}>
        {chat.activeChat ? (
          <>
            <ChatThreadHeader
              activeChat={chat.activeChat}
              groupNameDraft={chat.groupNameDraft}
              isOnline={chat.isChatOnline(chat.activeChat)}
              isRenaming={chat.renamingGroup}
              onBack={chat.backToChatList}
              onRename={chat.renameGroup}
              onRenameChange={chat.updateGroupNameDraft}
              onToggleRename={chat.toggleRenameGroup}
              typing={typingText(chat.typingUsers[chat.activeChat.chatId])}
            />
            <div ref={chat.messageListRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
              {chat.messagesQuery.data?.pagination.hasMore && (
                <button onClick={chat.loadOlder} className="mx-auto block rounded-md border border-line bg-white px-3 py-2 text-sm font-bold text-accent-deep">
                  Load older
                </button>
              )}
              {chat.messages.map((message) => (
                <MessageBubble key={message._id} message={message} mine={message.sender === user.name} />
              ))}
            </div>
            <MessageComposer
              draft={chat.draft}
              isSending={chat.sendPending}
              onBlur={chat.stopTyping}
              onChange={chat.updateDraft}
              onSubmit={chat.send}
            />
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-6 text-center text-ink-muted">Select a conversation to start messaging.</div>
        )}
      </main>
    </section>
  );
}
