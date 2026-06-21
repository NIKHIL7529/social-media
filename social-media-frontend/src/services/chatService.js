import { apiFetch } from "../Utils/api";

const jsonPost = (path, body) =>
  apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-type": "application/json" },
  });

export const chatService = {
  getChats: () => apiFetch("/api/message/allChats"),
  getMessages: (conversationId, options = {}) =>
    jsonPost("/api/message/messages", {
      _id: conversationId,
      ...options,
    }),
  sendMessage: ({ conversationId, receiver, message }) =>
    jsonPost("/api/message/sendMessage", {
      _id: conversationId,
      receiver,
      msg: message,
    }),
  getFollowings: () => apiFetch("/api/message/followings"),
  createGroup: (group) => jsonPost("/api/group/createGroup", group),
};
