"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Pencil, Plus, Send, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

import { AppShell, useCurrentUser } from "@/components/app-shell";
import { localDateTime, relativeTime } from "@/lib/time";
import type { Chat, ChatMessage } from "@/types/social";
import { chatLabel } from "@/features/chat/chat-label";
import { chatService } from "@/features/chat/chat-service";
import { useChatRealtime } from "@/features/chat/use-chat-realtime";
import { useMessageScroll } from "@/features/chat/use-message-scroll";

export default function ChatPage() {
  return (
    <AppShell>
      <ChatWorkspace />
    </AppShell>
  );
}

function ChatWorkspace() {
  const queryClient = useQueryClient();
  const params = useParams<{ id?: string }>();
  const { data: user } = useCurrentUser();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [olderCursor, setOlderCursor] = useState<string | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [renamingGroup, setRenamingGroup] = useState(false);
  const [groupNameDraft, setGroupNameDraft] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Array<{ user: string }>>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, Record<string, boolean>>>({});

  const chatsQuery = useQuery({
    queryKey: ["chat", "list"],
    queryFn: chatService.getChats,
    enabled: Boolean(user),
  });
  const chats = chatsQuery.data?.chats || [];
  const activeChat = useMemo(
    () => chats.find((chat) => chat.chatId === activeChatId) || chats[0] || null,
    [activeChatId, chats],
  );
  const resolvedActiveChatId = activeChat?.chatId || null;

  useEffect(() => {
    if (params.id) {
      setActiveChatId(params.id);
    }
  }, [params.id]);

  const messagesQuery = useQuery({
    queryKey: ["chat", "messages", resolvedActiveChatId],
    queryFn: () => chatService.getMessages(resolvedActiveChatId as string),
    enabled: Boolean(resolvedActiveChatId),
  });
  const messages = messagesQuery.data?.messages.messages || [];
  const messageListRef = useMessageScroll({
    dependency: `${resolvedActiveChatId || ""}:${messages.length}`,
  });

  function updateChatPreview(chatId: string, message: ChatMessage, incrementUnread: boolean) {
    queryClient.setQueryData<{ status: number; chats: Chat[]; user: string }>(["chat", "list"], (current) => {
      if (!current) return current;
      const chats = current.chats
        .map((chat) =>
          chat.chatId === chatId
            ? {
                ...chat,
                lastMessage: {
                  message: message.message,
                  sender: message.sender,
                  createdAt: message.createdAt || message.updatedAt,
                },
                updatedAt: message.updatedAt || message.createdAt,
                unreadCount: incrementUnread ? (chat.unreadCount || 0) + 1 : 0,
              }
            : chat,
        )
        .sort((first, second) => new Date(second.updatedAt || 0).getTime() - new Date(first.updatedAt || 0).getTime());
      return { ...current, chats };
    });
  }

  const realtime = useChatRealtime({
    enabled: Boolean(user),
    activeChatId: resolvedActiveChatId,
    onOnlineUsers: setOnlineUsers,
    onGroup: (chat) => {
      queryClient.setQueryData<{ status: number; chats: Chat[]; user: string }>(["chat", "list"], (current) => {
        if (!current || current.chats.some((item) => item.chatId === chat.chatId)) return current;
        return { ...current, chats: [chat, ...current.chats] };
      });
    },
    onTyping: ({ chatId, user: typingUser, isTyping }) => {
      if (typingUser === user?.name) return;
      setTypingUsers((current) => {
        const chatTyping = { ...(current[chatId] || {}) };
        if (isTyping) chatTyping[typingUser] = true;
        else delete chatTyping[typingUser];
        return { ...current, [chatId]: chatTyping };
      });
    },
    onMessage: (message) => {
      const isActiveChat = message.chatId === resolvedActiveChatId;
      if (isActiveChat) {
        queryClient.setQueryData<Awaited<ReturnType<typeof chatService.getMessages>>>(
          ["chat", "messages", message.chatId],
          (current) => {
            if (!current) return current;
            if (current.messages.messages.some((item) => item._id === message._id)) return current;
            return {
              ...current,
              messages: {
                ...current.messages,
                messages: [...current.messages.messages, message],
              },
            };
          },
        );
        chatService.markRead(message.chatId).catch(() => undefined);
      }
      updateChatPreview(message.chatId, message, !isActiveChat);
    },
  });

  useEffect(() => {
    if (!resolvedActiveChatId || !messages.length) return;
    chatService.markRead(resolvedActiveChatId).catch(() => undefined);
    queryClient.setQueryData<{ status: number; chats: Chat[]; user: string }>(["chat", "list"], (current) => {
      if (!current) return current;
      return {
        ...current,
        chats: current.chats.map((chat) =>
          chat.chatId === resolvedActiveChatId ? { ...chat, unreadCount: 0 } : chat,
        ),
      };
    });
  }, [messages.length, queryClient, resolvedActiveChatId]);

  const sendMutation = useMutation({
    mutationFn: () =>
      chatService.sendMessage({
        conversationId: resolvedActiveChatId,
        receiver: activeChat?.users || [],
        message: draft,
      }),
    onSuccess: (data) => {
      const savedMessage = data.message.messages[data.message.messages.length - 1];
      if (resolvedActiveChatId && savedMessage) {
        queryClient.setQueryData<Awaited<ReturnType<typeof chatService.getMessages>>>(
          ["chat", "messages", resolvedActiveChatId],
          (current) => {
            if (!current || current.messages.messages.some((item) => item._id === savedMessage._id)) return current;
            return {
              ...current,
              messages: {
                ...current.messages,
                messages: [...current.messages.messages, savedMessage],
              },
            };
          },
        );
        realtime.send({
          type: "message",
          chatId: resolvedActiveChatId,
          message: savedMessage,
        });
        updateChatPreview(resolvedActiveChatId, savedMessage, false);
      }
      setDraft("");
      if (resolvedActiveChatId) {
        realtime.send({
          type: "typing",
          chatId: resolvedActiveChatId,
          isTyping: false,
        });
      }
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Message failed"),
  });
  const renameGroupMutation = useMutation({
    mutationFn: () =>
      chatService.renameGroup({
        chatId: resolvedActiveChatId || "",
        name: groupNameDraft,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData<{ status: number; chats: Chat[]; user: string }>(["chat", "list"], (current) => {
        if (!current) return current;
        return {
          ...current,
          chats: current.chats.map((chat) =>
            chat.chatId === data.group.chatId ? { ...chat, name: data.group.name } : chat,
          ),
        };
      });
      setRenamingGroup(false);
      toast.success("Group updated");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not rename group"),
  });

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    if (!activeChat) {
      toast("Choose a conversation first");
      return;
    }
    sendMutation.mutate();
  }

  async function loadOlder() {
    if (!resolvedActiveChatId || !messagesQuery.data?.pagination.hasMore) return;
    try {
      const page = await chatService.getMessages(resolvedActiveChatId, {
        before: olderCursor || messagesQuery.data.pagination.nextCursor,
        limit: 50,
      });
      setOlderCursor(page.pagination.nextCursor);
      queryClient.setQueryData(["chat", "messages", resolvedActiveChatId], {
        ...page,
        messages: {
          ...page.messages,
          messages: [...page.messages.messages, ...messages],
        },
        pagination: page.pagination,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load older messages");
    }
  }

  if (!user) {
    return (
      <section className="mx-auto w-full max-w-feed rounded-lg border border-line bg-white p-5 shadow-card">
        <h1 className="text-2xl font-extrabold text-ink">Messages</h1>
          <p className="mt-2 text-ink-muted">Login to view your conversations and live status.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto grid h-[calc(100dvh-var(--nav-height)-24px-var(--bottom-nav-height))] w-full max-w-6xl grid-rows-[minmax(170px,34dvh)_1fr] overflow-hidden rounded-lg border border-line bg-white shadow-card lg:h-[calc(100vh-var(--nav-height)-48px)] lg:grid-cols-[320px_1fr] lg:grid-rows-1">
      <aside className="min-h-0 border-b border-line lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between border-b border-line p-4">
          <div>
            <h1 className="text-xl font-extrabold text-ink">Messages</h1>
            <p className="text-sm text-ink-muted">
              {chats.length} conversations · {realtime.status}
            </p>
          </div>
          <button
            onClick={() => setShowGroupForm((value) => !value)}
            className="grid size-10 place-items-center rounded-md text-accent-deep hover:bg-accent-soft"
            aria-label="Create group"
            title="Create group"
          >
            <Plus />
          </button>
        </div>
        {showGroupForm && (
          <GroupForm
            onDone={(chat) => {
              setShowGroupForm(false);
              if (chat) {
                realtime.send({
                  type: "group",
                  users: chat.users,
                  chat,
                });
              }
            }}
          />
        )}
        <div className="h-[calc(100%-73px)] overflow-y-auto">
          {chatsQuery.isLoading && <p className="p-4 text-sm text-ink-muted">Loading chats...</p>}
          {chats.map((chat) => (
            <button
              key={chat.chatId}
              onClick={() => {
                setActiveChatId(chat.chatId);
                setOlderCursor(null);
              }}
              className={`flex w-full items-start gap-3 border-b border-line p-4 text-left hover:bg-accent-soft ${
                activeChat?.chatId === chat.chatId ? "bg-accent-soft" : ""
              }`}
            >
              <span className="grid size-10 flex-shrink-0 place-items-center rounded-full bg-slate-100 text-accent-deep">
                {chat.group ? <Users size={19} /> : <MessageCircle size={19} />}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 truncate font-bold text-ink">
                  {!chat.group && <PresenceDot online={chat.users.some((chatUser) => onlineUsers.some((online) => online.user === chatUser))} />}
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
          ))}
          {!chatsQuery.isLoading && chats.length === 0 && <p className="p-4 text-sm text-ink-muted">No conversations yet.</p>}
        </div>
      </aside>

      <main className="flex min-h-0 flex-col">
        {activeChat ? (
          <>
            <header className="border-b border-line p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex min-w-0 items-center gap-2 font-extrabold text-ink">
                  {!activeChat.group && <PresenceDot online={activeChat.users.some((chatUser) => onlineUsers.some((online) => online.user === chatUser))} />}
                  <span className="truncate">{chatLabel(activeChat)}</span>
                </h2>
                {activeChat.group && (
                  <button
                    type="button"
                    onClick={() => {
                      setGroupNameDraft(activeChat.name || "");
                      setRenamingGroup((value) => !value);
                    }}
                    className="grid size-9 place-items-center rounded-md text-accent-deep hover:bg-accent-soft"
                    aria-label="Rename group"
                    title="Rename group"
                  >
                    <Pencil size={17} />
                  </button>
                )}
              </div>
              <p className="text-sm text-ink-muted">
                {activeChat.group ? "Group chat" : activeChat.users.some((chatUser) => onlineUsers.some((online) => online.user === chatUser)) ? "Online" : "Offline"}
                {typingText(typingUsers[activeChat.chatId]) ? ` · ${typingText(typingUsers[activeChat.chatId])}` : ""}
              </p>
              {renamingGroup && activeChat.group && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    renameGroupMutation.mutate();
                  }}
                  className="mt-3 flex gap-2"
                >
                  <input
                    value={groupNameDraft}
                    onChange={(event) => setGroupNameDraft(event.target.value)}
                    className="min-h-10 min-w-0 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
                    placeholder="Group name optional"
                  />
                  <button className="min-h-10 rounded-md bg-accent px-3 text-sm font-bold text-white">Save</button>
                </form>
              )}
            </header>
            <div ref={messageListRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
              {messagesQuery.data?.pagination.hasMore && (
                <button onClick={loadOlder} className="mx-auto block rounded-md border border-line bg-white px-3 py-2 text-sm font-bold text-accent-deep">
                  Load older
                </button>
              )}
              {messages.map((message) => (
                <MessageBubble key={message._id} message={message} mine={message.sender === user.name} />
              ))}
            </div>
            <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
              <input
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  if (resolvedActiveChatId) {
                    realtime.send({
                      type: "typing",
                      chatId: resolvedActiveChatId,
                      isTyping: event.target.value.length > 0,
                    });
                  }
                }}
                onBlur={() => {
                  if (resolvedActiveChatId) {
                    realtime.send({
                      type: "typing",
                      chatId: resolvedActiveChatId,
                      isTyping: false,
                    });
                  }
                }}
                className="min-h-11 min-w-0 flex-1 rounded-md border border-line px-3 outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
                placeholder="Message"
              />
              <button disabled={sendMutation.isPending} className="grid size-11 place-items-center rounded-md bg-accent text-white disabled:cursor-wait disabled:opacity-60" aria-label="Send message">
                <Send size={19} />
              </button>
            </form>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-6 text-center text-ink-muted">Select a conversation to start messaging.</div>
        )}
      </main>
    </section>
  );
}

function MessageBubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
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

function PresenceDot({ online }: { online: boolean }) {
  return <span className={`size-2 flex-shrink-0 rounded-full ${online ? "bg-emerald-500" : "bg-slate-300"}`} aria-hidden="true" />;
}

function typingText(users?: Record<string, boolean>) {
  const names = Object.keys(users || {});
  if (!names.length) return "";
  return `${names.join(", ")} ${names.length === 1 ? "is" : "are"} typing`;
}

function GroupForm({ onDone }: { onDone: (chat?: Chat) => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const followingsQuery = useQuery({
    queryKey: ["chat", "followings"],
    queryFn: chatService.getFollowings,
  });
  const followings = followingsQuery.data?.followings[0]?.followings || [];
  const mutation = useMutation({
    mutationFn: () =>
      chatService.createGroup({
        name,
        users: members,
      }),
    onSuccess: (data) => {
      toast.success("Group created");
      queryClient.invalidateQueries({ queryKey: ["chat", "list"] });
      onDone(data.addGroup);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Group creation failed"),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
      className="space-y-3 border-b border-line p-4"
    >
      <input value={name} onChange={(event) => setName(event.target.value)} className="min-h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft" placeholder="Group name optional" />
      <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-line p-2">
        {followingsQuery.isLoading && <p className="p-2 text-sm text-ink-muted">Loading followings...</p>}
        {!followingsQuery.isLoading && followings.length === 0 && <p className="p-2 text-sm text-ink-muted">Follow people to add them to groups.</p>}
        {followings.map((member) => (
          <label key={member} className="flex min-h-9 items-center gap-2 rounded-md px-2 text-sm font-bold text-ink hover:bg-accent-soft">
            <input
              type="checkbox"
              checked={members.includes(member)}
              onChange={(event) =>
                setMembers((current) =>
                  event.target.checked ? [...current, member] : current.filter((item) => item !== member),
                )
              }
              className="size-4 accent-accent"
            />
            {member}
          </label>
        ))}
      </div>
      <button disabled={mutation.isPending || members.length === 0} className="min-h-10 w-full rounded-md bg-accent text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
        Create group
      </button>
    </form>
  );
}
