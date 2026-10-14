"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Plus, RefreshCw } from "lucide-react";

import { useCurrentUser } from "@/features/auth/use-current-user";
import { queryKeys } from "@/lib/query-keys";
import { PostList } from "./post-list";
import { postService } from "./post-service";
import { FeedSkeleton } from "./feed-skeleton";

export function Feed() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { data: user } = useCurrentUser();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isFetching,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: queryKeys.feed,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) => postService.getFeed({ cursor: pageParam, limit: 10, signal }),
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
  });

  const posts = data?.pages.flatMap((page) => page.post) || [];

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && !error) {
          fetchNextPage();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching, error]);

  return (
    <section className="mx-auto w-full min-w-0" aria-labelledby="feed-title">
      <header className="page-banner mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-extrabold uppercase text-accent">Your daily orbit</span>
          <h1 id="feed-title" className="mt-1 text-2xl font-extrabold leading-tight tracking-normal text-ink sm:text-[1.65rem]">
            Your daily scroll
          </h1>
        </div>
        {user && (
          <Link href="/addPost" className="action-primary shrink-0">
            <Plus size={18} />
            New post
          </Link>
        )}
      </header>

      {isLoading && (
        <>
          <FeedSkeleton />
          <FeedSkeleton />
        </>
      )}

      {!isLoading && error && !isFetchNextPageError && (
        <div role="alert" className="mb-5 rounded border border-danger/30 bg-surface px-6 py-6">
          <h2 className="text-lg font-extrabold">Feed unavailable</h2>
          <p className="mt-2 break-words text-danger">{error instanceof Error ? error.message : "Unable to load posts."}</p>
          <button onClick={() => refetch()} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded bg-accent px-4 font-bold text-accent-contrast">
            <RefreshCw size={17} />
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div className="rounded border border-dashed border-line bg-surface px-6 py-12 text-center">
          <h2 className="text-lg font-extrabold">No posts yet</h2>
          <p className="mt-2 text-ink-muted">Start the conversation by publishing the first post.</p>
        </div>
      )}

      <PostList posts={posts} />

      <div ref={sentinelRef} className="h-4" />
      {isFetchNextPageError && (
        <div role="alert" className="mb-5 rounded border border-danger/30 bg-surface p-5">
          <p className="break-words text-danger">{error instanceof Error ? error.message : "Unable to load more posts."}</p>
          <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded bg-accent px-4 font-bold text-accent-contrast disabled:opacity-60">
            <RefreshCw size={17} /> Try again
          </button>
        </div>
      )}
      {isFetchingNextPage && <FeedSkeleton />}
      {!isLoading && !error && !hasNextPage && posts.length > 0 && <p className="my-4 text-center text-sm text-ink-muted">You are all caught up.</p>}
    </section>
  );
}
