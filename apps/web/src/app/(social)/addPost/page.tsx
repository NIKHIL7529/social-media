import type { Metadata } from "next";

import CreatePostScreen from "@/features/feed/create-post-screen";

export const metadata: Metadata = { title: "New post" };

export default function Page() {
  return <CreatePostScreen />;
}
