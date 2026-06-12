
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-slate-800", className)}
      {...props}
    />
  );
}

export function StatsSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 h-full flex flex-col justify-between">
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-16" />
      </div>
      <Skeleton className="h-4 w-20 mt-2" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="flex-1 w-full min-h-[250px] flex items-end justify-between gap-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-full flex flex-col justify-end gap-2">
          <Skeleton className="w-full rounded-t-lg" style={{ height: `${[40, 65, 30, 80, 55][i]}%` }} />
          <Skeleton className="h-3 w-12 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex gap-4">
      <Skeleton className="w-1 h-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-gray-100 dark:border-slate-800 last:border-0">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard Skeleton Variants ───────────────────────────────────────────────

/** Matches the glassmorphic test card in tests/page.tsx */
export function TestCardSkeleton() {
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-slate-700/50 space-y-4 animate-pulse">
      <div className="flex items-start justify-between">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

/** Matches the result row cards in results/page.tsx */
export function ResultRowSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden animate-pulse">
      <div className="p-6 flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  );
}

/** Matches the test detail page: banner + info rows + CTA */
export function TestDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse pb-10">
      <Skeleton className="h-8 w-28 rounded-full" />
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-4 space-y-2 border border-gray-200/50 dark:border-slate-800/50 flex flex-col items-center">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      <Skeleton className="h-14 w-full rounded-2xl" />
    </div>
  );
}

/** Matches the take-test page: question card + 4 option bars */
export function TakeTestSkeleton() {
  return (
    <div className="min-h-screen p-4 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-200/50 dark:border-slate-800/50 space-y-4">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-12 flex-1 rounded-2xl" />
        <Skeleton className="h-12 flex-1 rounded-2xl" />
      </div>
    </div>
  );
}

/** Matches both result detail pages: score summary + question list */
export function AttemptResultSkeleton() {
  return (
    <div className="space-y-6 animate-pulse pb-10">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-slate-800/50 flex flex-col items-center gap-4">
        <Skeleton className="w-28 h-28 rounded-full" />
        <Skeleton className="h-7 w-40" />
        <div className="grid grid-cols-3 gap-6 w-full pt-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 dark:border-slate-800/50 flex gap-4">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Matches the profile page: avatar + 6 menu card rows */
export function ProfileSkeleton() {
  return (
    <div className="max-w-md mx-auto space-y-4 animate-pulse">
      <div className="flex flex-col items-center pt-6 pb-4 gap-3">
        <Skeleton className="w-[100px] h-[100px] rounded-full" />
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-48" />
      </div>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[28px] p-4 flex items-center gap-4 border border-gray-200/50 dark:border-slate-800/50">
          <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="w-5 h-5 rounded flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
