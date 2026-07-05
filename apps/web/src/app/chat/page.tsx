import { Suspense } from "react";

import { ChatPageClient } from "@/features/chat/chat-page-client";

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageClient />
    </Suspense>
  );
}
