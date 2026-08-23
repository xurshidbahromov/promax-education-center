
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

/** Matches the test detail page: banner+ info rows+ CTA */
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

/** Matches the take-test page: question card+ 4 option bars */
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

/** Matches both result detail pages: score summary+ question list */
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

/** Matches the profile page: avatar+ 6 menu card rows */
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

export function CompetitionBannerTeaserSkeleton() {
  return (
    <div className="relative w-full max-w-full min-w-0">
      <div className="relative block w-full max-w-full min-w-0">
        {/* Top shelf tab row */}
        <div className="flex items-stretch relative z-20 w-full min-w-0">
          <div className="w-[37%] sm:w-[32%] px-2.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center shrink-0 min-w-0">
            <Skeleton className="h-4 sm:h-6 w-full max-w-[120px] rounded-lg bg-slate-200/80 dark:bg-slate-700/50" />
          </div>
          <div className="flex-1 min-w-0 bg-white/60 dark:bg-slate-900/60 px-2.5 sm:px-6 py-2.5 sm:py-3.5 rounded-t-3xl border-t border-r border-white/60 dark:border-slate-800/60 border-b-0 border-l-0 flex items-center justify-center gap-1.5 backdrop-blur-xl">
            <Skeleton className="w-3.5 h-3.5 rounded-full bg-slate-200/80 dark:bg-slate-700/50 shrink-0" />
            <Skeleton className="h-3.5 w-24 sm:w-36 max-w-full bg-slate-200/80 dark:bg-slate-700/50 rounded-md" />
          </div>
        </div>

        {/* Main card body */}
        <div className="relative z-10 w-full max-w-full rounded-b-3xl rounded-tl-3xl rounded-tr-none bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4.5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-l border-r border-t-0 border-white/60 dark:border-slate-800/60 shadow-none">
          {/* Smooth Top-Left Corner Curved Border */}
          <div className="absolute top-0 left-0 w-[37%] sm:w-[32%] h-6 rounded-tl-3xl border-t border-l border-white/60 dark:border-slate-800/60 pointer-events-none z-10" />

          <div className="relative z-10 space-y-1.5 flex-1 w-full sm:w-auto min-w-0">
            <Skeleton className="h-5 sm:h-6 w-40 sm:w-60 max-w-full rounded-lg bg-slate-200/80 dark:bg-slate-700/50" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="w-3.5 h-3.5 rounded-full bg-slate-200/80 dark:bg-slate-700/50 shrink-0" />
              <Skeleton className="h-3.5 w-32 sm:w-52 max-w-full rounded-md bg-slate-200/80 dark:bg-slate-700/50" />
            </div>
          </div>
          <div className="relative z-10 shrink-0 w-full sm:w-auto flex justify-end">
            <Skeleton className="h-8 sm:h-9 w-full sm:w-28 rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Matches dashboard home page: greeting + 2 competition banners + subjects + quick access + stats + tests + announcements */
export function DashboardHomeSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-[1600px] w-full max-w-full min-w-0 mx-auto pt-1 sm:pt-2 animate-pulse overflow-hidden">
      {/* 1. Hero Greeting */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <Skeleton className="h-4 w-36 max-w-full bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
        <Skeleton className="h-7 sm:h-8 w-56 sm:w-72 max-w-full bg-slate-200/80 dark:bg-slate-700/50 rounded-xl" />
      </div>

      {/* 2. Onlayn Musobaqalar Bannerlari (Milliy va Xalqaro Musobaqalar) */}
      <div className="flex flex-col gap-4 w-full min-w-0">
        <CompetitionBannerTeaserSkeleton />
        <CompetitionBannerTeaserSkeleton />
      </div>

      {/* 3. Subject Progress Cards (2 Columns) */}
      <section className="w-full min-w-0">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
          <Skeleton className="h-4 w-16 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/60 dark:border-slate-800/60 flex flex-col gap-3 min-w-0"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-200/80 dark:bg-slate-700/50" />
                <Skeleton className="h-3.5 w-8 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
              </div>
              <Skeleton className="h-4 w-2/3 bg-slate-200/80 dark:bg-slate-700/50 rounded-md" />
              <Skeleton className="h-1.5 w-full bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Quick Access Cards (2 Columns) */}
      <section className="w-full min-w-0">
        <Skeleton className="h-4 w-20 bg-slate-200/80 dark:bg-slate-700/50 rounded-full mb-4" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/60 dark:border-slate-800/60 flex items-center gap-3 sm:gap-4 min-w-0"
            >
              <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-200/80 dark:bg-slate-700/50 shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <Skeleton className="h-4 w-16 sm:w-20 max-w-full bg-slate-200/80 dark:bg-slate-700/50 rounded-md" />
                <Skeleton className="h-3 w-20 sm:w-28 max-w-full bg-slate-200/80 dark:bg-slate-700/50 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Stats Row (3 Columns) */}
      <section className="grid grid-cols-3 gap-3 sm:gap-4 w-full min-w-0">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/60 dark:border-slate-800/60 flex flex-col items-center gap-2 text-center min-w-0"
          >
            <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-200/80 dark:bg-slate-700/50 mb-1" />
            <Skeleton className="h-5 sm:h-6 w-10 sm:w-12 max-w-full bg-slate-200/80 dark:bg-slate-700/50 rounded-md" />
            <Skeleton className="h-3 w-12 sm:w-16 max-w-full bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
          </div>
        ))}
      </section>

      {/* 6. Upcoming Tests */}
      <section className="w-full min-w-0">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-20 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
          <Skeleton className="h-4 w-16 bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
        </div>
        <div className="flex flex-col gap-3 w-full min-w-0">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/60 dark:border-slate-800/60 flex items-center gap-4 min-w-0"
            >
              <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-200/80 dark:bg-slate-700/50 shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <Skeleton className="h-4 w-3/4 max-w-full bg-slate-200/80 dark:bg-slate-700/50 rounded-md" />
                <Skeleton className="h-3 w-1/2 max-w-full bg-slate-200/80 dark:bg-slate-700/50 rounded-full" />
              </div>
              <Skeleton className="w-4 h-4 rounded bg-slate-200/80 dark:bg-slate-700/50 shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* 7. Announcements horizontal cards */}
      <section className="relative overflow-hidden w-full min-w-0 max-w-full">
        <Skeleton className="h-4 w-40 max-w-full bg-slate-200/80 dark:bg-slate-700/50 rounded-full mb-4" />
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar w-full min-w-0 max-w-full">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="shrink-0 w-[280px] max-w-[80vw] sm:w-[380px] h-[210px] sm:h-[250px] rounded-[2rem] bg-white/60 dark:bg-slate-900/60 border border-white/60 dark:border-slate-800/60 p-5 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-20 rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
                <Skeleton className="h-5 w-24 rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4 rounded-lg bg-slate-200/80 dark:bg-slate-700/50" />
                <Skeleton className="h-3.5 w-full rounded-md bg-slate-200/80 dark:bg-slate-700/50" />
                <Skeleton className="h-3.5 w-2/3 rounded-md bg-slate-200/80 dark:bg-slate-700/50" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ShopItemSkeleton() {
  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/80 dark:border-slate-800/80 rounded-[2rem] overflow-hidden shadow-lg shadow-black/5 flex flex-col justify-between text-left">
      <Skeleton className="w-full h-48 rounded-none bg-slate-200/80 dark:bg-slate-800/60" />
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-2/3 rounded-lg bg-slate-200/80 dark:bg-slate-800/60" />
          <Skeleton className="h-4 w-full rounded-md bg-slate-200/80 dark:bg-slate-800/60" />
          <Skeleton className="h-4 w-4/5 rounded-md bg-slate-200/80 dark:bg-slate-800/60" />
        </div>
        <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-20 rounded-lg bg-slate-200/80 dark:bg-slate-800/60" />
          <Skeleton className="h-8 w-24 rounded-xl bg-slate-200/80 dark:bg-slate-800/60" />
        </div>
      </div>
    </div>
  );
}

