import { apiFetch } from "@/lib/api";
import type { NotificationItem } from "@/types/social";

export const notificationService = {
  list: () => apiFetch<{ status: number; notifications: NotificationItem[]; unread: number }>("/api/notifications"),
  markRead: () => apiFetch<{ status: number; message: string }>("/api/notifications/read", { method: "POST" }),
};
