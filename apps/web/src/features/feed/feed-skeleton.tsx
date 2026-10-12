import { LoadingState, Skeleton } from "@/components/skeletons";

export function FeedSkeleton() {
  return (
    <LoadingState label="Loading posts"><div className="mb-5 bg-surface p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-full" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="my-4 h-[35dvh] w-full" />
      <Skeleton className="mt-2 h-3" />
      <Skeleton className="mt-2 h-3 w-3/5" />
      <div className="mt-4 flex items-center gap-3"><Skeleton className="size-9" /><Skeleton className="size-9" /><Skeleton className="size-9" /><Skeleton className="ml-auto size-9" /></div>
    </div></LoadingState>
  );
}
