import type { ReactNode } from "react";

export function LoadingState({ children, label = "Loading content", className }: { children: ReactNode; label?: string; className?: string }) {
  return <div role="status" aria-label={label} className={className}><span className="sr-only">{label}</span><div aria-hidden="true" className={className ? "h-full" : undefined}>{children}</div></div>;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-line motion-reduce:animate-none ${className}`} />;
}

export function ListSkeleton() {
  return <LoadingState label="Loading people"><div className="space-y-3 p-3">{[0, 1, 2].map((item) => <div key={item} className="flex items-center gap-3"><Skeleton className="size-10 shrink-0 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-2/3" /><Skeleton className="h-3 w-1/2" /></div></div>)}</div></LoadingState>;
}

export function ProfileSkeleton() {
  return <LoadingState label="Loading profile"><div className="space-y-5"><div className="flex items-center gap-4"><Skeleton className="size-20 shrink-0 rounded-full" /><div className="flex-1 space-y-3"><Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-2/3" /></div></div><Skeleton className="h-4 w-full" /><div className="grid grid-cols-3 gap-1 rounded border border-line p-3">{[0,1,2].map(item => <div key={item} className="space-y-2 px-3"><Skeleton className="mx-auto h-5 w-8" /><Skeleton className="h-3 w-full" /></div>)}</div><Skeleton className="h-10 w-32" /><div className="grid gap-3 sm:grid-cols-2">{[0,1,2,3].map(item => <Skeleton key={item} className="h-16 w-full" />)}</div></div></LoadingState>;
}

export function SettingsSkeleton() {
  return <LoadingState label="Loading settings"><section className="settings-page"><header><Skeleton className="h-10 w-40" /><Skeleton className="mt-2 h-4 w-64 max-w-full" /></header><div className="settings-cards">{[0,1,2,3,4].map(item => <div key={item} className={`settings-card surface-card ${item === 0 ? "settings-profile" : item === 3 ? "settings-appearance" : item === 4 ? "settings-logout" : ""}`}><Skeleton className={`${item === 0 ? "size-20 rounded-full" : "size-14"} shrink-0`} /><div className="flex-1 space-y-3"><Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-full" />{item !== 4 && <Skeleton className="h-10 w-28" />}</div></div>)}</div></section></LoadingState>;
}

export function CreatePostSkeleton() {
  return <LoadingState label="Loading post editor"><div className="mx-auto max-w-feed rounded border border-line bg-surface p-5"><Skeleton className="h-8 w-32" /><Skeleton className="mt-5 h-48 w-full" /><div className="mt-5 space-y-4"><Skeleton className="h-4 w-20" /><Skeleton className="h-12 w-full" /><Skeleton className="h-4 w-20" /><Skeleton className="h-32 w-full" /><Skeleton className="h-5 w-40" /><Skeleton className="h-11 w-full" /></div></div></LoadingState>;
}

export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return <LoadingState label="Loading form"><div className="space-y-5"><Skeleton className="h-7 w-1/2" />{Array.from({length: fields}, (_, item) => <div key={item} className="space-y-2"><Skeleton className="h-3 w-1/4" /><Skeleton className="h-12 w-full" /></div>)}<Skeleton className="h-11 w-full" /></div></LoadingState>;
}

export function EditProfileSkeleton() {
  return <LoadingState label="Loading profile editor"><div className="space-y-5"><Skeleton className="aspect-[16/9] w-full" /><div className="grid gap-4 sm:grid-cols-2">{[0,1,2,3,4].map(item => <div key={item} className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-12 w-full" /></div>)}</div><Skeleton className="h-24 w-full" /><Skeleton className="h-11 w-full" /></div></LoadingState>;
}

export function ChatSkeleton() {
  return <LoadingState label="Loading messages" className="h-full min-h-0 flex-1"><div className="grid h-full min-h-0 gap-6 bg-surface p-4 lg:grid-cols-[minmax(240px,320px)_minmax(0,1fr)]"><ListSkeleton /><div className="space-y-5"><Skeleton className="h-12 w-full" /><Skeleton className="h-14 w-3/4" /><Skeleton className="ml-auto h-14 w-2/3" /><Skeleton className="h-14 w-3/4" /></div></div></LoadingState>;
}
