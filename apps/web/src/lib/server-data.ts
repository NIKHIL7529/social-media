import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

import { ApiError, requestApi } from "@/lib/api";
import { createQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { getApiOrigin } from "@/lib/api-origin";
import type { FeedPage, User } from "@/types/social";

// React cache scopes this client to one server request, never across users.
export const getServerQueryClient = cache(createQueryClient);

export const prefetchCurrentUser = cache(async () => {
  const client = getServerQueryClient();
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    client.setQueryData(queryKeys.authProfile, null);
    return;
  }
  await client.prefetchQuery({
    queryKey: queryKeys.authProfile,
    retry: false,
    queryFn: async () => {
      try {
        const data = await requestApi<{ status: number; user: User }>(getApiOrigin(), "/api/user/profile", {
          headers: { Cookie: `token=${token}` },
          signal: AbortSignal.timeout(10_000),
        });
        return data.user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
  });
});

export async function prefetchFeed() {
  await getServerQueryClient().prefetchInfiniteQuery({
    queryKey: queryKeys.feed,
    initialPageParam: null as string | null,
    retry: false,
    queryFn: ({ pageParam, signal }) => requestApi<FeedPage>(getApiOrigin(), "/api/post", {
      method: "POST",
      body: JSON.stringify({ cursor: pageParam, limit: 10 }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]),
    }),
    getNextPageParam: (lastPage: FeedPage) => lastPage.pagination.nextCursor,
  });
}
