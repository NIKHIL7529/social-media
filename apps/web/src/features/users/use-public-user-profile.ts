"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useCurrentUser } from "@/components/app-shell";
import { chatService } from "@/features/chat/chat-service";
import { postService } from "@/features/feed/post-service";
import { applyFollow } from "@/features/users/follow-cache";
import type { SocialList } from "@/features/users/profile-components";
import { userService } from "@/features/users/user-service";
import { queryKeys } from "@/lib/query-keys";

export function usePublicUserProfile() {
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

  return {
    chatPending: chatMutation.isPending,
    currentUser,
    editCurrentProfile: () => router.push("/editProfile"),
    follow: () => followMutation.mutate(),
    followPending: followMutation.isPending,
    isCurrentUser,
    isFollowing,
    list,
    openUserByName: (name: string) => router.push(`/user/name/${encodeURIComponent(name)}`),
    posts,
    postsQuery,
    setList,
    startChat: () => chatMutation.mutate(),
    user,
    userQuery,
  };
}
