import { apiFetch, jsonPost } from "@/lib/api";
import type { User } from "@/types/social";

export const authService = {
  getProfile: () => apiFetch<{ status: number; user: User }>("/api/user/profile", { skipUnauthorizedEvent: true }),
  login: (credentials: { name: string; password: string }) =>
    jsonPost<{ status: number; message: string; user: User }, typeof credentials>("/api/user/login", credentials),
  logout: () => apiFetch<{ status: number }>("/api/user/logout"),
  editProfile: (profile: {
    username: string;
    dob: string;
    gender: string;
    city: string;
    country: string;
    description: string;
    photo: string;
  }) => jsonPost<{ status: number; message: string; user: User }, typeof profile>("/api/user/editProfile", profile),
  changePassword: (passwords: { currentPassword: string; newPassword: string }) =>
    jsonPost<{ status: number; message: string }, typeof passwords>("/api/user/changePassword", passwords),
};
