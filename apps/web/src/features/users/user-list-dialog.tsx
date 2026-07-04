"use client";

import { X } from "lucide-react";

type Props = {
  title: string;
  users: string[];
  onClose: () => void;
  onUserClick?: (name: string) => void;
};

export function UserListDialog({ title, users, onClose, onUserClick }: Props) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <section className="w-full max-w-sm overflow-hidden rounded-lg border border-line bg-white shadow-card">
        <header className="flex items-center justify-between border-b border-line p-4">
          <h2 className="font-extrabold text-ink">{title}</h2>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-md hover:bg-accent-soft" aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="max-h-80 overflow-y-auto p-2">
          {users.length === 0 && <p className="p-3 text-sm text-ink-muted">No users yet.</p>}
          {users.map((name) => (
            <button
              key={name}
              onClick={() => onUserClick?.(name)}
              className="flex min-h-11 w-full items-center rounded-md px-3 text-left font-bold text-ink hover:bg-accent-soft"
            >
              {name}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
