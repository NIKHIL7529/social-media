"use client";

import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import { apiFetch } from "@/lib/api";
import type { Post } from "@/types/social";
import { PostCard } from "@/features/feed/post-card";
import { FeedSkeleton } from "@/features/feed/feed-skeleton";

export default function SavedPostsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["saved-posts"],
    queryFn: () => apiFetch<{ status: number; post: Post[] }>("/api/post/savedPosts"),
  });

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-feed">
        <h1 className="mb-4 border-b border-line pb-4 text-2xl font-extrabold text-ink">Saved posts</h1>
        {isLoading && <FeedSkeleton />}
        {error && <p className="rounded-lg border border-line bg-white p-5 text-ink-muted">Login to view saved posts.</p>}
        {data?.post.map((post) => <PostCard key={post._id} post={post} />)}
        {data && data.post.length === 0 && <p className="rounded-lg border border-line bg-white p-5 text-ink-muted">No saved posts yet.</p>}
      </section>
    </AppShell>
  );
}
