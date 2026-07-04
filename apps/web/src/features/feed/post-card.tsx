"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, Heart, MessageCircle, Send, Share2, ThumbsUp, Trash2, UserCircle, X } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useCurrentUser } from "@/components/app-shell";
import { ApiError } from "@/lib/api";
import type { Post, PostComment } from "@/types/social";
import { postService } from "./post-service";

type Props = {
  post: Post;
  priority?: boolean;
};

export function PostCard({ post, priority = false }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(Boolean(user?.liked?.includes(post._id)));
  const [saved, setSaved] = useState(Boolean(user?.saved?.includes(post._id)));
  const [following, setFollowing] = useState(Boolean(user?.followings?.includes(post.user.name)));
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [likersOpen, setLikersOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<PostComment[]>(post.comments || []);

  const isMine = user?.name === post.user.name;
  const canReadMore = (post.text || "").length > 140;
  const [expanded, setExpanded] = useState(!canReadMore);
  const visibleText = useMemo(() => {
    if (!post.text) return "";
    return expanded ? post.text : `${post.text.slice(0, 140)}...`;
  }, [expanded, post.text]);

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
    onSuccess: (data) => {
      setLikes(data.likes);
      setLiked((value) => !value);
    },
    onError: handleMutationError,
  });

  const saveMutation = useMutation({
    mutationFn: () => postService.save(post._id),
    onSuccess: () => setSaved((value) => !value),
    onError: handleMutationError,
  });

  const followMutation = useMutation({
    mutationFn: () => postService.follow(post.user.name),
    onSuccess: () => setFollowing((value) => !value),
    onError: handleMutationError,
  });

  const deleteMutation = useMutation({
    mutationFn: () => postService.remove(post._id),
    onSuccess: () => {
      setDeleted(true);
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["profile", "posts"] });
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
    },
    onError: handleMutationError,
  });
  const likersQuery = useQuery({
    queryKey: ["post", post._id, "likedBy"],
    queryFn: () => postService.likedBy(post._id),
    enabled: likersOpen,
  });
  const commentsQuery = useQuery({
    queryKey: ["post", post._id, "comments"],
    queryFn: () => postService.getComments(post._id),
    enabled: commentsOpen,
  });
  const commentMutation = useMutation({
    mutationFn: () => postService.comment(post._id, comment.trim()),
    onSuccess: (data) => {
      setComments((items) => [...items, data.comment]);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["post", post._id, "comments"] });
    },
    onError: handleMutationError,
  });

  function addComment() {
    if (!user) {
      requireAuth();
      return;
    }
    if (!comment.trim()) return;
    commentMutation.mutate();
  }

  async function sharePost() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.topic || "SocialSphere post", text: post.text || "View this post", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error("Unable to share");
      }
    }
  }

  if (deleted) return null;

  return (
    <article className="mb-5 overflow-hidden rounded-lg border border-line bg-white shadow-card">
      <header className="flex items-center justify-between gap-4 px-4 pb-3 pt-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          {post.user.photo ? (
            <Image
              src={post.user.photo}
              alt={post.user.name}
              width={46}
              height={46}
              className="size-11 rounded-full object-cover"
            />
          ) : (
            <UserCircle className="size-11 flex-shrink-0 text-slate-400" />
          )}
          <p className="truncate font-bold text-ink">{post.user.name}</p>
        </div>

        {isMine ? (
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="inline-flex min-h-9 items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 font-bold text-red-700 disabled:cursor-wait disabled:opacity-60"
          >
            <Trash2 size={16} />
            {deleteMutation.isPending ? "Deleting" : "Delete"}
          </button>
        ) : (
          <button
            onClick={() => (user ? followMutation.mutate() : requireAuth())}
            disabled={followMutation.isPending}
            className="min-h-9 rounded-full border border-accent-soft bg-accent-soft px-4 font-bold text-accent-deep disabled:cursor-wait disabled:opacity-60"
          >
            {following ? "Following" : "Follow"}
          </button>
        )}
      </header>

      <div className="bg-slate-100">
        <Image src={post.photo} alt={post.topic || "post"} width={960} height={720} priority={priority} className="aspect-[4/3] w-full object-cover" />
      </div>

      {(post.topic || post.text) && (
        <div className="space-y-2 px-4 pt-4 sm:px-5">
          {post.topic && <h2 className="text-base font-extrabold leading-snug text-ink">{post.topic}</h2>}
          {post.text && (
            <p className="break-words text-[0.95rem] leading-6 text-ink-muted">
              {visibleText}
              {canReadMore && (
                <button onClick={() => setExpanded((value) => !value)} className="ml-2 font-bold text-accent-deep underline">
                  {expanded ? "Read Less" : "Read More"}
                </button>
              )}
            </p>
          )}
        </div>
      )}

      <footer className="relative flex flex-wrap items-center gap-1 px-3 py-3">
        <IconButton
          active={liked}
          label={liked ? "Unlike post" : "Like post"}
          disabled={likeMutation.isPending}
          onClick={() => (user ? likeMutation.mutate() : requireAuth())}
        >
          <ThumbsUp />
        </IconButton>
        <IconButton
          label="Comment on post"
          onClick={() => {
            if (!user) requireAuth();
            else if (!post.commentable) toast("Comments are turned off");
            else setCommentsOpen((value) => !value);
          }}
        >
          <MessageCircle />
        </IconButton>
        <IconButton
          active={saved}
          label={saved ? "Remove saved post" : "Save post"}
          disabled={saveMutation.isPending}
          onClick={() => (user ? saveMutation.mutate() : requireAuth())}
        >
          {saved ? <BookmarkCheck /> : <Bookmark />}
        </IconButton>
        <IconButton label="Share post" onClick={sharePost}>
          <Share2 />
        </IconButton>
        <button
          onClick={() => setLikersOpen(true)}
          className="ml-auto inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-sm font-bold text-ink-muted hover:bg-accent-soft hover:text-accent-deep"
          aria-label="View people who liked this post"
        >
          <Heart size={16} />
          {likes} likes
        </button>
      </footer>

      {likersOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <section className="w-full max-w-sm overflow-hidden rounded-lg border border-line bg-white shadow-card">
            <header className="flex items-center justify-between border-b border-line p-4">
              <h2 className="font-extrabold text-ink">Liked by</h2>
              <button onClick={() => setLikersOpen(false)} className="grid size-9 place-items-center rounded-md hover:bg-accent-soft" aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="max-h-80 overflow-y-auto p-2">
              {likersQuery.isLoading && <p className="p-3 text-sm text-ink-muted">Loading...</p>}
              {!likersQuery.isLoading && likersQuery.data?.users.length === 0 && <p className="p-3 text-sm text-ink-muted">No likes yet.</p>}
              {likersQuery.data?.users.map((likedUser) => (
                <button
                  key={likedUser._id}
                  onClick={() => router.push(`/user/${likedUser._id}`)}
                  className="flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-left hover:bg-accent-soft"
                >
                  {likedUser.photo ? (
                    <Image src={likedUser.photo} alt={likedUser.name} width={34} height={34} className="size-9 rounded-full object-cover" />
                  ) : (
                    <UserCircle className="size-9 text-slate-400" />
                  )}
                  <span className="font-bold text-ink">{likedUser.name}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {commentsOpen && (
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="flex min-h-14 items-center gap-2 px-3 py-2">
            <input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="min-h-10 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
              placeholder="Comment here"
            />
            <button onClick={addComment} disabled={commentMutation.isPending} className="grid size-10 place-items-center rounded-md text-accent-deep hover:bg-accent-soft disabled:cursor-wait disabled:opacity-60" aria-label="Send comment">
              <Send size={20} />
            </button>
          </div>
          <div className="space-y-2 px-4 pb-4 text-sm text-ink-muted">
            {commentsQuery.isLoading && "Loading comments..."}
            {(commentsQuery.data?.comments || comments).length
              ? (commentsQuery.data?.comments || comments).map((item) => <p key={item._id}><strong>{item.sender}</strong> {item.comment}</p>)
              : !commentsQuery.isLoading && "No comments yet"}
          </div>
        </section>
      )}
    </article>
  );
}

function IconButton({
  active,
  label,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-10 place-items-center rounded-md disabled:cursor-wait disabled:opacity-60 ${
        active ? "bg-accent-soft text-accent-deep" : "text-ink hover:bg-accent-soft"
      }`}
    >
      <span className="[&_svg]:size-5">{children}</span>
    </button>
  );
}
