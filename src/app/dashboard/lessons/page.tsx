"use client";

import { useEffect, useState } from "react";
import { getSubjects, type Subject } from "@/lib/supabase-queries";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  FlaskConical,
  Globe,
  Calculator,
  Atom,
  Leaf,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

// ── Subject icon/color/gradient mapping ──────────────────────────────────────
const subjectMeta: Record<
  string,
  { color: string; bg: string; gradient: string; icon: any }
> = {
  matematika: {
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/30",
    gradient: "from-blue-500 via-blue-600 to-indigo-600",
    icon: Calculator,
  },
  ingliz: {
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    gradient: "from-emerald-400 via-teal-500 to-cyan-600",
    icon: Globe,
  },
  fizika: {
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-900/30",
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
    icon: Atom,
  },
  kimyo: {
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-900/30",
    gradient: "from-orange-400 via-amber-500 to-yellow-500",
    icon: FlaskConical,
  },
  biologiya: {
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-900/30",
    gradient: "from-green-400 via-emerald-500 to-teal-500",
    icon: Leaf,
  },
  default: {
    color: "text-brand-blue",
    bg: "bg-brand-blue/5",
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
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-full rounded-[28px] overflow-hidden border border-gray-200/50 dark:border-slate-800/50"
          >
            <Skeleton className="w-full h-36 bg-slate-200/80 dark:bg-slate-700/50 rounded-none" />
            <div className="bg-white/80 dark:bg-slate-900/80 p-4 flex items-center gap-3">
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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubjects().then((data) => {
      setSubjects(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LessonsPageSkeleton />;

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-white font-sans pb-24">
      {/* Ambient bg */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 max-w-md mx-auto pt-4 sm:pt-6">

        {/* ── PAGE HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-1"
        >
          <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
            O'quv materiali
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-slate-900 dark:text-white leading-tight">
            Darslar
          </h1>
        </motion.div>

        {/* ── EMPTY STATE ── */}
        {subjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] p-10 border border-gray-200/50 dark:border-slate-800/50 shadow-sm flex flex-col items-center gap-4 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center">
              <BookOpen size={28} className="text-brand-blue" />
            </div>
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
              Hozircha fanlar yo'q
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Fanlar tez orada qo'shiladi!
            </p>
          </motion.div>
        )}

        {/* ── SUBJECT CARDS (image box style) ── */}
        <div className="flex flex-col gap-4">
          {subjects.map((subject, si) => {
            const meta = getSubjectMeta(subject.title);
            const SubjectIcon = meta.icon;

            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.07, duration: 0.4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/dashboard/subjects/${subject.id}`}
                  className="block w-full rounded-[28px] overflow-hidden border border-gray-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  {/* ── TOP: Image / Gradient — 40% height ── */}
                  <div className="relative w-full h-36 overflow-hidden">
                    {subject.cover_image ? (
                      <>
                        <Image
                          src={subject.cover_image}
                          alt={subject.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Overlay gradient bottom */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
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
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 flex items-center gap-3">
                    {/* Icon circle */}
                    <div
                      className={`w-11 h-11 rounded-full ${meta.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <SubjectIcon size={20} className={meta.color} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[16px] leading-tight">
                        {subject.title}
                      </h3>
                      {subject.description && (
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {subject.description}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      size={20}
                      className="text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform shrink-0"
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
