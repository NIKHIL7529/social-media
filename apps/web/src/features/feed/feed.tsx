"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Plus, RefreshCw } from "lucide-react";

import { useCurrentUser } from "@/components/app-shell";
import { queryKeys } from "@/lib/query-keys";
import { PostCard } from "./post-card";
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
        if (entries[0].isIntersecting && !isFetching) {
          fetchNextPage();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching]);

  return (
    <section className="mx-auto min-h-[calc(100vh-var(--nav-height))] w-full max-w-feed" aria-labelledby="feed-title">
      <header className="mb-4 flex items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <span className="text-xs font-extrabold uppercase text-accent">Community</span>
          <h1 id="feed-title" className="mt-1 text-2xl font-extrabold leading-tight tracking-normal text-ink sm:text-[1.65rem]">
            Latest posts
          </h1>
        </div>
        {user && (
          <Link href="/addPost" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-accent px-3 font-bold text-white">
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

      {!isLoading && error && posts.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-extrabold">Feed unavailable</h2>
          <p className="mt-2 text-ink-muted">{error instanceof Error ? error.message : "Unable to load the feed."}</p>
          <button onClick={() => refetch()} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md bg-accent px-4 font-bold text-white">
            <RefreshCw size={17} />
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-extrabold">No posts yet</h2>
          <p className="mt-2 text-ink-muted">Start the conversation by publishing the first post.</p>
        </div>
      )}

      {posts.map((post, index) => (
        <PostCard key={post._id} post={post} priority={index === 0} />
      ))}

      <div ref={sentinelRef} className="h-4" />
      {isFetchingNextPage && <FeedSkeleton />}
      {!isLoading && !hasNextPage && posts.length > 0 && <p className="my-4 text-center text-sm text-ink-muted">You are all caught up.</p>}
    </section>
  );
}
