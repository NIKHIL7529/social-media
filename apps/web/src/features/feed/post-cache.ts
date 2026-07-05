import type { QueryClient } from "@tanstack/react-query";

import {
  prependPostToLists,
  removePostEverywhere,
  setListValue,
  type PostListResponse,
  updatePostEverywhere,
} from "@/features/social/cache-utils";
import { queryKeys } from "@/lib/query-keys";
import type { Post, User } from "@/types/social";

export function applyPostLike(queryClient: QueryClient, postId: string, liked: boolean, likes: number) {
  queryClient.setQueryData<User | null>(queryKeys.authProfile, (user) =>
    user ? { ...user, liked: setListValue(user.liked, postId, liked) } : user,
  );
  updatePostEverywhere(queryClient, postId, (post) => ({ ...post, likes }));
  queryClient.invalidateQueries({ queryKey: queryKeys.postLikedBy(postId) });
}

export function applyPostSave(queryClient: QueryClient, postId: string, saved: boolean, savedCount: number) {
  queryClient.setQueryData<User | null>(queryKeys.authProfile, (user) =>
    user ? { ...user, saved: setListValue(user.saved, postId, saved) } : user,
  );
  const updater = (post: Post) => ({ ...post, saved: savedCount });
  updatePostEverywhere(queryClient, postId, updater);
  if (saved) queryClient.invalidateQueries({ queryKey: queryKeys.savedPosts });
  queryClient.setQueryData<PostListResponse>(queryKeys.savedPosts, (data) => {
    const updated = data
      ? {
          ...data,
          post: data.post.map((post) => (post._id === postId ? updater(post) : post)),
        }
      : data;
    if (!updated || saved) return updated;
    return { ...updated, post: updated.post.filter((post) => post._id !== postId) };
  });
}

export function removePostFromCaches(queryClient: QueryClient, postId: string) {
  queryClient.setQueryData<User | null>(queryKeys.authProfile, (user) =>
    user
      ? {
          ...user,
          liked: setListValue(user.liked, postId, false),
          saved: setListValue(user.saved, postId, false),
        }
      : user,
  );
  removePostEverywhere(queryClient, postId);
  queryClient.removeQueries({ queryKey: queryKeys.postRoot(postId) });
}

export function addPostToCaches(queryClient: QueryClient, post: Post) {
  prependPostToLists(queryClient, post);
}

export function applyPostComment(queryClient: QueryClient, postId: string, commentCount: number) {
  updatePostEverywhere(queryClient, postId, (post) => ({ ...post, commentCount }));
  queryClient.invalidateQueries({ queryKey: queryKeys.postComments(postId) });
}

export function applyPostShare(queryClient: QueryClient, postId: string, share: number) {
  updatePostEverywhere(queryClient, postId, (post) => ({ ...post, share }));
}
