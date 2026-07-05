"use client";

import { MessageCircle } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/features/feed/post-card";
import { ProfileHeader, ProfileStats } from "@/features/users/profile-components";
import { UserListDialog } from "@/features/users/user-list-dialog";
import { usePublicUserProfile } from "@/features/users/use-public-user-profile";

export default function PublicUserPage() {
  const profile = usePublicUserProfile();

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-feed">
        <div className="rounded-lg border border-line bg-white p-5 shadow-card">
          {profile.userQuery.isLoading && <p className="text-ink-muted">Loading profile...</p>}
          {!profile.userQuery.isLoading && !profile.user && <p className="text-ink-muted">User not found.</p>}
          {profile.user && (
            <>
              <ProfileHeader user={profile.user} />
              {profile.user.description && <p className="mt-5 leading-7 text-ink-muted">{profile.user.description}</p>}
              <ProfileStats
                followers={profile.user.followers?.length || 0}
                followings={profile.user.followings?.length || 0}
                onSelectList={profile.setList}
                posts={profile.posts.length}
              />
              <div className="mt-5 flex flex-wrap gap-2">
                {profile.isCurrentUser ? (
                  <button onClick={profile.editCurrentProfile} className="min-h-10 rounded-md bg-accent px-4 font-bold text-white">
                    Edit profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={profile.follow}
                      disabled={!profile.currentUser || profile.followPending}
                      className="min-h-10 rounded-md bg-accent px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {profile.isFollowing ? "Following" : "Follow"}
                    </button>
                    <button
                      onClick={profile.startChat}
                      disabled={!profile.currentUser || profile.chatPending}
                      className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line px-4 font-bold text-accent-deep disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <MessageCircle size={18} />
                      Message
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {profile.user && (
          <div className="mt-5">
            <h2 className="mb-4 border-b border-line pb-3 text-xl font-extrabold text-ink">Posts</h2>
            {profile.posts.map((post) => <PostCard key={post._id} post={post} />)}
            {!profile.postsQuery.isLoading && profile.posts.length === 0 && <p className="rounded-lg border border-line bg-white p-5 text-ink-muted">No posts yet.</p>}
          </div>
        )}

        {profile.user && profile.list && (
          <UserListDialog
            title={profile.list === "followers" ? "Followers" : "Following"}
            users={profile.user[profile.list] || []}
            onClose={() => profile.setList(null)}
            onUserClick={profile.openUserByName}
          />
        )}
      </section>
    </AppShell>
  );
}
