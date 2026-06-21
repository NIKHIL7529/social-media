import { apiFetch } from "../Utils/api";

const jsonPost = (path, body) =>
  apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  });

export const postService = {
  getFeed: ({ cursor, limit = 10 } = {}) =>
    jsonPost("/api/post", { cursor, limit }),
  like: (postId) => jsonPost("/api/post/liked", { _id: postId }),
  save: (postId) => jsonPost("/api/post/saved", { _id: postId }),
  remove: (postId) => jsonPost("/api/post/deletePost", { _id: postId }),
  follow: (userName) => jsonPost("/api/user/follow", { userName }),
};
