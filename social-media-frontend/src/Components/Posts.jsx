import { Add, Refresh } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Post from "./Post";
import styles from "./Posts.module.css";
import { postService } from "../services/postService";

const FeedSkeleton = () => (
  <div className={styles.skeleton} aria-hidden="true">
    <div className={styles.skeletonHeader}>
      <span />
      <div />
    </div>
    <div className={styles.skeletonMedia} />
    <div className={styles.skeletonLine} />
    <div className={styles.skeletonLineShort} />
  </div>
);

export default function Posts({ user, isAuthenticated }) {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(user || {});
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentUser(user || {});
  }, [user]);

  const loadFeed = useCallback(async ({ reset = false } = {}) => {
    reset ? setLoading(true) : setLoadingMore(true);
    setError("");

    try {
      const data = await postService.getFeed({
        cursor: reset ? null : cursor,
        limit: 10,
      });
      const nextPosts = data.post.filter((post) => post.user);

      setPosts((previous) => (reset ? nextPosts : [...previous, ...nextPosts]));
      setCursor(data.pagination?.nextCursor || null);
      setHasMore(Boolean(data.pagination?.hasMore));
    } catch (requestError) {
      setError(requestError.message || "Unable to load the feed.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cursor]);

  useEffect(() => {
    loadFeed({ reset: true });
  }, []);

  const handleFollowChange = (userName) => {
    setCurrentUser((previous) => {
      const followings = previous.followings || [];
      return {
        ...previous,
        followings: followings.includes(userName)
          ? followings.filter((following) => following !== userName)
          : [...followings, userName],
      };
    });
  };

  return (
    <section className={styles.Posts} aria-labelledby="feed-title">
      <header className={styles.feedHeader}>
        <div>
          <span className={styles.eyebrow}>Community</span>
          <h1 id="feed-title">Latest posts</h1>
        </div>
        {isAuthenticated && (
          <button onClick={() => navigate("/addPost")}>
            <Add />
            New post
          </button>
        )}
      </header>

      <div className={styles.posts}>
        {loading && (
          <>
            <FeedSkeleton />
            <FeedSkeleton />
          </>
        )}

        {!loading && error && posts.length === 0 && (
          <div className={styles.state}>
            <h2>Feed unavailable</h2>
            <p>{error}</p>
            <button onClick={() => loadFeed({ reset: true })}>
              <Refresh />
              Try again
            </button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className={styles.state}>
            <h2>No posts yet</h2>
            <p>Start the conversation by publishing the first post.</p>
          </div>
        )}

        {posts.map((post) => (
          <Post
            key={post._id}
            post={post}
            user={currentUser}
            setFollow={handleFollowChange}
            setIndex={(postId) =>
              setPosts((previous) =>
                previous.filter((item) => item._id !== postId),
              )
            }
            isAuthenticated={isAuthenticated}
          />
        ))}

        {error && posts.length > 0 && (
          <p className={styles.inlineError}>{error}</p>
        )}

        {!loading && hasMore && posts.length > 0 && (
          <button
            className={styles.loadMore}
            onClick={() => loadFeed()}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load more posts"}
          </button>
        )}

        {!loading && !hasMore && posts.length > 0 && (
          <p className={styles.feedEnd}>You are all caught up.</p>
        )}
      </div>
    </section>
  );
}
