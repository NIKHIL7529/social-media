import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getServerQueryClient, prefetchCurrentUser } from "@/lib/server-data";

export default async function SocialLayout({ children }: { children: ReactNode }) {
  await prefetchCurrentUser();
  return <HydrationBoundary state={dehydrate(getServerQueryClient())}><AppShell>{children}</AppShell></HydrationBoundary>;
}
