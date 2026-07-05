import type { Post } from "@/types/social";

export function PostContent({
  expanded,
  onToggleExpanded,
  post,
  visibleText,
}: {
  expanded: boolean;
  onToggleExpanded: () => void;
  post: Post;
  visibleText: string;
}) {
  const canReadMore = (post.text || "").length > 140;
  if (!post.topic && !post.text) return null;

  return (
    <div className="space-y-2 px-4 pt-4 sm:px-5">
      {post.topic && <h2 className="text-base font-extrabold leading-snug text-ink">{post.topic}</h2>}
      {post.text && (
        <p className="break-words text-[0.95rem] leading-6 text-ink-muted">
          {visibleText}
          {canReadMore && (
            <button onClick={onToggleExpanded} className="ml-2 font-bold text-accent-deep underline">
              {expanded ? "Read Less" : "Read More"}
            </button>
          )}
        </p>
      )}
    </div>
  );
}
