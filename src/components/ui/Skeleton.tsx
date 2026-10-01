export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700 ${className}`}
      aria-hidden="true"
    />
  );
}

export function MachineCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-2 w-full" />
    </div>
  );
}

export function StoreCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  );
}
