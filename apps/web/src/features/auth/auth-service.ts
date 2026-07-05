import { apiFetch, jsonPost } from "@/lib/api";
import type { User } from "@/types/social";

export type EditProfilePayload = {
  username: string;
  dob: string;
  gender: string;
  city: string;
  country: string;
  description: string;
  photo: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export const authService = {
  getProfile: () => apiFetch<{ status: number; user: User }>("/api/user/profile", { skipUnauthorizedEvent: true }),
  login: (credentials: { name: string; password: string }) =>
    jsonPost<{ status: number; message: string; user: User }, typeof credentials>("/api/user/login", credentials),
  logout: () => apiFetch<{ status: number }>("/api/user/logout", { method: "POST" }),
  editProfile: (profile: EditProfilePayload) =>
    jsonPost<{ status: number; message: string; user: User }, typeof profile>("/api/user/editProfile", profile),
  changePassword: (passwords: ChangePasswordPayload) =>
    jsonPost<{ status: number; message: string }, typeof passwords>("/api/user/changePassword", passwords),
};
