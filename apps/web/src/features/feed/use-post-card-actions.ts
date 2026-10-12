"use client";

import { useState } from "react";
import { BRAND } from "@/config/brand";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useCurrentUser } from "@/features/auth/use-current-user";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { Post, PostComment } from "@/types/social";
import { applyPostComment, applyPostLike, applyPostSave, applyPostShare, removePostFromCaches } from "@/features/feed/post-cache";
import { postService } from "@/features/feed/post-service";
import { applyFollow } from "@/features/users/follow-cache";
import { userService } from "@/features/users/user-service";

export function usePostCardActions(post: Post) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [likersOpen, setLikersOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [comment, setComment] = useState("");

  const isMine = user?.username === post.user.username;
  const liked = Boolean(user?.liked?.includes(post._id));
  const saved = Boolean(user?.saved?.includes(post._id));
  const following = Boolean(user?.followings?.includes(post.user.username));

  function requireAuth() {
    toast("Sign in to continue");
    router.push("/login");
  }

  function handleMutationError(error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      requireAuth();
      return;
    }
    toast.error(error instanceof Error ? error.message : "Action failed");
  }

  const likeMutation = useMutation({
    mutationFn: () => postService.like(post._id),
    onSuccess: (data) => applyPostLike(queryClient, post._id, data.liked, data.likes),
    onError: handleMutationError,
  });

  const saveMutation = useMutation({
    mutationFn: () => postService.save(post._id),
    onSuccess: (data) => applyPostSave(queryClient, post._id, data.saved, data.savedCount),
    onError: handleMutationError,
  });

  const followMutation = useMutation({
    mutationFn: () => userService.follow(post.user.username),
    onSuccess: (data) => {
      if (user?.username) applyFollow(queryClient, post.user.username, user.username, data.following, data.user);
    },
    onError: handleMutationError,
  });

  const deleteMutation = useMutation({
    mutationFn: () => postService.remove(post._id),
    onSuccess: () => {
      setDeleted(true);
      removePostFromCaches(queryClient, post._id);
      toast.success("Post deleted");
    },
    onError: handleMutationError,
  });

  const likersQuery = useQuery({
    queryKey: queryKeys.postLikedBy(post._id),
    queryFn: ({ signal }) => postService.likedBy(post._id, signal),
    enabled: likersOpen,
  });

  const commentsQuery = useQuery({
    queryKey: queryKeys.postComments(post._id),
    queryFn: ({ signal }) => postService.getComments(post._id, signal),
    enabled: commentsOpen,
  });

  const commentMutation = useMutation({
    mutationFn: () => postService.comment(post._id, comment.trim()),
    onSuccess: (data) => {
      queryClient.setQueryData<{ status: number; comments: PostComment[] }>(queryKeys.postComments(post._id), (current) =>
        ({ status: current?.status ?? data.status, comments: [...(current?.comments ?? []), data.comment] }),
      );
      setComment("");
      applyPostComment(queryClient, post._id, data.commentCount);
    },
    onError: handleMutationError,
  });

  function toggleComments() {
    if (!user) {
      requireAuth();
      return;
    }
    if (!post.commentable) {
      toast("Comments are turned off");
      return;
    }
    setCommentsOpen((value) => !value);
  }

  function addComment() {
    if (!user) {
      requireAuth();
      return;
    }
    if (comment.trim() && !commentMutation.isPending) commentMutation.mutate();
  }

  async function sharePost() {
    const url = window.location.href;
    try {
      postService.share(post._id)
        .then((data) => applyPostShare(queryClient, post._id, data.share))
        .catch(handleMutationError);
      if (navigator.share) {
        await navigator.share({ title: post.topic || `${BRAND.name} post`, text: post.text || "View this post", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") toast.error("Unable to share");
    }
  }

  return {
    addComment,
    comment,
    commentMutation,
    commentsOpen,
    commentsQuery,
    deleteMutation,
    deleted,
    followMutation,
    following,
    isMine,
    liked,
    likeMutation,
    likersOpen,
    likersQuery,
    requireAuth,
    saved,
    saveMutation,
    setComment,
    setLikersOpen,
    sharePost,
    toggleComments,
    user,
  };
}
