export function FeedSkeleton() {
  return (
    <div className="mb-5 rounded-lg border border-line bg-white p-4" aria-hidden="true">
      <div className="flex items-center gap-3">
        <span className="size-11 rounded-full bg-slate-200" />
        <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="my-4 aspect-[16/10] w-full animate-pulse rounded-md bg-slate-200" />
      <div className="mt-2 h-3 animate-pulse rounded bg-slate-200" />
      <div className="mt-2 h-3 w-3/5 animate-pulse rounded bg-slate-200" />
    </div>
  );
}
