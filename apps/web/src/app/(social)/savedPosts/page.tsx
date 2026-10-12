import type { Metadata } from "next";

import SavedPostsScreen from "@/features/feed/saved-posts-screen";

export const metadata: Metadata = { title: "Saved posts" };

export default function Page() {
  return <SavedPostsScreen />;
}
