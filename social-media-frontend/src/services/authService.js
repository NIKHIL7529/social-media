import { apiFetch } from "../Utils/api";

export const authService = {
  getProfile: () => apiFetch("/api/user/profile"),
  login: (credentials) =>
    apiFetch("/api/user/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    }),
  logout: () => apiFetch("/api/user/logout"),
};
