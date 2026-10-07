"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Home, LogIn, LogOut, MessageCircle, PlusCircle, Search, Settings, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { authService } from "@/features/auth/auth-service";
import { Brand } from "@/components/brand";
import { useLogout } from "@/features/auth/use-logout";
import { queryKeys } from "@/lib/query-keys";

const links = [
  { href: "/posts", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/chat", label: "Messages", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.authProfile,
    queryFn: async () => {
      try {
        const data = await authService.getProfile();
        return data.user;
      } catch {
        return null;
      }
    },
  });
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 flex h-[var(--nav-height)] items-center justify-between border-b border-line bg-white px-5 shadow-soft lg:px-8">
        <Brand href="/posts" priority />
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/addPost"
                aria-label="Create post"
                title="Create post"
                className="grid size-10 place-items-center rounded-md text-accent-deep hover:bg-accent-soft"
              >
                <PlusCircle />
              </Link>
              <Link
                href="/savedPosts"
                aria-label="Saved posts"
                title="Saved posts"
                className="grid size-10 place-items-center rounded-md text-accent-deep hover:bg-accent-soft"
              >
                <Bookmark />
              </Link>
              <button
                onClick={logout}
                className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 font-bold text-ink hover:bg-accent-soft"
              >
                Logout
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 font-bold hover:bg-accent-soft" href="/login">
                <LogIn size={18} />
                Login
              </Link>
              <Link className="inline-flex min-h-10 items-center rounded-md px-3 font-bold hover:bg-accent-soft" href="/signup">
                Signup
              </Link>
            </>
          )}
        </nav>
      </header>

      <aside className="fixed bottom-0 left-0 z-20 grid h-[var(--bottom-nav-height)] w-full grid-cols-5 border-t border-line bg-white lg:top-[var(--nav-height)] lg:h-[calc(100vh-var(--nav-height))] lg:w-[var(--sidebar-width)] lg:grid-cols-1 lg:content-start lg:border-r lg:border-t-0 lg:px-3 lg:py-5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-center gap-3 px-3 text-sm font-bold lg:h-12 lg:justify-start lg:rounded-md ${
                active ? "bg-accent-soft text-accent-deep" : "text-ink-muted hover:bg-accent-soft hover:text-accent-deep"
              }`}
              title={label}
            >
              <Icon size={21} />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          );
        })}
      </aside>

      <main className="min-h-screen px-4 pb-[calc(var(--bottom-nav-height)+18px)] pt-[calc(var(--nav-height)+18px)] lg:ml-[var(--sidebar-width)] lg:p-6 lg:pt-[calc(var(--nav-height)+24px)]">
        {children}
      </main>
    </>
  );
}
