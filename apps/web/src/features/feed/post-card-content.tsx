import { useLayoutEffect, useRef, useState } from "react";

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
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const canReadMore = (post.text || "").length > 140 || overflows;
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content || expanded) return;
    const measure = () => setOverflows(Array.from(content.children).some((child) => child.scrollHeight > child.clientHeight + 1));
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    measure();
    return () => observer.disconnect();
  }, [expanded, post.topic, visibleText]);
  if (!post.topic && !post.text) return null;

  return (
    <div data-expanded={expanded} className="post-content space-y-2 px-4 pt-4 sm:px-5">
      <div ref={contentRef} className="space-y-2">
        {post.topic && <h2 className={`text-base font-extrabold leading-snug text-ink ${expanded ? "" : "line-clamp-2"}`}>{post.topic}</h2>}
        {post.text && (
          <p className={`break-words text-[0.95rem] leading-6 text-ink-muted ${expanded ? "" : "line-clamp-2"}`}>
            {visibleText}
          </p>
        )}
      </div>
      {(canReadMore || expanded) && (
        <button onClick={onToggleExpanded} aria-expanded={expanded} className="font-bold text-accent-deep underline">
          {expanded ? "Read Less" : "Read More"}
        </button>
      )}
    </div>
  );
}
