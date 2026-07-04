import { AppShell } from "@/components/app-shell";
import { Feed } from "@/features/feed/feed";

export default function PostsPage() {
  return (
    <AppShell>
      <Feed />
    </AppShell>
  );
}
