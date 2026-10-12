"use client";

import Image from "next/image";
import { useState } from "react";

import type { Post } from "@/types/social";
import dynamic from "next/dynamic";
import { PostActions } from "@/features/feed/post-card-actions";
import { PostContent } from "@/features/feed/post-card-content";
import { PostHeader } from "@/features/feed/post-card-header";
import { ListSkeleton } from "@/components/skeletons";
import { usePostCardActions } from "@/features/feed/use-post-card-actions";
import { usePostSize } from "@/features/feed/use-post-size";

const CommentsPanel = dynamic(() => import("@/features/feed/comments-panel").then(module => module.CommentsPanel), { loading: () => <ListSkeleton /> });
const LikersDialog = dynamic(() => import("@/features/feed/post-likers-dialog").then(module => module.LikersDialog), { loading: () => <ListSkeleton /> });

type Props = {
  post: Post;
  priority?: boolean;
};

export function PostCard({ post, priority = false }: Props) {
  const actions = usePostCardActions(post);
  const [expanded, setExpanded] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>();
  const [imageFailed, setImageFailed] = useState(false);

  const { cardRef, mediaRef, width } = usePostSize({ ratio: dimensions ? dimensions.width / dimensions.height : 4 / 3, expanded: expanded || actions.commentsOpen });
  const visibleText = !post.text ? "" : expanded || post.text.length <= 140 ? post.text : `${post.text.slice(0, 140)}...`;

  if (actions.deleted) return null;

  return (
    <article ref={cardRef} style={{ inlineSize: width }} className="post-card mx-auto mb-6 min-w-0 max-w-full">
      <PostHeader
        following={actions.following}
        isMine={actions.isMine}
        onDelete={() => actions.deleteMutation.mutate()}
        onFollow={() => (actions.user ? actions.followMutation.mutate() : actions.requireAuth())}
        post={post}
        working={actions.isMine ? actions.deleteMutation.isPending : actions.followMutation.isPending}
      />

      <div ref={mediaRef} className="post-media">
        {imageFailed ? (
          <p role="alert" className="break-words p-3 text-sm text-danger">This post&apos;s image could not be loaded.</p>
        ) : (
          <Image
            src={post.photo}
            alt={post.topic || "post"}
            width={dimensions?.width ?? 960}
            height={dimensions?.height ?? 720}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            sizes={width ? `${Math.ceil(width)}px` : "(min-width: 1280px) 65vw, 100vw"}
            className="block h-auto w-full"
            onLoad={event => { const image = event.currentTarget; setDimensions(current => current?.width === image.naturalWidth && current?.height === image.naturalHeight ? current : { width: image.naturalWidth, height: image.naturalHeight }); }}
            onError={() => setImageFailed(true)}
          />
        )}
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
          query={actions.likersQuery}
        />
      )}

      {actions.commentsOpen && (
        <CommentsPanel
          comment={actions.comment}
          comments={actions.commentsQuery.data?.comments ?? []}
          loading={actions.commentsQuery.isLoading}
          mutation={actions.commentMutation}
          onAddComment={actions.addComment}
          onCommentChange={actions.setComment}
          error={actions.commentsQuery.error}
        />
      )}
    </article>
  );
}
