"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";

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
    <header className="post-header flex items-center justify-between gap-4 px-4 pb-3 pt-4 sm:px-5">
      <Link href={`/user/${post.user._id}`} className="flex min-w-0 items-center gap-3 hover:text-accent">
        <UserAvatar name={post.user.name} photo={post.user.photo} />
        <p className="truncate font-bold text-ink">{post.user.name}</p>
      </Link>

      {isMine ? (
        <button
          onClick={onDelete}
          disabled={working}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-danger/20 bg-danger-soft px-3 font-bold text-danger disabled:cursor-wait disabled:opacity-60"
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
