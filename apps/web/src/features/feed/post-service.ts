import { apiFetch, jsonPost } from "@/lib/api";
import type { FeedPage, Post, PostComment } from "@/types/social";
import { userService } from "@/features/users/user-service";

export const postService = {
  getFeed: ({ cursor, limit = 10, signal }: { cursor?: string | null; limit?: number; signal?: AbortSignal }) =>
    apiFetch<FeedPage>("/api/post", { method: "POST", body: JSON.stringify({ cursor, limit }), signal }),
  like: (postId: string) =>
    jsonPost<{ status: number; message: string; liked: boolean; likes: number }, { _id: string }>("/api/post/liked", {
      _id: postId,
    }),
  save: (postId: string) =>
    jsonPost<{ status: number; message: string; saved: boolean; savedCount: number }, { _id: string }>("/api/post/saved", { _id: postId }),
  remove: (postId: string) =>
    jsonPost<{ status: number; message: string }, { _id: string }>("/api/post/deletePost", { _id: postId }),
  follow: userService.follow,
  create: (post: { topic: string; text: string; photo: string; commentable: boolean }) =>
    jsonPost<{ status: number; message: string; post: Post }, typeof post>("/api/post/addPost", post),
  getMyPosts: () => apiFetch<{ status: number; post: Post[] }>("/api/post/signedUserPosts"),
  getUserPosts: (userId: string) =>
    jsonPost<{ status: number; post: Post[] }, { _id: string }>("/api/post/userPosts", { _id: userId }),
  likedBy: (postId: string) =>
    jsonPost<{ status: number; users: import("@/types/social").User[] }, { _id: string }>("/api/post/likedBy", { _id: postId }),
  getComments: (postId: string) =>
    jsonPost<{ status: number; comments: PostComment[] }, { _id: string }>("/api/post/comments", { _id: postId }),
  comment: (postId: string, comment: string) =>
    jsonPost<{ status: number; comment: PostComment; commentCount: number }, { _id: string; comment: string }>("/api/post/comment", {
      _id: postId,
      comment,
    }),
  share: (postId: string) =>
    jsonPost<{ status: number; share: number }, { _id: string }>("/api/post/shared", { _id: postId }),
};
