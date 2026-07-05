import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import type { FeedPage, Post, User } from "@/types/social";

type PostListResponse = {
  status: number;
  post: Post[];
};

type UserResponse = {
  status: number;
  user: User;
};

function setListValue(values: string[] | undefined, value: string, enabled: boolean) {
  const current = values || [];
  if (enabled) {
    return current.includes(value) ? current : [...current, value];
  }
  return current.filter((item) => item !== value);
}

function updatePostList(data: PostListResponse | undefined, postId: string, updater: (post: Post) => Post) {
  if (!data) return data;
  return {
    ...data,
    post: data.post.map((post) => (post._id === postId ? updater(post) : post)),
  };
}

function updateFeed(data: InfiniteData<FeedPage> | undefined, postId: string, updater: (post: Post) => Post) {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      post: page.post.map((post) => (post._id === postId ? updater(post) : post)),
    })),
  };
}

const userPostsFilter = {
  predicate: (query: { queryKey: readonly unknown[] }) => query.queryKey[0] === "user" && query.queryKey[2] === "posts",
};

function updatePostEverywhere(queryClient: QueryClient, postId: string, updater: (post: Post) => Post) {
  queryClient.setQueryData<InfiniteData<FeedPage>>(queryKeys.feed, (data) => updateFeed(data, postId, updater));
  queryClient.setQueryData<PostListResponse>(queryKeys.profilePosts, (data) => updatePostList(data, postId, updater));
  queryClient.setQueriesData<PostListResponse>(userPostsFilter, (data) => updatePostList(data, postId, updater));
  queryClient.setQueryData<PostListResponse>(queryKeys.savedPosts, (data) => updatePostList(data, postId, updater));
}

function mapPostsEverywhere(queryClient: QueryClient, updater: (post: Post) => Post) {
  queryClient.setQueryData<InfiniteData<FeedPage>>(queryKeys.feed, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({ ...page, post: page.post.map(updater) })),
        }
      : data,
  );
  queryClient.setQueryData<PostListResponse>(queryKeys.profilePosts, (data) =>
    data ? { ...data, post: data.post.map(updater) } : data,
  );
  queryClient.setQueriesData<PostListResponse>(userPostsFilter, (data) =>
    data ? { ...data, post: data.post.map(updater) } : data,
  );
  queryClient.setQueryData<PostListResponse>(queryKeys.savedPosts, (data) =>
    data ? { ...data, post: data.post.map(updater) } : data,
  );
}

function removePostEverywhere(queryClient: QueryClient, postId: string) {
  queryClient.setQueryData<InfiniteData<FeedPage>>(queryKeys.feed, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            post: page.post.filter((post) => post._id !== postId),
          })),
        }
      : data,
  );
  queryClient.setQueryData<PostListResponse>(queryKeys.profilePosts, (data) =>
    data ? { ...data, post: data.post.filter((post) => post._id !== postId) } : data,
  );
  queryClient.setQueriesData<PostListResponse>(userPostsFilter, (data) =>
    data ? { ...data, post: data.post.filter((post) => post._id !== postId) } : data,
  );
  queryClient.setQueryData<PostListResponse>(queryKeys.savedPosts, (data) =>
    data ? { ...data, post: data.post.filter((post) => post._id !== postId) } : data,
  );
}

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
  queryClient.setQueryData<PostListResponse>(queryKeys.savedPosts, (data) => {
    const updated = updatePostList(data, postId, updater);
    if (!updated || saved) return updated;
    return { ...updated, post: updated.post.filter((post) => post._id !== postId) };
  });
}

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
