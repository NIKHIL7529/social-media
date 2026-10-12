"use client";

import { Plus } from "lucide-react";

import { ChatListItem } from "@/features/chat/chat-list-item";
import { LoginRequired } from "@/components/login-required";
import { ChatThreadHeader } from "@/features/chat/chat-thread-header";
import { MessageBubble } from "@/features/chat/message-bubble";
import { MessageComposer } from "@/features/chat/message-composer";
import { typingText } from "@/features/chat/chat-presence-ui";
import { ChatSkeleton, ListSkeleton } from "@/components/skeletons";
import { GroupForm } from "@/features/chat/group-form";
import { useChatWorkspace } from "@/features/chat/use-chat-workspace";
import { useDesktop } from "@/lib/use-desktop";
import { QueryError } from "@/components/query-error";

export function ChatPageClient() {
  const { messageListRef, ...chat } = useChatWorkspace();
  const desktop = useDesktop();

  if (chat.isLoadingUser) return <ChatSkeleton />;
  if (!chat.user) return chat.userError ? null : <LoginRequired message="to view your conversations." />;
  const user = chat.user;

  return (
    <section className="grid min-h-0 w-full min-w-0 flex-1 overflow-hidden bg-surface lg:grid-cols-[minmax(240px,320px)_minmax(0,1fr)]">
      <aside className={`${chat.activeChat ? "hidden" : "flex"} min-h-0 min-w-0 flex-col border-line lg:flex lg:border-r`}>
        <div className="flex items-center justify-between border-b border-line p-4">
          <div>
            <h1 className="text-xl font-extrabold text-ink">Messages</h1>
            <p className="text-sm text-ink-muted">
              {chat.chats.length} conversations · {chat.realtimeStatus}
            </p>
          </div>
          <button
            onClick={chat.toggleGroupForm}
            className="grid size-10 place-items-center rounded-xl text-accent-deep hover:bg-accent-soft"
            aria-label="Create group"
            title="Create group"
          >
            <Plus />
          </button>
        </div>
        {chat.showGroupForm && (desktop || !chat.activeChat) && <GroupForm onDone={chat.notifyGroupCreated} />}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {chat.chatsQuery.isLoading && <ListSkeleton />}
          {chat.chatsQuery.error && <p role="alert" className="break-words p-4 text-sm text-danger">{chat.chatsQuery.error.message}</p>}
          {chat.chats.map((item) => (
            <ChatListItem
              key={item.chatId}
              active={chat.activeChat?.chatId === item.chatId}
              chat={item}
              online={chat.isChatOnline(item)}
            />
          ))}
          {!chat.chatsQuery.isLoading && !chat.chatsQuery.error && chat.chats.length === 0 && <p className="p-4 text-sm text-ink-muted">No conversations yet.</p>}
        </div>
      </aside>

      <main className={`${chat.activeChat ? "flex" : "hidden"} min-h-0 min-w-0 flex-col lg:flex`}>
        {!desktop && chat.activeChat && <QueryError error={chat.chatsQuery.error} onRetry={() => chat.chatsQuery.refetch()} retrying={chat.chatsQuery.isFetching} />}
        {chat.activeChat ? (
          <>
            <ChatThreadHeader
              activeChat={chat.activeChat}
              groupNameDraft={chat.groupNameDraft}
              isOnline={chat.isChatOnline(chat.activeChat)}
              isRenaming={chat.renamingGroup}
              onRename={chat.renameGroup}
              onRenameChange={chat.updateGroupNameDraft}
              onToggleRename={chat.toggleRenameGroup}
              typing={typingText(chat.typingUsers[chat.activeChat.chatId])}
            />
            <div ref={messageListRef} className="flex-1 space-y-3 overflow-y-auto bg-surface-raised p-4">
              {chat.messagesQuery.isLoading && <ListSkeleton />}
              {chat.messagesQuery.error && <p role="alert" className="break-words text-sm text-danger">{chat.messagesQuery.error.message}</p>}
              {chat.messagesQuery.data?.pagination.hasMore && (
                <button onClick={chat.loadOlder} className="mx-auto block rounded-xl border border-line bg-surface px-3 py-2 text-sm font-bold text-accent-deep">
                  Load older
                </button>
              )}
              {chat.messages.map((message) => (
                <MessageBubble key={message._id} message={message} mine={message.sender === user.username} />
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
