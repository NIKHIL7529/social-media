"use client";

import { Modal } from "@/components/modal";
import Link from "next/link";

type Props = {
  title: string;
  users: string[];
  onClose: () => void;
};

export function UserListDialog({ title, users, onClose }: Props) {
  return (
    <Modal title={title} onClose={onClose}>
        <div className="max-h-80 overflow-y-auto p-2">
          {users.length === 0 && <p className="p-3 text-sm text-ink-muted">No users yet.</p>}
          {users.map((name) => (
            <Link
              key={name}
              href={`/user/name/${encodeURIComponent(name)}`}
              onClick={onClose}
              className="flex min-h-11 w-full items-center rounded-xl px-3 text-left font-bold text-ink hover:bg-accent-soft"
            >
              {name}
            </Link>
          ))}
        </div>
    </Modal>
  );
}
