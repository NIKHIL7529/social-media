import { Suspense, type ReactNode } from "react";

import { ChatPageClient } from "@/features/chat/chat-page-client";
import { ChatSkeleton } from "@/components/skeletons";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return <><Suspense fallback={<ChatSkeleton />}><ChatPageClient /></Suspense>{children}</>;
}
