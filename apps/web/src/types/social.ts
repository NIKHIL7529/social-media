export type User = {
  _id: string;
  name: string;
  username?: string;
  email?: string;
  dob?: string;
  gender?: string;
  city?: string;
  country?: string;
  description?: string;
  photo?: string;
  followers?: string[];
  followings?: string[];
  saved?: string[];
  liked?: string[];
};

export type Post = {
  _id: string;
  topic?: string;
  text?: string;
  photo: string;
  likes: number;
  saved: number;
  share: number;
  commentCount?: number;
  commentable: boolean;
  user: User;
  comments?: PostComment[];
  createdAt?: string;
  updatedAt?: string;
};

export type PostComment = {
  _id: string;
  post?: string;
  sender: string;
  comment: string;
  createdAt?: string;
};

export type FeedPage = {
  status: number;
  message: string;
  post: Post[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
  };
};

export type LastMessage = {
  message: string;
  sender: string;
  createdAt?: string;
};

export type Chat = {
  _id?: string;
  chatId: string;
  users: string[];
  name?: string;
  group: boolean;
  updatedAt?: string;
  lastMessage?: LastMessage;
  unreadCount?: number;
};

export type ChatMessage = {
  _id: string;
  conversation: string;
  sender: string;
  message: string;
  type?: "text" | "system";
  createdAt?: string;
  updatedAt?: string;
};

export type NotificationItem = {
  _id: string;
  recipient: string;
  actor: string;
  type: "like" | "comment" | "follow" | "message";
  entityId: string;
  text: string;
  read: boolean;
  createdAt?: string;
  updatedAt?: string;
};
