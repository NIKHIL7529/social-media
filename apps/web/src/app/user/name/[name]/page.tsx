"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import { userService } from "@/features/users/user-service";
import { queryKeys } from "@/lib/query-keys";

export default function UserByNamePage() {
  const { name } = useParams<{ name: string }>();
  const router = useRouter();
  const userQuery = useQuery({
    queryKey: queryKeys.userByName(name),
    queryFn: () => userService.getByName(decodeURIComponent(name)),
    enabled: Boolean(name),
  });

  useEffect(() => {
    if (userQuery.data?.user._id) {
      router.replace(`/user/${userQuery.data.user._id}`);
    }
  }, [router, userQuery.data?.user._id]);

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-feed rounded-lg border border-line bg-white p-5 shadow-card">
        {userQuery.isLoading && <p className="text-ink-muted">Opening profile...</p>}
        {userQuery.error && <p className="text-ink-muted">User not found.</p>}
      </section>
    </AppShell>
  );
}
