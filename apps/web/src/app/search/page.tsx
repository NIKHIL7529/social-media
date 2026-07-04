"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search, UserCircle } from "lucide-react";
import toast from "react-hot-toast";

import { AppShell } from "@/components/app-shell";
import { jsonPost } from "@/lib/api";
import type { User } from "@/types/social";

export default function SearchPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const data = await toast.promise(
        jsonPost<{ status: number; search_users: User[] }, { name: string }>("/api/user/search", { name }),
        {
          loading: "Searching...",
          success: "Search complete",
          error: (error) => error.message || "Search failed",
        },
      );
      setUsers(data.search_users);
    } catch {
      // toast.promise already renders the actionable error.
    }
  }

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-feed">
        <form onSubmit={submit} className="flex gap-2">
          <input value={name} onChange={(event) => setName(event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-md border border-line bg-white px-3 outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft" placeholder="Search users" />
          <button aria-label="Search" className="grid size-11 place-items-center rounded-md bg-accent text-white">
            <Search size={19} />
          </button>
        </form>
        <div className="mt-5 space-y-3">
          {users.map((user) => (
            <button
              key={user._id}
              onClick={() => router.push(`/user/${user._id}`)}
              className="flex w-full items-center gap-3 rounded-lg border border-line bg-white p-4 text-left shadow-soft hover:bg-accent-soft"
            >
              {user.photo ? <Image src={user.photo} alt={user.name} width={44} height={44} className="size-11 rounded-full object-cover" /> : <UserCircle className="size-11 text-slate-400" />}
              <p className="font-bold text-ink">{user.name}</p>
            </button>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
