"use client";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Camera, ChevronRight, LogIn, LogOut, Palette, UserPlus, type LucideIcon } from "lucide-react";
import { useCurrentUser } from "@/features/auth/use-current-user";
import { UserAvatar } from "@/components/user-avatar";
import { useLogout } from "@/features/auth/use-logout";
import { BRAND } from "@/config/brand";
import { ThemeControl } from "@/components/theme-control";
import { SettingsSkeleton } from "@/components/skeletons";

export default function SettingsScreen() {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();
  if (isLoading) return <SettingsSkeleton />;
  return (
      <section className="settings-page" aria-labelledby="settings-title">
        <header className="flex items-center gap-3">
          <Link href="/posts" aria-label="Back to home" className="grid size-9 shrink-0 place-items-center rounded-xl hover:bg-surface-raised lg:hidden">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 id="settings-title" className="text-3xl font-extrabold sm:text-4xl">Settings</h1>
            <p className="mt-2 text-sm text-ink-muted">Manage your {BRAND.name} account.</p>
          </div>
        </header>
    <div className="settings-cards">
      <article className="settings-card settings-profile surface-card">
        <div className="settings-avatar">
          <UserAvatar name={user?.name || 'Your profile'} photo={user?.photo} size={88} />
          <span className="settings-camera" aria-hidden="true"><Camera size={16} /></span>
        </div>
        <div className="settings-card-content">
          <h2>Profile</h2>
          <p><span className="settings-copy-full">Manage your public information and profile photo.</span><span className="settings-copy-compact">Public info and photo.</span></p>
          {user ? <Link className="action-primary" href="/editProfile">
            Edit profile <ArrowRight size={17} aria-hidden="true" />
          </Link> : <span aria-disabled="true" className="action-primary opacity-50">Edit profile <ArrowRight size={17} aria-hidden="true" /></span>}
        </div>
      </article>
      <AccountCard icon={UserPlus} title="Create new account" description={`Register a separate ${BRAND.name} profile.`} compactDescription="Separate profile." action="Sign up" href="/signup" />
      <AccountCard icon={LogIn} title="Switch account" description="Log in with another account on this device." compactDescription="Another account." action="Log in" href="/login" />
      <article className="settings-card settings-appearance surface-card" aria-labelledby="appearance-title">
        <span className="settings-icon" aria-hidden="true"><Palette size={26} /></span>
        <div className="min-w-0 flex-1"><h2 id="appearance-title" className="font-bold">Appearance</h2>
        <p className="mt-1 text-xs text-ink-muted">System follows your device.</p></div>
        <ThemeControl />
      </article>
      <button className="settings-card settings-logout surface-card disabled:opacity-50" disabled={!user} onClick={logout}>
        <span className="settings-icon" aria-hidden="true"><LogOut size={26} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-bold text-danger">Log out</span>
          <span className="mt-1 block text-xs text-ink-muted sm:text-sm">Sign out of your current session.</span>
        </span>
        <ChevronRight size={20} className="shrink-0 text-danger" aria-hidden="true" />
      </button>
    </div>
      </section>
  );
}
function AccountCard({ icon: Icon, title, description, compactDescription, action, href }: { icon: LucideIcon; title: string; description: string; compactDescription: string; action: string; href: string }) {
  return (
    <article className="settings-card surface-card">
      <span className="settings-icon" aria-hidden="true"><Icon size={26} /></span>
      <div className="settings-card-content">
        <h2>{title}</h2>
        <p><span className="settings-copy-full">{description}</span><span className="settings-copy-compact">{compactDescription}</span></p>
        <Link className="action-secondary" href={href}>
          {action}<ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
