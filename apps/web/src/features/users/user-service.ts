import { jsonPost } from "@/lib/api";
import type { User } from "@/types/social";

export const userService = {
  search: (name: string, signal?: AbortSignal) =>
    jsonPost<{ status: number; search_users: User[] }, { name: string }>("/api/user/search", { name }, signal),
  getById: (userId: string, signal?: AbortSignal) =>
    jsonPost<{ status: number; user: User }, { _id: string }>("/api/user/user", { _id: userId }, signal),
  getByName: (name: string, signal?: AbortSignal) =>
    jsonPost<{ status: number; user: User }, { name: string }>("/api/user/byName", { name }, signal),
  follow: (userName: string) =>
    jsonPost<{ status: number; message: string; following: boolean; user: User }, { userName: string }>("/api/user/follow", { userName }),
};
