"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useCurrentUser } from "@/features/auth/use-current-user";
import { chatService } from "@/features/chat/chat-service";
import { postService } from "@/features/feed/post-service";
import { applyFollow } from "@/features/users/follow-cache";
import type { SocialList } from "@/features/users/profile-components";
import { userService } from "@/features/users/user-service";
import { queryKeys } from "@/lib/query-keys";

export function usePublicUserProfile(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const [list, setList] = useState<SocialList | null>(null);

  const userQuery = useQuery({
    queryKey: queryKeys.user(id),
    queryFn: ({ signal }) => userService.getById(id, signal),
    enabled: Boolean(id),
  });
  const postsQuery = useQuery({
    queryKey: queryKeys.userPosts(id),
    queryFn: ({ signal }) => postService.getUserPosts(id, signal),
    enabled: Boolean(id),
  });

  const user = userQuery.data?.user;
  const posts = postsQuery.data?.post || [];
  const isCurrentUser = currentUser?._id === id;
  const isFollowing = Boolean(user?.followers?.includes(currentUser?.username || ""));

  const followMutation = useMutation({
    mutationFn: () => userService.follow(user?.username || ""),
    onSuccess: (data) => {
      if (!currentUser?.username || !user?.username) return;
      applyFollow(queryClient, user.username, currentUser.username, data.following, data.user);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Follow failed"),
  });

  const chatMutation = useMutation({
    mutationFn: () => chatService.getDirect(user?.username || ""),
    onSuccess: (data) => {
      if (data.chat) {
        router.push(`/chat/${data.chat.chatId}`);
        return;
      }
      const recipient = data.recipient?.username || user?.username || "";
      router.push(`/chat/new?user=${encodeURIComponent(recipient)}`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not start chat"),
  });

  return {
    chatPending: chatMutation.isPending,
    currentUser,
    follow: () => followMutation.mutate(),
    followPending: followMutation.isPending,
    isCurrentUser,
    isFollowing,
    list,
    posts,
    postsQuery,
    setList,
    startChat: () => chatMutation.mutate(),
    user,
    userQuery,
  };
}
