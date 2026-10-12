"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Bookmark } from "lucide-react";

import { useCurrentUser } from "@/features/auth/use-current-user";
import { postService } from "@/features/feed/post-service";
import { queryKeys } from "@/lib/query-keys";
import { PostList } from "@/features/feed/post-list";
import { FeedSkeleton } from "@/features/feed/feed-skeleton";
import { QueryError } from "@/components/query-error";
import { LoginRequired } from "@/components/login-required";

export default function SavedPostsScreen() {
  const { data: user, isLoading: isLoadingUser, error: userError } = useCurrentUser();
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.savedPosts,
    queryFn: ({ signal }) => postService.getSavedPosts(signal),
    enabled: Boolean(user),
  });
  if (!isLoadingUser && !userError && !user) return <LoginRequired message="to view your saved posts." />;

  return (
      <section className="mx-auto w-full min-w-0">
        <h1 className="mb-4 border-b border-line pb-4 text-2xl font-extrabold text-ink">Saved posts</h1>
        {(isLoadingUser || isLoading) && <FeedSkeleton />}
        {user && <QueryError error={error} onRetry={() => refetch()} retrying={isFetching} />}
        {user && <PostList posts={data?.post || []} />}
        {user && !error && data && data.post.length === 0 && (
          <div className="surface-card p-8 text-center">
            <Bookmark className="mx-auto mb-4 text-accent" size={28} />
            <h2 className="font-bold">No saved posts yet</h2>
            <p className="mt-2 text-sm text-ink-muted">Save a post to revisit it here.</p>
            <Link href="/posts" className="action-secondary mt-5">Explore posts</Link>
          </div>
        )}
      </section>
  );
}
