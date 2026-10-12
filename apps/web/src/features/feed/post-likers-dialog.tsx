"use client";

import { Modal } from "@/components/modal";
import type { UseQueryResult } from "@tanstack/react-query";

import type { User } from "@/types/social";
import { UserAvatar } from "@/components/user-avatar";
import Link from "next/link";
import { ListSkeleton } from "@/components/skeletons";

export function LikersDialog({
  onClose,
  query,
}: {
  onClose: () => void;
  query: UseQueryResult<{ status: number; users: User[] }>;
}) {
  return (
    <Modal title="Liked by" onClose={onClose}>
        <div className="max-h-80 overflow-y-auto p-2">
          {query.isLoading && <ListSkeleton />}
          {query.error && <p role="alert" className="break-words p-3 text-sm text-danger">{query.error.message}</p>}
          {!query.isLoading && !query.error && query.data?.users.length === 0 && <p className="p-3 text-sm text-ink-muted">No likes yet.</p>}
          {query.data?.users.map((likedUser) => (
            <Link
              key={likedUser._id}
              href={`/user/${likedUser._id}`}
              onClick={onClose}
              className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left hover:bg-accent-soft"
            >
              <UserAvatar name={likedUser.name} photo={likedUser.photo} size={36} />
              <span className="font-bold text-ink">{likedUser.name}</span>
            </Link>
          ))}
        </div>
    </Modal>
  );
}
