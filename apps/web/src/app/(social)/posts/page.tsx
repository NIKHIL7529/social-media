import type { Metadata } from "next";

import { Feed } from "@/features/feed/feed";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getServerQueryClient, prefetchCurrentUser, prefetchFeed } from "@/lib/server-data";

export const metadata: Metadata = { title: "Latest posts" };

export default async function PostsPage() {
  await Promise.all([prefetchCurrentUser(), prefetchFeed()]);
  return <HydrationBoundary state={dehydrate(getServerQueryClient())}><Feed /></HydrationBoundary>;
}
