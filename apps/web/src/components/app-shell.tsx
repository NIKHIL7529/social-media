"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LogIn, MessageCircle, Search, Settings, UserRound } from "lucide-react";

import { Brand } from "@/components/brand";
import { ActivityRail } from "@/components/activity-rail";
import { useCurrentUser } from "@/features/auth/use-current-user";
import { LoadingState, Skeleton } from "@/components/skeletons";

const links = [
  { href: "/posts", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/chat", label: "Messages", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: user, error: profileError, isLoading } = useCurrentUser();
  const isSettings = pathname === "/settings";
  const isChat = pathname === "/chat" || pathname.startsWith("/chat/");
  const loginRequired = !user && ["/profile", "/savedPosts", "/editProfile", "/addPost"].includes(pathname);
  const showRail = !isSettings && !isChat && !loginRequired;

  return (
    <>
      <header className="nav-glass fixed inset-x-0 top-0 z-30 flex h-[var(--nav-height)] items-center justify-between gap-2 border-b border-line px-3 sm:px-5 lg:hidden">
        <span className="app-brand shrink-0"><Brand href="/posts" priority /></span>
        <nav className="flex items-center gap-2">
          {isLoading ? <LoadingState label="Loading account"><Skeleton className="h-9 w-24" /></LoadingState> : !user ? (
            <Link className="inline-flex min-h-10 items-center gap-2 rounded px-3 font-bold hover:bg-accent-soft" href="/login">
              <LogIn size={18} className="hidden sm:block" />Login
            </Link>
          ) : null}
        </nav>
      </header>

      <aside className="nav-glass fixed bottom-0 left-0 z-20 grid h-[var(--bottom-nav-height)] w-full grid-cols-5 border-t border-line lg:top-0 lg:h-dvh lg:w-[var(--sidebar-width)] lg:grid-cols-1 lg:content-start lg:gap-2 lg:border-r lg:border-t-0 lg:px-3 lg:py-5">
        <div className="desktop-brand mb-5 hidden px-1 lg:block"><Brand href="/posts" priority /></div>
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item flex flex-col items-center justify-center gap-1 px-3 text-sm font-bold lg:h-12 lg:flex-row lg:gap-3 lg:justify-start lg:rounded ${
                active ? "bg-accent-soft text-accent-deep" : "text-ink-muted hover:bg-accent-soft hover:text-accent-deep"
              }`}
              title={label}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={21} />
              <span className="text-[10px] leading-tight lg:text-sm">{label}</span>
            </Link>
          );
        })}
        {!isLoading && !user && <Link href="/login" className="mt-3 hidden min-h-12 items-center gap-3 rounded px-3 font-bold text-accent-deep hover:bg-accent-soft lg:flex"><LogIn size={21} />Login</Link>}
      </aside>

      <main className={isSettings ? "settings-shell" : isChat ? "flex h-dvh min-w-0 flex-col pt-[var(--nav-height)] pb-[var(--bottom-nav-height)] lg:ml-[var(--sidebar-width)] lg:pb-0" : "min-h-screen px-4 pb-[calc(var(--bottom-nav-height)+18px)] pt-[calc(var(--nav-height)+18px)] lg:ml-[var(--sidebar-width)] lg:p-6 lg:pt-[calc(var(--nav-height)+24px)]"}>
        {profileError && <p role="alert" className="mx-auto mb-4 max-w-feed break-words rounded border border-danger/30 bg-surface p-4 text-danger">{profileError.message}</p>}
        {showRail ? <div className="mx-auto grid max-w-[1440px] min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]"><div className="min-w-0">{children}</div><ActivityRail user={user} /></div> : children}
      </main>
    </>
  );
}
