import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import type { User } from "@/types/social";

export function clearSessionCaches(queryClient: QueryClient) {
  queryClient.setQueryData<User | null>(queryKeys.authProfile, null);
  queryClient.removeQueries({ queryKey: queryKeys.profilePosts });
  queryClient.removeQueries({ queryKey: queryKeys.savedPosts });
  queryClient.removeQueries({ queryKey: queryKeys.chatList });
  queryClient.removeQueries({ queryKey: ["chat", "messages"] });
  queryClient.removeQueries({ queryKey: queryKeys.chatFollowings });
  queryClient.removeQueries({ queryKey: queryKeys.notifications });
}

export function resetSessionForLogin(queryClient: QueryClient, user: User) {
  clearSessionCaches(queryClient);
  queryClient.setQueryData(queryKeys.authProfile, user);
  queryClient.invalidateQueries({ queryKey: queryKeys.feed });
}
