"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AppShell, useCurrentUser } from "@/components/app-shell";
import { FeedSkeleton } from "@/features/feed/feed-skeleton";
import { PostCard } from "@/features/feed/post-card";
import { postService } from "@/features/feed/post-service";
import { ProfileHeader, ProfileInfoGrid, ProfileStats, type SocialList } from "@/features/users/profile-components";
import { UserListDialog } from "@/features/users/user-list-dialog";
import { queryKeys } from "@/lib/query-keys";

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const [list, setList] = useState<SocialList | null>(null);
  const postsQuery = useQuery({
    queryKey: queryKeys.profilePosts,
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
              <ProfileHeader user={user} />
              {user.description && <p className="mt-5 leading-7 text-ink-muted">{user.description}</p>}
              <ProfileStats
                followers={user.followers?.length || 0}
                followings={user.followings?.length || 0}
                onSelectList={setList}
                posts={posts.length}
              />
              <Link href="/editProfile" className="mt-5 inline-flex min-h-10 items-center rounded-md bg-accent px-4 font-bold text-white">
                Edit profile
              </Link>
              <ProfileInfoGrid user={user} />
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
