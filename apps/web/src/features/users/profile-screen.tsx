"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";

import { useCurrentUser } from "@/features/auth/use-current-user";
import { FeedSkeleton } from "@/features/feed/feed-skeleton";
import { PostList } from "@/features/feed/post-list";
import { postService } from "@/features/feed/post-service";
import { ProfileHeader, ProfileInfoGrid, ProfileStats, type SocialList } from "@/features/users/profile-components";
import { UserListDialog } from "@/features/users/user-list-dialog";
import { queryKeys } from "@/lib/query-keys";
import { ProfileSkeleton } from "@/components/skeletons";
import { QueryError } from "@/components/query-error";
import { LoginRequired } from "@/components/login-required";

export default function ProfileScreen() {
  const { data: user, isLoading, error } = useCurrentUser();
  const [list, setList] = useState<SocialList | null>(null);
  const postsQuery = useQuery({
    queryKey: queryKeys.profilePosts,
    queryFn: ({ signal }) => postService.getMyPosts(signal),
    enabled: Boolean(user),
  });
  const posts = postsQuery.data?.post || [];
  if (!isLoading && !error && !user) return <LoginRequired message="to view your profile." />;

  return (
      <section className="mx-auto w-full min-w-0">
        <div className="profile-panel surface-card p-5 sm:p-6">
          {isLoading && <ProfileSkeleton />}
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
              <div className="mt-5 flex flex-wrap gap-3"><Link href="/editProfile" className="action-secondary">
                Edit profile
              </Link>
              <Link href="/addPost" className="action-primary"><Plus size={18} aria-hidden="true" />Add post</Link></div>
              <ProfileInfoGrid user={user} />
            </>
          )}
        </div>

        {user && (
          <div className="mt-5">
            <h2 className="mb-4 border-b border-line pb-3 text-xl font-extrabold text-ink">Your posts</h2>
            {postsQuery.isLoading && <FeedSkeleton />}
            <QueryError error={postsQuery.error} onRetry={() => postsQuery.refetch()} retrying={postsQuery.isFetching} />
            <PostList posts={posts} />
            {!postsQuery.isLoading && !postsQuery.error && posts.length === 0 && (
              <p className="rounded border border-line bg-surface p-5 text-ink-muted">You have not created any posts yet.</p>
            )}
          </div>
        )}

        {user && list && (
          <UserListDialog
            title={list === "followers" ? "Followers" : "Following"}
            users={list === "followers" ? user.followers || [] : user.followings || []}
            onClose={() => setList(null)}
          />
        )}
      </section>
  );
}
