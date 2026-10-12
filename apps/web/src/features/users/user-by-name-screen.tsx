"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { userService } from "@/features/users/user-service";
import { queryKeys } from "@/lib/query-keys";
import { ProfileSkeleton } from "@/components/skeletons";

export default function UserByNameScreen({ name }: { name: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userQuery = useQuery({
    queryKey: queryKeys.userByName(name),
    queryFn: ({ signal }) => userService.getByName(name, signal),
    enabled: Boolean(name),
  });

  useEffect(() => {
    if (userQuery.data?.user._id) {
      const key = queryKeys.user(userQuery.data.user._id);
      if ((queryClient.getQueryState(key)?.dataUpdatedAt || 0) < userQuery.dataUpdatedAt) {
        queryClient.setQueryData(key, userQuery.data, { updatedAt: userQuery.dataUpdatedAt });
      }
      router.replace(`/user/${userQuery.data.user._id}`);
    }
  }, [queryClient, router, userQuery.data, userQuery.dataUpdatedAt]);

  return (
      <section className="mx-auto w-full max-w-feed rounded-2xl border border-line bg-surface p-5 shadow-card">
        {userQuery.isLoading && <ProfileSkeleton />}
        {userQuery.error && <p role="alert" className="break-words text-danger">{userQuery.error.message}</p>}
      </section>
  );
}