export function ShopPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-2xl bg-slate-200/80 dark:bg-slate-800/60 shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ShopItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function GamesPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[2rem] border border-white/80 dark:border-slate-800/80 p-6 flex flex-col justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-2xl bg-slate-200/80 dark:bg-slate-800/60" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4 rounded-md bg-slate-200/80 dark:bg-slate-800/60" />
                <Skeleton className="h-3 w-full rounded-md bg-slate-200/80 dark:bg-slate-800/60" />
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <Skeleton className="h-4 w-20 rounded-md bg-slate-200/80 dark:bg-slate-800/60" />
              <Skeleton className="h-9 w-28 rounded-xl bg-slate-200/80 dark:bg-slate-800/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Olympiads & Tournaments Skeletons ─────────────────────────────────────────

export function OlympiadsBannerSkeleton() {
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-7 border border-white/60 dark:border-slate-800/60 space-y-3">
      <Skeleton className="h-7 w-64 rounded-xl bg-slate-200/80 dark:bg-slate-700/50" />
      <Skeleton className="h-4 w-96 max-w-full rounded-lg bg-slate-200/80 dark:bg-slate-700/50" />
      <div className="flex items-center gap-3 pt-1">
        <Skeleton className="h-4 w-28 rounded-md bg-slate-200/80 dark:bg-slate-700/50" />
        <Skeleton className="h-4 w-32 rounded-md bg-slate-200/80 dark:bg-slate-700/50" />
        <Skeleton className="h-4 w-28 rounded-md bg-slate-200/80 dark:bg-slate-700/50" />
      </div>
    </div>
  );
}

