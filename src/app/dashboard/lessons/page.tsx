"use client";

import useSWR from "swr";
import { getSubjects, type Subject } from "@/lib/supabase-queries";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  FlaskConical,
  Languages,
  Calculator,
  Atom,
  Dna,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

// ── Subject icon/color/gradient mapping ──────────────────────────────────────
const subjectMeta: Record<
  string,
  { iconColor: string; iconBg: string; gradient: string; icon: any }
> = {
  matematika: {
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20",
    gradient: "from-blue-500 via-blue-600 to-indigo-600",
    icon: Calculator,
  },
  ingliz: {
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20",
    gradient: "from-emerald-400 via-teal-500 to-cyan-600",
    icon: Languages,
  },
  fizika: {
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/20",
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    icon: Atom,
  },
  kimyo: {
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20",
    gradient: "from-orange-400 via-amber-500 to-yellow-500",
    icon: FlaskConical,
  },
  biologiya: {
    iconColor: "text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-500/10 dark:bg-teal-500/20 border-teal-500/20",
    gradient: "from-green-400 via-emerald-500 to-teal-500",
    icon: Dna,
  },
  default: {
    iconColor: "text-brand-blue dark:text-blue-400",
    iconBg: "bg-brand-blue/10 dark:bg-brand-blue/20 border-brand-blue/20",
    gradient: "from-brand-blue via-blue-500 to-indigo-500",
    icon: BookOpen,
  },
};

function getSubjectMeta(title: string) {
 const key = Object.keys(subjectMeta).find((k) =>
 title?.toLowerCase().includes(k)
 );
 return subjectMeta[key || "default"];
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────
function LessonsPageSkeleton() {
 return (
 <div className="flex flex-col gap-6 pb-24 animate-pulse">
 <div className="flex flex-col gap-2">
 <Skeleton className="h-3 w-28 rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
 <Skeleton className="h-8 w-40 rounded-xl bg-slate-200/80 dark:bg-slate-700/50" />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
 {[1, 2, 3, 4].map((i) => (
 <div
 key={i}
 className="w-full h-full flex flex-col rounded-[1.5rem] overflow-hidden border border-white/60 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl"
 >
 <Skeleton className="w-full h-36 bg-slate-200/80 dark:bg-slate-700/50 rounded-none" />
 <div className="p-4 flex items-center gap-3 flex-1">
 <Skeleton className="w-10 h-10 rounded-full bg-slate-200/80 dark:bg-slate-700/50 shrink-0" />
 <div className="flex-1 space-y-2">
 <Skeleton className="h-4 w-1/2 rounded-md bg-slate-200/80 dark:bg-slate-700/50" />
 <Skeleton className="h-3 w-3/4 rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
 </div>
 <Skeleton className="w-5 h-5 rounded bg-slate-200/80 dark:bg-slate-700/50 shrink-0" />
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LessonsPage() {
  const fetcher = () => getSubjects();
  const { data: subjects = [], isLoading: loading } = useSWR('subjects', fetcher);

  if (loading) return <LessonsPageSkeleton />;

  return (
    <div className="relative text-slate-800 dark:text-white font-sans pb-4">
      {/* Ambient bg */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 max-w-[1600px] mx-auto pt-1 sm:pt-2">

        {/* ── PAGE HEADER ── */}
        <div className="flex flex-col gap-1">
          <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
            O'quv materiali
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-slate-900 dark:text-white leading-tight">
            Darslar
          </h1>
        </div>

        {/* ── EMPTY STATE ── */}
        {subjects.length === 0 && (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] p-10 border border-gray-200/50 dark:border-slate-800/50 shadow-sm flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center">
              <BookOpen size={28} className="text-brand-blue" />
            </div>
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
              Hozircha fanlar yo'q
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Fanlar tez orada qo'shiladi!
            </p>
          </div>
        )}

        {/* ── SUBJECT CARDS (Game Zone style) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((subject) => {
            const meta = getSubjectMeta(subject.title);
            const SubjectIcon = meta.icon;

            return (
              <div
                key={subject.id}
                className="h-full"
              >
                <Link
                  href={`/dashboard/subjects/${subject.id}`}
                  className="flex flex-col w-full h-full rounded-[2rem] overflow-hidden border border-white/60 dark:border-slate-800/60 shadow-none transition-all duration-300 group bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl active:scale-[0.99]"
                >
                  {/* ── TOP: Image / Gradient — height ── */}
                  <div className="relative w-full h-40 overflow-hidden">
                    {subject.cover_image ? (
                      <>
                        <Image
                          src={subject.cover_image}
                          alt={subject.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Overlay gradient bottom */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                      </>
                    ) : (
                      /* Gradient fallback when no image */
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}
                      >
                        {/* Decorative circles */}
                        <div className="absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full bg-white/10" />
                        <div className="absolute bottom-[-30px] left-[-10px] w-32 h-32 rounded-full bg-white/10" />
                        <SubjectIcon size={48} className="text-white/80 relative z-10" />
                      </div>
                    )}
                  </div>

                  {/* ── BOTTOM: Info row ── */}
                  <div className="p-5 flex items-center justify-between gap-4 flex-1">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl ${meta.iconBg} border flex items-center justify-center ${meta.iconColor} shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                        <SubjectIcon size={22} strokeWidth={2.2} />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg font-fredoka leading-snug truncate">
                          {subject.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                          {subject.description || "Fanning barcha dars va materiallari"}
                        </p>
                      </div>
                    </div>

                    {/* Arrow Pill */}
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-brand-blue group-hover:bg-brand-blue/10 transition-colors shrink-0">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
