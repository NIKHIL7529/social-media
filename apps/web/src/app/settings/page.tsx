"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogIn, LogOut, Shield, UserPlus, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import { AppShell, useCurrentUser } from "@/components/app-shell";
import { authService } from "@/features/auth/auth-service";

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  async function logout() {
    try {
      await toast.promise(authService.logout(), {
        loading: "Signing out...",
        success: "Signed out",
        error: "Signed out locally",
      });
    } catch {
      // Logout should still clear local state if the API is unavailable.
    } finally {
      queryClient.setQueryData(["auth", "profile"], null);
      router.push("/login");
    }
  }

  return (
    <AppShell>
      <section className="mx-auto w-full max-w-feed space-y-4">
        <header className="rounded-lg border border-line bg-white p-5 shadow-card">
          <h1 className="text-2xl font-extrabold text-ink">Settings</h1>
          <p className="mt-2 text-ink-muted">{user ? `Signed in as ${user.name}` : "Login to manage your account."}</p>
        </header>

        <SettingRow icon={<UserRound />} title="Profile" description="Update public profile details and photo." action="Edit" onClick={() => router.push("/editProfile")} disabled={!user} />
        <SettingRow icon={<UserPlus />} title="Create new account" description="Register a separate SocialSphere profile." action="Signup" onClick={() => router.push("/signup")} />
        <SettingRow icon={<LogIn />} title="Switch profile" description="Login with another account on this device." action="Login" onClick={() => router.push("/login")} />
        <SettingRow icon={<Shield />} title="Session security" description="Authentication uses an HTTP-only JWT cookie." action="Review" disabled />
        <SettingRow icon={<Bell />} title="Notifications" description="Notification preferences are ready for push/email integration." action="Soon" disabled />

        <button
          onClick={logout}
          disabled={!user}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut size={18} />
          Logout
        </button>
      </section>
    </AppShell>
  );
}

function SettingRow({
  icon,
  title,
  description,
  action,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-line bg-white p-4 shadow-soft">
      <span className="grid size-11 flex-shrink-0 place-items-center rounded-md bg-accent-soft text-accent-deep [&_svg]:size-5">{icon}</span>
      <div className="min-w-0 flex-1">
        <h2 className="font-extrabold text-ink">{title}</h2>
        <p className="text-sm leading-6 text-ink-muted">{description}</p>
      </div>
      <button onClick={onClick} disabled={disabled} className="min-h-10 rounded-md border border-line px-3 text-sm font-bold text-accent-deep disabled:cursor-not-allowed disabled:opacity-50">
        {action}
      </button>
    </div>
  );
}
