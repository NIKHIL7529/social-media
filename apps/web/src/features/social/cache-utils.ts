import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import type { FeedPage, Post } from "@/types/social";

export type PostListResponse = {
  status: number;
  post: Post[];
};

export function setListValue(values: string[] | undefined, value: string, enabled: boolean) {
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

export function updatePostEverywhere(queryClient: QueryClient, postId: string, updater: (post: Post) => Post) {
  queryClient.setQueryData<InfiniteData<FeedPage>>(queryKeys.feed, (data) => updateFeed(data, postId, updater));
  queryClient.setQueryData<PostListResponse>(queryKeys.profilePosts, (data) => updatePostList(data, postId, updater));
  queryClient.setQueriesData<PostListResponse>(userPostsFilter, (data) => updatePostList(data, postId, updater));
  queryClient.setQueryData<PostListResponse>(queryKeys.savedPosts, (data) => updatePostList(data, postId, updater));
}

export function prependPostToLists(queryClient: QueryClient, post: Post) {
  queryClient.setQueryData<InfiniteData<FeedPage>>(queryKeys.feed, (data) => {
    if (!data?.pages.length) return data;
    const [firstPage, ...pages] = data.pages;
    return {
      ...data,
      pages: [{ ...firstPage, post: [post, ...firstPage.post] }, ...pages],
    };
  });
  queryClient.setQueryData<PostListResponse>(queryKeys.profilePosts, (data) =>
    data ? { ...data, post: [post, ...data.post] } : data,
  );
}

export function mapPostsEverywhere(queryClient: QueryClient, updater: (post: Post) => Post) {
  queryClient.setQueryData<InfiniteData<FeedPage>>(queryKeys.feed, (data) =>
    data ? { ...data, pages: data.pages.map((page) => ({ ...page, post: page.post.map(updater) })) } : data,
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

export function removePostEverywhere(queryClient: QueryClient, postId: string) {
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
