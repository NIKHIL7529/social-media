"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

import { AppShell, useCurrentUser } from "@/components/app-shell";
import { chatService } from "@/features/chat/chat-service";
import { PostCard } from "@/features/feed/post-card";
import { postService } from "@/features/feed/post-service";
import { UserListDialog } from "@/features/users/user-list-dialog";
import { userService } from "@/features/users/user-service";

export default function PublicUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const [list, setList] = useState<"followers" | "followings" | null>(null);

  const userQuery = useQuery({
    queryKey: ["user", id],
    queryFn: () => userService.getById(id),
    enabled: Boolean(id),
  });
  const postsQuery = useQuery({
    queryKey: ["user", id, "posts"],
    queryFn: () => postService.getUserPosts(id),
    enabled: Boolean(id),
  });

  const user = userQuery.data?.user;
  const posts = postsQuery.data?.post || [];
  const isCurrentUser = currentUser?._id === id;
  const isFollowing = Boolean(user?.followers?.includes(currentUser?.name || ""));

  const followMutation = useMutation({
    mutationFn: () => userService.follow(user?.name || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Follow failed"),
  });

  const chatMutation = useMutation({
    mutationFn: () => chatService.getOrCreateDirect(user?.name || ""),
    onSuccess: (data) => router.push(`/chat/${data.chat.chatId}`),
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
              <div className="flex items-center gap-4">
                {user.photo ? (
                  <Image src={user.photo} alt={user.name} width={88} height={88} className="size-20 rounded-full object-cover" />
                ) : (
                  <UserCircle className="size-20 text-slate-400" />
                )}
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-extrabold text-ink">{user.name}</h1>
                  <p className="text-sm text-ink-muted">{user.city || "No city set"} {user.country ? `· ${user.country}` : ""}</p>
                </div>
              </div>
              {user.description && <p className="mt-5 leading-7 text-ink-muted">{user.description}</p>}
              <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-lg border border-line text-center">
                <Stat label="Followers" value={user.followers?.length || 0} onClick={() => setList("followers")} />
                <Stat label="Following" value={user.followings?.length || 0} onClick={() => setList("followings")} />
                <Stat label="Posts" value={posts.length} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {isCurrentUser ? (
                  <button onClick={() => router.push("/editProfile")} className="min-h-10 rounded-md bg-accent px-4 font-bold text-white">Edit profile</button>
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
