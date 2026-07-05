"use client";

import { Send } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";

import type { PostComment } from "@/types/social";

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
