import { Bookmark, BookmarkCheck, Heart, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import type { ReactNode } from "react";

export function PostActions({
  liked,
  likes,
  onComment,
  onLike,
  onSave,
  onShare,
  onShowLikers,
  saved,
  saving,
  liking,
}: {
  liked: boolean;
  likes: number;
  onComment: () => void;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onShowLikers: () => void;
  saved: boolean;
  saving: boolean;
  liking: boolean;
}) {
  return (
    <footer className="relative flex flex-wrap items-center gap-1 px-3 py-3">
      <IconButton active={liked} label={liked ? "Unlike post" : "Like post"} disabled={liking} onClick={onLike}>
        <ThumbsUp />
      </IconButton>
      <IconButton label="Comment on post" onClick={onComment}>
        <MessageCircle />
      </IconButton>
      <IconButton active={saved} label={saved ? "Remove saved post" : "Save post"} disabled={saving} onClick={onSave}>
        {saved ? <BookmarkCheck /> : <Bookmark />}
      </IconButton>
      <IconButton label="Share post" onClick={onShare}>
        <Share2 />
      </IconButton>
      <button
        onClick={onShowLikers}
        className="ml-auto inline-flex min-h-9 items-center gap-2 rounded-md px-2 text-sm font-bold text-ink-muted hover:bg-accent-soft hover:text-accent-deep"
        aria-label="View people who liked this post"
      >
        <Heart size={16} />
        {likes} likes
      </button>
    </footer>
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
