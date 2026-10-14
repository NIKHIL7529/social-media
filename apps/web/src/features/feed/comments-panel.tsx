"use client";

import { Send } from "lucide-react";
import type { UseMutationResult } from "@tanstack/react-query";

import type { PostComment } from "@/types/social";
import { ListSkeleton } from "@/components/skeletons";

export function CommentsPanel({
  comment,
  comments,
  loading,
  mutation,
  onAddComment,
  onCommentChange,
  error,
}: {
  comment: string;
  comments: PostComment[];
  loading: boolean;
  mutation: UseMutationResult<{ status: number; comment: PostComment }, unknown, void>;
  onAddComment: () => void;
  onCommentChange: (value: string) => void;
  error?: unknown;
}) {
  return (
    <section className="border-t border-line bg-surface-raised">
      <div className="flex min-h-14 items-center gap-2 px-3 py-2">
        <input
          value={comment}
          onChange={(event) => onCommentChange(event.target.value)}
          className="min-h-10 min-w-0 flex-1 rounded border border-line bg-surface px-3 outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
          placeholder="Comment here"
        />
        <button
          onClick={onAddComment}
          disabled={mutation.isPending}
          className="grid size-10 place-items-center rounded text-accent-deep hover:bg-accent-soft disabled:cursor-wait disabled:opacity-60"
          aria-label="Send comment"
        >
          <Send size={20} />
        </button>
      </div>
      <div className="space-y-2 px-4 pb-4 text-sm text-ink-muted">
        {loading && <ListSkeleton />}
        {Boolean(error) && <p role="alert" className="break-words text-danger">{error instanceof Error ? error.message : "Unable to load comments."}</p>}
        {Boolean(mutation.error) && <p role="alert" className="break-words text-danger">{mutation.error instanceof Error ? mutation.error.message : "Unable to add your comment."}</p>}
        {comments.length
          ? comments.map((item) => (
              <p key={item._id} className="break-words">
                <strong>{item.sender}</strong> {item.comment}
              </p>
            ))
          : !loading && !error && "No comments yet"}
      </div>
    </section>
  );
}
