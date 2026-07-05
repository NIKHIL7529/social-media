import type { QueryClient } from "@tanstack/react-query";

import { mapPostsEverywhere, setListValue } from "@/features/social/cache-utils";
import { queryKeys } from "@/lib/query-keys";
import type { Post, User } from "@/types/social";

type UserResponse = {
  status: number;
  user: User;
};

export function applyFollow(queryClient: QueryClient, targetName: string, currentUserName: string, following: boolean, targetUser?: User) {
  queryClient.setQueryData<User | null>(queryKeys.authProfile, (user) =>
    user ? { ...user, followings: setListValue(user.followings, targetName, following) } : user,
  );

  const updateAuthor = (post: Post) =>
    post.user.name === targetName
      ? {
          ...post,
          user: {
            ...post.user,
            followers: setListValue(post.user.followers, currentUserName, following),
          },
        }
      : post;

  mapPostsEverywhere(queryClient, updateAuthor);
  queryClient.setQueriesData<UserResponse>({ predicate: (query) => query.queryKey[0] === "user" && query.queryKey.length === 2 }, (data) => {
    if (!data?.user || data.user.name !== targetName) return data;
    return {
      ...data,
      user: targetUser || {
        ...data.user,
        followers: setListValue(data.user.followers, currentUserName, following),
      },
    };
  });
  queryClient.invalidateQueries({ queryKey: queryKeys.chatFollowings });
}
