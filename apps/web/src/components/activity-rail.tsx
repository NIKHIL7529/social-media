import Link from "next/link";
import { ArrowUpRight, Bookmark, MessageCircle, Plus, Search } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import type { User } from "@/types/social";

export function ActivityRail({ user }: { user?: User | null }) {
  return <aside aria-label="Your sphere" className="activity-rail sticky top-6 hidden h-[calc(100dvh-48px)] xl:flex xl:flex-col xl:justify-center"><div className="space-y-[15px]">
    <section className="rail-feature surface-card p-[19px]">
      <p className="mb-[19px] text-xs font-bold uppercase tracking-[.16em] text-accent">Your sphere</p>
      {user ? <><Link href="/profile" className="flex items-center gap-[11px]"><UserAvatar name={user.name} photo={user.photo} size={44} /><span className="min-w-0 flex-1 truncate font-bold">{user.name}</span><ArrowUpRight size={17} className="text-ink-muted" /></Link><div className="mt-[19px] grid grid-cols-2 gap-[7px]"><Link href="/profile" className="rounded bg-surface-raised p-[11px]"><span className="block text-xl font-bold">{user.followers?.length || 0}</span><span className="text-xs text-ink-muted">Followers</span></Link><Link href="/profile" className="rounded bg-surface-raised p-[11px]"><span className="block text-xl font-bold">{user.followings?.length || 0}</span><span className="text-xs text-ink-muted">Following</span></Link></div></> : <><h2 className="text-xl font-bold">Find your people.</h2><p className="mt-2 text-sm leading-relaxed text-ink-muted">Share your moments and join the conversation.</p><Link href="/signup" className="action-primary mt-[19px] w-full">Create an account</Link></>}
    </section>
    <section className="rail-links surface-card p-[11px]"><h2 className="px-2 py-[11px] text-sm font-bold">Make it your own</h2>{[
      { href: '/search', label: 'Discover people', icon: Search },
      { href: user ? '/savedPosts' : '/login', label: 'Saved moments', icon: Bookmark },
      { href: '/chat', label: 'Your conversations', icon: MessageCircle },
      { href: user ? '/addPost' : '/login', label: 'Share a moment', icon: Plus },
    ].map(({href,label,icon: Icon}) => <Link key={label} href={href} className="flex items-center gap-[11px] rounded px-2 py-[11px] text-sm text-ink-muted hover:bg-surface-raised hover:text-ink"><span className="rail-icon"><Icon size={18} /></span><span className="flex-1">{label}</span><ArrowUpRight size={15} /></Link>)}</section>
    {user && <Link href="/savedPosts" className="surface-card flex items-center gap-[11px] p-[19px]"><Bookmark size={24} className="text-accent" /><span><span className="block font-bold">{user.saved?.length || 0} saved posts</span><span className="text-xs text-ink-muted">Revisit your favorites</span></span></Link>}
  </div></aside>;
}
