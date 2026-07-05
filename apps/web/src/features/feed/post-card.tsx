"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { Post } from "@/types/social";
import { CommentsPanel, LikersDialog, PostActions, PostContent, PostHeader } from "@/features/feed/post-card-components";
import { usePostCardActions } from "@/features/feed/use-post-card-actions";

type Props = {
  post: Post;
  priority?: boolean;
};

export function PostCard({ post, priority = false }: Props) {
  const actions = usePostCardActions(post);
  const canReadMore = (post.text || "").length > 140;
  const [expanded, setExpanded] = useState(!canReadMore);
  const visibleText = useMemo(() => {
    if (!post.text) return "";
    return expanded ? post.text : `${post.text.slice(0, 140)}...`;
  }, [expanded, post.text]);

  if (actions.deleted) return null;

  return (
    <article className="mb-5 overflow-hidden rounded-lg border border-line bg-white shadow-card">
      <PostHeader
        following={actions.following}
        isMine={actions.isMine}
        onDelete={() => actions.deleteMutation.mutate()}
        onFollow={() => (actions.user ? actions.followMutation.mutate() : actions.requireAuth())}
        post={post}
        working={actions.isMine ? actions.deleteMutation.isPending : actions.followMutation.isPending}
      />

      <div className="bg-slate-100">
        <Image src={post.photo} alt={post.topic || "post"} width={960} height={720} priority={priority} className="aspect-[4/3] w-full object-cover" />
      </div>

      <PostContent
        expanded={expanded}
        onToggleExpanded={() => setExpanded((value) => !value)}
        post={post}
        visibleText={visibleText}
      />

      <PostActions
        liked={actions.liked}
        likes={post.likes}
        onComment={actions.toggleComments}
        onLike={() => (actions.user ? actions.likeMutation.mutate() : actions.requireAuth())}
        onSave={() => (actions.user ? actions.saveMutation.mutate() : actions.requireAuth())}
        onShare={actions.sharePost}
        onShowLikers={() => actions.setLikersOpen(true)}
        saved={actions.saved}
        liking={actions.likeMutation.isPending}
        saving={actions.saveMutation.isPending}
      />

      {actions.likersOpen && (
        <LikersDialog
          onClose={() => actions.setLikersOpen(false)}
          onSelectUser={(userId) => actions.router.push(`/user/${userId}`)}
          query={actions.likersQuery}
        />
      )}

      {actions.commentsOpen && (
        <CommentsPanel
          comment={actions.comment}
          comments={actions.comments}
          loading={actions.commentsQuery.isLoading}
          mutation={actions.commentMutation}
          onAddComment={actions.addComment}
          onCommentChange={actions.setComment}
          queryComments={actions.commentsQuery.data?.comments}
        />
      )}
    </article>
  );
}
