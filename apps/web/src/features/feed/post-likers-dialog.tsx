"use client";

import Image from "next/image";
import { UserCircle, X } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";

import type { User } from "@/types/social";

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
