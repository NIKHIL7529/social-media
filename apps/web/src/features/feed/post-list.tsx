import { PostCard } from "@/features/feed/post-card";
import type { Post } from "@/types/social";

export function PostList({ posts }: { posts: Post[] }) {
  return <div className="feed-grid">{posts.map((post, index) => <PostCard key={post._id} post={post} priority={index === 0} />)}</div>;
}
