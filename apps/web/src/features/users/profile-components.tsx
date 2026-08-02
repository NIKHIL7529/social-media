"use client";

import { UserAvatar } from "@/components/user-avatar";

import type { User } from "@/types/social";

export type SocialList = "followers" | "followings";

export function ProfileHeader({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-4">
      <UserAvatar name={user.name} photo={user.photo} size={80} />
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-extrabold text-ink">{user.name}</h1>
        <p className="text-sm text-ink-muted">
          {user.city || "No city set"}
          {user.country ? ` - ${user.country}` : ""}
        </p>
      </div>
    </div>
  );
}

export function ProfileStats({
  followers,
  followings,
  onSelectList,
  posts,
}: {
  followers: number;
  followings: number;
  onSelectList: (list: SocialList) => void;
  posts: number;
}) {
  return (
    <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-lg border border-line text-center">
      <ProfileStat label="Followers" value={followers} onClick={() => onSelectList("followers")} />
      <ProfileStat label="Following" value={followings} onClick={() => onSelectList("followings")} />
      <ProfileStat label="Posts" value={posts} />
    </div>
  );
}

export function ProfileInfoGrid({ user }: { user: User }) {
  return (
    <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
      <ProfileInfo label="City" value={user.city} />
      <ProfileInfo label="Country" value={user.country} />
      <ProfileInfo label="Gender" value={user.gender} />
      <ProfileInfo label="Date of birth" value={user.dob} />
    </div>
  );
}

function ProfileStat({ label, value, onClick }: { label: string; value: number; onClick?: () => void }) {
  const content = (
    <>
      <p className="text-lg font-extrabold text-ink">{value}</p>
      <p className="text-xs font-bold uppercase text-ink-muted">{label}</p>
    </>
  );
  if (onClick) {
    return (
      <button onClick={onClick} className="border-r border-line p-3 last:border-r-0 hover:bg-accent-soft">
        {content}
      </button>
    );
  }
  return <div className="border-r border-line p-3 last:border-r-0">{content}</div>;
}

function ProfileInfo({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="font-bold text-ink">{label}</p>
      <p className="mt-1 text-ink-muted">{value || "Not set"}</p>
    </div>
  );
}
