"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

import { AppShell, useCurrentUser } from "@/components/app-shell";
import { chatService } from "@/features/chat/chat-service";
import { PostCard } from "@/features/feed/post-card";
import { postService } from "@/features/feed/post-service";
import { applyFollow } from "@/features/social/social-cache";
import { ProfileHeader, ProfileStats, type SocialList } from "@/features/users/profile-components";
import { UserListDialog } from "@/features/users/user-list-dialog";
import { userService } from "@/features/users/user-service";
import { queryKeys } from "@/lib/query-keys";

export default function PublicUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const [list, setList] = useState<SocialList | null>(null);

  const userQuery = useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => userService.getById(id),
    enabled: Boolean(id),
  });
  const postsQuery = useQuery({
    queryKey: queryKeys.userPosts(id),
    queryFn: () => postService.getUserPosts(id),
    enabled: Boolean(id),
  });

  const user = userQuery.data?.user;
  const posts = postsQuery.data?.post || [];
  const isCurrentUser = currentUser?._id === id;
  const isFollowing = Boolean(user?.followers?.includes(currentUser?.name || ""));

  const followMutation = useMutation({
    mutationFn: () => userService.follow(user?.name || ""),
    onSuccess: (data) => {
      if (!currentUser?.name || !user?.name) return;
      applyFollow(queryClient, user.name, currentUser.name, data.following, data.user);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Follow failed"),
  });

  const chatMutation = useMutation({
    mutationFn: () => chatService.getDirect(user?.name || ""),
    onSuccess: (data) => {
      if (data.chat) {
        router.push(`/chat/${data.chat.chatId}`);
        return;
      }
      const recipient = data.recipient?.name || user?.name || "";
      router.push(`/chat/new?user=${encodeURIComponent(recipient)}`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not start chat"),
  });

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-feed">
        <div className="rounded-lg border border-line bg-white p-5 shadow-card">
          {userQuery.isLoading && <p className="text-ink-muted">Loading profile...</p>}
          {!userQuery.isLoading && !user && <p className="text-ink-muted">User not found.</p>}
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
              <div className="mt-5 flex flex-wrap gap-2">
                {isCurrentUser ? (
                  <button onClick={() => router.push("/editProfile")} className="min-h-10 rounded-md bg-accent px-4 font-bold text-white">
                    Edit profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => followMutation.mutate()}
                      disabled={!currentUser || followMutation.isPending}
                      className="min-h-10 rounded-md bg-accent px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                    <button
                      onClick={() => chatMutation.mutate()}
                      disabled={!currentUser || chatMutation.isPending}
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

        {user && (
          <div className="mt-5">
            <h2 className="mb-4 border-b border-line pb-3 text-xl font-extrabold text-ink">Posts</h2>
            {posts.map((post) => <PostCard key={post._id} post={post} />)}
            {!postsQuery.isLoading && posts.length === 0 && <p className="rounded-lg border border-line bg-white p-5 text-ink-muted">No posts yet.</p>}
          </div>
        )}

        {user && list && (
          <UserListDialog
            title={list === "followers" ? "Followers" : "Following"}
            users={user[list] || []}
            onClose={() => setList(null)}
            onUserClick={(name) => router.push(`/user/name/${encodeURIComponent(name)}`)}
          />
        )}
      </section>
    </AppShell>
  );
}
