"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import { notificationService } from "@/features/notifications/notification-service";
import { queryKeys } from "@/lib/query-keys";
import { relativeTime } from "@/lib/time";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: notificationService.list,
  });
  const markReadMutation = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-feed">
        <div className="rounded-lg border border-line bg-white p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-ink">Notifications</h1>
              <p className="mt-1 text-sm text-ink-muted">{notificationsQuery.data?.unread || 0} unread</p>
            </div>
            <button
              onClick={() => markReadMutation.mutate()}
              disabled={markReadMutation.isPending || !notificationsQuery.data?.unread}
              className="min-h-10 rounded-md border border-line px-3 text-sm font-bold text-accent-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              Mark read
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-line bg-white shadow-card">
          {notificationsQuery.isLoading && <p className="p-4 text-sm text-ink-muted">Loading notifications...</p>}
          {notificationsQuery.error && <p className="p-4 text-sm text-ink-muted">Login to view notifications.</p>}
          {notificationsQuery.data?.notifications.length === 0 && <p className="p-4 text-sm text-ink-muted">No notifications yet.</p>}
          {notificationsQuery.data?.notifications.map((notification) => (
            <article key={notification._id} className={`border-b border-line p-4 last:border-b-0 ${notification.read ? "bg-white" : "bg-accent-soft"}`}>
              <p className="font-bold text-ink">{notification.text}</p>
              <p className="mt-1 text-sm text-ink-muted">{relativeTime(notification.createdAt)}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
