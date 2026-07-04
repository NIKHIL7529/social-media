import { jsonPost } from "@/lib/api";
import type { User } from "@/types/social";

export const userService = {
  getById: (userId: string) =>
    jsonPost<{ status: number; user: User }, { _id: string }>("/api/user/user", { _id: userId }),
  getByName: (name: string) =>
    jsonPost<{ status: number; user: User }, { name: string }>("/api/user/byName", { name }),
  follow: (userName: string) =>
    jsonPost<{ status: number; message: string; user: User }, { userName: string }>("/api/user/follow", { userName }),
};