export function TournamentsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white/60 dark:border-slate-800/60 shadow-none flex flex-col justify-between gap-5 h-[340px]"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24 rounded-md bg-slate-200/80 dark:bg-slate-700/50" />
              <Skeleton className="h-5 w-20 rounded-md bg-slate-200/80 dark:bg-slate-700/50" />
            </div>
            <Skeleton className="h-6 w-4/5 rounded-xl bg-slate-200/80 dark:bg-slate-700/50" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-full rounded-lg bg-slate-200/80 dark:bg-slate-700/50" />
              <Skeleton className="h-3.5 w-3/4 rounded-lg bg-slate-200/80 dark:bg-slate-700/50" />
            </div>
            <div className="space-y-2.5 pt-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20 rounded bg-slate-200/80 dark:bg-slate-700/50" />
                <Skeleton className="h-4 w-28 rounded bg-slate-200/80 dark:bg-slate-700/50" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28 rounded bg-slate-200/80 dark:bg-slate-700/50" />
                <Skeleton className="h-4 w-24 rounded bg-slate-200/80 dark:bg-slate-700/50" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20 rounded bg-slate-200/80 dark:bg-slate-700/50" />
                <Skeleton className="h-4 w-32 rounded bg-slate-200/80 dark:bg-slate-700/50" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Skeleton className="flex-1 h-11 rounded-2xl bg-slate-200/80 dark:bg-slate-700/50" />
            <Skeleton className="flex-1 h-11 rounded-2xl bg-slate-200/80 dark:bg-slate-700/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Control Bar Skeleton */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-5 border border-white/60 dark:border-slate-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48 rounded-lg bg-slate-200/80 dark:bg-slate-700/50" />
            <Skeleton className="h-3.5 w-64 rounded-md bg-slate-200/80 dark:bg-slate-700/50" />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Skeleton className="h-11 w-full sm:w-60 rounded-2xl bg-slate-200/80 dark:bg-slate-700/50" />
            <Skeleton className="h-11 w-full sm:w-60 rounded-2xl bg-slate-200/80 dark:bg-slate-700/50" />
          </div>
        </div>
      </div>

      {/* 3D Isometric Stands Skeleton */}
      <div className="bg-gradient-to-b from-white/70 via-slate-50/50 to-white/70 dark:from-slate-900/70 dark:via-slate-850/50 dark:to-slate-900/70 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-white/60 dark:border-slate-800/60">
        <div className="max-w-lg mx-auto pt-6 pb-2 grid grid-cols-3 items-end gap-3 sm:gap-4">
          {/* Stand 2 */}
          <div className="flex flex-col items-center space-y-2.5">
            <Skeleton className="w-14 h-14 rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
            <Skeleton className="h-3.5 w-20 rounded bg-slate-200/80 dark:bg-slate-700/50" />
            <Skeleton className="h-3 w-16 rounded bg-slate-200/80 dark:bg-slate-700/50" />
            <Skeleton className="w-full h-32 rounded-2xl bg-slate-200/80 dark:bg-slate-700/50" />
          </div>
          {/* Stand 1 */}
          <div className="flex flex-col items-center space-y-2.5 -mt-6">
            <Skeleton className="w-18 h-18 rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
            <Skeleton className="h-4 w-24 rounded bg-slate-200/80 dark:bg-slate-700/50" />
            <Skeleton className="h-3 w-20 rounded bg-slate-200/80 dark:bg-slate-700/50" />
            <Skeleton className="w-full h-44 rounded-2xl bg-slate-200/80 dark:bg-slate-700/50" />
          </div>
          {/* Stand 3 */}
          <div className="flex flex-col items-center space-y-2.5">
            <Skeleton className="w-14 h-14 rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
            <Skeleton className="h-3.5 w-20 rounded bg-slate-200/80 dark:bg-slate-700/50" />
            <Skeleton className="h-3 w-16 rounded bg-slate-200/80 dark:bg-slate-700/50" />
            <Skeleton className="w-full h-26 rounded-2xl bg-slate-200/80 dark:bg-slate-700/50" />
          </div>
        </div>
      </div>

      {/* Ranked List Skeleton */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/60 dark:border-slate-800/60 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100/70 dark:border-slate-800/60">
          <Skeleton className="h-5 w-40 rounded-md bg-slate-200/80 dark:bg-slate-700/50" />
          <Skeleton className="h-4 w-24 rounded-md bg-slate-200/80 dark:bg-slate-700/50" />
        </div>
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/40"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
              <Skeleton className="w-10 h-10 rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28 rounded bg-slate-200/80 dark:bg-slate-700/50" />
                <Skeleton className="h-3 w-20 rounded bg-slate-200/80 dark:bg-slate-700/50" />
              </div>
            </div>
            <div className="space-y-1.5 items-end flex flex-col">
              <Skeleton className="h-4 w-16 rounded bg-slate-200/80 dark:bg-slate-700/50" />
              <Skeleton className="h-3 w-12 rounded bg-slate-200/80 dark:bg-slate-700/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommentsSkeleton() {
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/60 dark:border-slate-800/60 space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="flex-1 h-12 rounded-2xl bg-slate-200/80 dark:bg-slate-700/50" />
        <Skeleton className="w-full sm:w-28 h-12 rounded-2xl bg-slate-200/80 dark:bg-slate-700/50" />
      </div>
      <div className="space-y-3 pt-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/40 flex items-start gap-3.5">
            <Skeleton className="w-9 h-9 rounded-full shrink-0 bg-slate-200/80 dark:bg-slate-700/50" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-28 rounded bg-slate-200/80 dark:bg-slate-700/50" />
                <Skeleton className="h-3.5 w-16 rounded bg-slate-200/80 dark:bg-slate-700/50" />
              </div>
              <Skeleton className="h-3.5 w-full rounded bg-slate-200/80 dark:bg-slate-700/50" />
              <Skeleton className="h-3.5 w-2/3 rounded bg-slate-200/80 dark:bg-slate-700/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
