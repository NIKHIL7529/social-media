"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { userService } from "@/features/users/user-service";
import { useCurrentUser } from "@/features/auth/use-current-user";
import { queryKeys } from "@/lib/query-keys";
import { QueryError } from "@/components/query-error";
import { UserAvatar } from "@/components/user-avatar";
import { ListSkeleton } from "@/components/skeletons";

export default function SearchScreen() {
  const { data: viewer, isLoading: loadingViewer } = useCurrentUser();
  const [name, setName] = useState("");
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const search = useQuery({
    queryKey: queryKeys.searchUsers(submittedName, viewer?._id),
    queryFn: ({ signal }) => userService.search(submittedName || "", signal),
    enabled: submittedName !== null && !loadingViewer,
  });
  const searching = search.isFetching;
  const users = search.data?.search_users || [];

  function submit(event: FormEvent) {
    event.preventDefault();
    if (searching) return;
    const term = name.trim();
    if (submittedName === term) void search.refetch();
    else setSubmittedName(term);
  }

  return (
      <section className="mx-auto w-full max-w-feed">
        <header className="mb-6"><p className="text-xs font-bold uppercase tracking-widest text-accent">Discover</p><h1 className="mt-2 text-3xl font-extrabold">Find your people</h1><p className="mt-2 text-sm text-ink-muted">Search for someone and explore their moments.</p></header>
        <form onSubmit={submit} className="flex gap-2">
          <input aria-label="Search users" value={name} onChange={(event) => setName(event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft" placeholder="Search users" />
          <button disabled={searching} aria-label="Search" className="grid size-11 place-items-center rounded-xl bg-accent text-accent-contrast disabled:opacity-60">
            <Search size={19} />
          </button>
        </form>
        <div className="mt-5 space-y-3">
          {searching && <ListSkeleton />}
          <QueryError error={search.error} onRetry={() => search.refetch()} retrying={searching} />
          {search.isSuccess && users.length === 0 && <p className="text-sm text-ink-muted">No people found. Try another name.</p>}
          {users.map((user) => (
            <Link
              key={user._id}
              href={`/user/${user._id}`}
              className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-left shadow-soft hover:bg-accent-soft"
            >
              <UserAvatar name={user.name} photo={user.photo} />
              <p className="font-bold text-ink">{user.name}</p>
            </Link>
          ))}
        </div>
      </section>
  );
}
