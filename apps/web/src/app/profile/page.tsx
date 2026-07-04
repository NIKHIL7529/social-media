"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell, useCurrentUser } from "@/components/app-shell";
import { PostCard } from "@/features/feed/post-card";
import { postService } from "@/features/feed/post-service";
import { FeedSkeleton } from "@/features/feed/feed-skeleton";
import { UserListDialog } from "@/features/users/user-list-dialog";

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const [list, setList] = useState<"followers" | "followings" | null>(null);
  const postsQuery = useQuery({
    queryKey: ["profile", "posts"],
    queryFn: postService.getMyPosts,
    enabled: Boolean(user),
  });
  const posts = postsQuery.data?.post || [];

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-feed">
        <div className="rounded-lg border border-line bg-white p-5 shadow-card">
          {isLoading && <p className="text-ink-muted">Loading profile...</p>}
          {!isLoading && !user && <p className="text-ink-muted">Login to view your profile.</p>}
          {user && (
            <>
            <div className="flex items-center gap-4">
              {user.photo ? (
                <Image src={user.photo} alt={user.name} width={88} height={88} className="size-20 rounded-full object-cover" />
              ) : (
                <UserCircle className="size-20 text-slate-400" />
              )}
              <div>
                <h1 className="text-2xl font-extrabold text-ink">{user.name}</h1>
                <p className="text-sm text-ink-muted">{user.city || "No city set"} {user.country ? `· ${user.country}` : ""}</p>
              </div>
            </div>
            {user.description && <p className="mt-5 leading-7 text-ink-muted">{user.description}</p>}
            <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-lg border border-line text-center">
              <Stat label="Followers" value={user.followers?.length || 0} onClick={() => setList("followers")} />
              <Stat label="Following" value={user.followings?.length || 0} onClick={() => setList("followings")} />
              <Stat label="Posts" value={posts.length} />
            </div>
            <Link href="/editProfile" className="mt-5 inline-flex min-h-10 items-center rounded-md bg-accent px-4 font-bold text-white">
              Edit profile
            </Link>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <Info label="City" value={user.city} />
              <Info label="Country" value={user.country} />
              <Info label="Gender" value={user.gender} />
              <Info label="Date of birth" value={user.dob} />
            </div>
            </>
          )}
        </div>

        {user && (
          <div className="mt-5">
            <h2 className="mb-4 border-b border-line pb-3 text-xl font-extrabold text-ink">Your posts</h2>
            {postsQuery.isLoading && <FeedSkeleton />}
            {postsQuery.error && <p className="rounded-lg border border-line bg-white p-5 text-ink-muted">Could not load your posts.</p>}
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
            {!postsQuery.isLoading && posts.length === 0 && (
              <p className="rounded-lg border border-line bg-white p-5 text-ink-muted">You have not created any posts yet.</p>
            )}
          </div>
        )}

        {user && list && (
          <UserListDialog
            title={list === "followers" ? "Followers" : "Following"}
            users={list === "followers" ? user.followers || [] : user.followings || []}
            onClose={() => setList(null)}
            onUserClick={(name) => router.push(`/user/name/${encodeURIComponent(name)}`)}
          />
        )}
      </section>
    </AppShell>
  );
}

function Stat({ label, value, onClick }: { label: string; value: number; onClick?: () => void }) {
  const content = (
    <>
      <p className="text-lg font-extrabold text-ink">{value}</p>
      <p className="text-xs font-bold uppercase text-ink-muted">{label}</p>
    </>
  );
  if (onClick) {
    return <button onClick={onClick} className="border-r border-line p-3 last:border-r-0 hover:bg-accent-soft">{content}</button>;
  }
  return <div className="border-r border-line p-3 last:border-r-0">{content}</div>;
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="font-bold text-ink">{label}</p>
      <p className="mt-1 text-ink-muted">{value || "Not set"}</p>
    </div>
  );
}
