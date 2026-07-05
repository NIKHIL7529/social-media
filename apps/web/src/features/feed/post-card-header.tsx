"use client";

import Image from "next/image";
import { Trash2, UserCircle } from "lucide-react";

import type { Post } from "@/types/social";

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
