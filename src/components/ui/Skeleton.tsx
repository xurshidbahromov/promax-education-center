
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
                    <Skeleton className="w-full rounded-t-lg" style={{ height: `${Math.random() * 60 + 20}%` }} />
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
