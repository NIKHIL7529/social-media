"use client";

import Image from "next/image";
import { Bookmark, BookmarkCheck, Heart, MessageCircle, Send, Share2, ThumbsUp, Trash2, UserCircle, X } from "lucide-react";
import type { ReactNode } from "react";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

import type { Post, PostComment, User } from "@/types/social";

export function PostHeader({
  following,
  isMine,
  onDelete,
  onFollow,
  post,
  working,
}: {
  following: boolean;
  isMine: boolean;
  onDelete: () => void;
  onFollow: () => void;
  post: Post;
  working: boolean;
}) {
  return (
    <header className="flex items-center justify-between gap-4 px-4 pb-3 pt-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        {post.user.photo ? (
          <Image src={post.user.photo} alt={post.user.name} width={46} height={46} className="size-11 rounded-full object-cover" />
        ) : (
          <UserCircle className="size-11 flex-shrink-0 text-slate-400" />
        )}
        <p className="truncate font-bold text-ink">{post.user.name}</p>
      </div>

      {isMine ? (
        <button
          onClick={onDelete}
          disabled={working}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 font-bold text-red-700 disabled:cursor-wait disabled:opacity-60"
        >
          <Trash2 size={16} />
          {working ? "Deleting" : "Delete"}
        </button>
      ) : (
        <button
          onClick={onFollow}
          disabled={working}
          className="min-h-9 rounded-full border border-accent-soft bg-accent-soft px-4 font-bold text-accent-deep disabled:cursor-wait disabled:opacity-60"
        >
          {following ? "Following" : "Follow"}
        </button>
      )}
    </header>
  );
}

export function PostContent({
  expanded,
  onToggleExpanded,
  post,
  visibleText,
}: {
  expanded: boolean;
  onToggleExpanded: () => void;
  post: Post;
  visibleText: string;
}) {
  const canReadMore = (post.text || "").length > 140;
  if (!post.topic && !post.text) return null;

  return (
    <div className="space-y-2 px-4 pt-4 sm:px-5">
      {post.topic && <h2 className="text-base font-extrabold leading-snug text-ink">{post.topic}</h2>}
      {post.text && (
        <p className="break-words text-[0.95rem] leading-6 text-ink-muted">
          {visibleText}
          {canReadMore && (
            <button onClick={onToggleExpanded} className="ml-2 font-bold text-accent-deep underline">
              {expanded ? "Read Less" : "Read More"}
            </button>
          )}
        </p>
      )}
    </div>
  );
}

export function PostActions({
  liked,
  likes,
  onComment,
  onLike,
  onSave,
  onShare,
  onShowLikers,
  saved,
  saving,
  liking,
}: {
  liked: boolean;
  likes: number;
  onComment: () => void;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onShowLikers: () => void;
  saved: boolean;
  saving: boolean;
  liking: boolean;
}) {
  return (
    <footer className="relative flex flex-wrap items-center gap-1 px-3 py-3">
      <IconButton active={liked} label={liked ? "Unlike post" : "Like post"} disabled={liking} onClick={onLike}>
        <ThumbsUp />
      </IconButton>
      <IconButton label="Comment on post" onClick={onComment}>
        <MessageCircle />
      </IconButton>
      <IconButton active={saved} label={saved ? "Remove saved post" : "Save post"} disabled={saving} onClick={onSave}>
        {saved ? <BookmarkCheck /> : <Bookmark />}
      </IconButton>
      <IconButton label="Share post" onClick={onShare}>
        <Share2 />
      </IconButton>
      <button
        onClick={onShowLikers}
        className="ml-auto inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-sm font-bold text-ink-muted hover:bg-accent-soft hover:text-accent-deep"
        aria-label="View people who liked this post"
      >
        <Heart size={16} />
        {likes} likes
      </button>
    </footer>
  );
}

export function LikersDialog({
  onClose,
  onSelectUser,
  query,
}: {
  onClose: () => void;
  onSelectUser: (userId: string) => void;
  query: UseQueryResult<{ status: number; users: User[] }>;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <section className="w-full max-w-sm overflow-hidden rounded-lg border border-line bg-white shadow-card">
        <header className="flex items-center justify-between border-b border-line p-4">
          <h2 className="font-extrabold text-ink">Liked by</h2>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-md hover:bg-accent-soft" aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="max-h-80 overflow-y-auto p-2">
          {query.isLoading && <p className="p-3 text-sm text-ink-muted">Loading...</p>}
          {!query.isLoading && query.data?.users.length === 0 && <p className="p-3 text-sm text-ink-muted">No likes yet.</p>}
          {query.data?.users.map((likedUser) => (
            <button
              key={likedUser._id}
              onClick={() => onSelectUser(likedUser._id)}
              className="flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-left hover:bg-accent-soft"
            >
              {likedUser.photo ? (
                <Image src={likedUser.photo} alt={likedUser.name} width={34} height={34} className="size-9 rounded-full object-cover" />
              ) : (
                <UserCircle className="size-9 text-slate-400" />
              )}
              <span className="font-bold text-ink">{likedUser.name}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export function CommentsPanel({
  comment,
  comments,
  loading,
  mutation,
  onAddComment,
  onCommentChange,
  queryComments,
}: {
  comment: string;
  comments: PostComment[];
  loading: boolean;
  mutation: UseMutationResult<{ status: number; comment: PostComment }, unknown, void>;
  onAddComment: () => void;
  onCommentChange: (value: string) => void;
  queryComments?: PostComment[];
}) {
  const visibleComments = queryComments || comments;
  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="flex min-h-14 items-center gap-2 px-3 py-2">
        <input
          value={comment}
          onChange={(event) => onCommentChange(event.target.value)}
          className="min-h-10 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
          placeholder="Comment here"
        />
        <button
          onClick={onAddComment}
          disabled={mutation.isPending}
          className="grid size-10 place-items-center rounded-md text-accent-deep hover:bg-accent-soft disabled:cursor-wait disabled:opacity-60"
          aria-label="Send comment"
        >
          <Send size={20} />
        </button>
      </div>
      <div className="space-y-2 px-4 pb-4 text-sm text-ink-muted">
        {loading && "Loading comments..."}
        {visibleComments.length
          ? visibleComments.map((item) => (
              <p key={item._id}>
                <strong>{item.sender}</strong> {item.comment}
              </p>
            ))
          : !loading && "No comments yet"}
      </div>
    </section>
  );
}

function IconButton({
  active,
  label,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-10 place-items-center rounded-md disabled:cursor-wait disabled:opacity-60 ${
        active ? "bg-accent-soft text-accent-deep" : "text-ink hover:bg-accent-soft"
      }`}
    >
      <span className="[&_svg]:size-5">{children}</span>
    </button>
  );
}
