"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useCurrentUser, useUserProfile, useDashboardStats, useUpcomingTests } from "@/hooks/useDashboardData";
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
  ClipboardList, 
  Trophy, 
  ChevronRight, 
  Megaphone,
  Clock,
  Zap,
  BarChart3
} from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { getSubjects, type Subject } from "@/lib/supabase-queries";
import { DashboardHomeSkeleton } from "@/components/ui/Skeleton";

// Subject colors & icons
const subjectMeta: Record<string, { color: string; bg: string; icon: any }> = {
  matematika:  { color: "text-blue-600",   bg: "bg-blue-100 dark:bg-blue-900/40",   icon: Calculator },
  ingliz:      { color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/40", icon: Globe },
  fizika:      { color: "text-purple-600",  bg: "bg-purple-100 dark:bg-purple-900/40",   icon: Atom },
  kimyo:       { color: "text-orange-600",  bg: "bg-orange-100 dark:bg-orange-900/40",   icon: FlaskConical },
  biologiya:   { color: "text-green-600",   bg: "bg-green-100 dark:bg-green-900/40",     icon: Leaf },
  default:     { color: "text-brand-blue",  bg: "bg-brand-blue/10",                      icon: BookOpen },
};

function getSubjectMeta(title: string) {
  const key = Object.keys(subjectMeta).find(k => title?.toLowerCase().includes(k));
  return subjectMeta[key || "default"];
}

// Quick access cards
const quickCards = [
  {
    label: "Fanlar",
    sublabel: "Barcha o'quv fanlar",
    href: "/dashboard/subjects/1",
    icon: BookOpen,
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-500",
  },
  {
    label: "Testlar",
    sublabel: "Online testlarni yechish",
    href: "/dashboard/tests",
    icon: ClipboardList,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-500",
  },
  {
    label: "Natijalar",
    sublabel: "Ball va statistika",
    href: "/dashboard/results",
    icon: BarChart3,
    gradient: "from-orange-500 to-amber-500",
    bg: "bg-orange-500",
  },
  {
    label: "Yutuqlar",
    sublabel: "Reyting va mukofotlar",
    href: "/dashboard/profile",
    icon: Trophy,
    gradient: "from-emerald-500 to-green-600",
    bg: "bg-emerald-500",
  },
];

interface FeaturedAnnouncement {
  id: string;
  title: string;
  message: string;
  image: string;
  badge: string;
  date: string;
  badgeBg: string;
}

const featuredAnnouncements: FeaturedAnnouncement[] = [
  {
    id: "ielts-mock",
    title: "MOCK IELTS Imtihoni",
    message: "Yakshanba soat 10:00 da navbatdagi MOCK imtihoni bo'lib o'tadi. O'z bilimingizni haqiqiy IELTS imtihon muhitida sinab ko'ring va natijalarni 2 kunda oling.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
    badge: "MOCK EXAM",
    date: "Yakshanba, 10:00",
    badgeBg: "bg-red-500/80 text-white"
  },
  {
    id: "math-new",
    title: "Yangi Matematika Guruhi",
    message: "Noldan boshlab mukammal darajagacha bo'lgan yangi guruhimizga qabul ochildi. Darslar tajribali ustozlar tomonidan zamonaviy metodikalar asosida o'tiladi.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
    badge: "YANGI KURS",
    date: "Qabul ochiq",
    badgeBg: "bg-emerald-500/80 text-white"
  },
  {
    id: "physics-club",
    title: "Fizika va Astronomiya To'garagi",
    message: "Koinot sirlari va fizika qonunlarini qiziqarli amaliy tajribalar orqali o'rganishni istaysizmi? Bizning ilmiy to'garakka qo'shiling va kelajak olimiga aylaning.",
    image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80",
    badge: "TO'GARAK",
    date: "Har seshanba",
    badgeBg: "bg-violet-500/80 text-white"
  },
  {
    id: "speaking-club",
    title: "English Speaking Club",
    message: "Har shanba kuni chet ellik mehmonlar va malakali ustozlar bilan ingliz tilida so'zlashuv nutqingizni rivojlantiring. Barcha darajadagilar uchun kirish bepul.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80",
    badge: "BEPUL",
    date: "Shanba, 14:00",
    badgeBg: "bg-amber-500/80 text-white"
  }
];

// Main dashboard page component
export default function DashboardPage() {
  const { t } = useLanguage();
  const { data: user } = useCurrentUser();
  const { data: profile } = useUserProfile(user?.id);
  const { data: stats } = useDashboardStats(user?.id);
  const { data: upcomingTests } = useUpcomingTests();

  const { data: subjects = [], isLoading: subjectsLoading } = useSWR('subjects', getSubjects);

  const isLoading = !user || subjectsLoading;

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Xayrli tong" : hour < 18 ? "Xayrli kun" : "Xayrli kech";

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-white font-sans pb-24">
      {/* Ambient background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-8 max-w-[1600px] mx-auto pt-4 sm:pt-6">

        {/* ── LOADING SKELETON ── */}
        {isLoading ? (
          <DashboardHomeSkeleton />
        ) : (<>
        {/* ── 1. HERO GREETING ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-1"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {greeting}, <span className="font-semibold text-slate-700 dark:text-slate-200">{firstName}!</span>
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-slate-900 dark:text-white leading-tight">
            Bugun nima o'rganasiz?
          </h1>
        </motion.div>

        {/* ── 2. SUBJECT PROGRESS CARDS ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {subjects.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                  Fanlarim
                </h2>
                <Link href="/dashboard/tests" className="text-[13px] text-brand-blue font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                  Barchasi <ChevronRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {subjects.slice(0, 4).map((subject, i) => {
                  const meta = getSubjectMeta(subject.title);
                  const Icon = meta.icon;
                  // Simulated progress — replace with real data when available
                  const done = Math.floor(20 + Math.random() * 60);
                  const total = 100;
                  const pct = Math.round((done / total) * 100);

                  return (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      <Link
                        href={`/dashboard/subjects/${subject.id}`}
                        className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/60 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 flex flex-col gap-3 group block"
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-11 h-11 rounded-2xl ${meta.bg} flex items-center justify-center`}>
                            <Icon size={22} className={meta.color} />
                          </div>
                          <span className="text-[13px] font-bold text-slate-400 dark:text-slate-500">
                            {done}<span className="text-slate-300 dark:text-slate-600 font-medium">/{total}</span>
                          </span>
                        </div>

                        <div>
                          <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider line-clamp-1">
                            {subject.title}
                          </p>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${meta.color.replace("text-", "bg-")}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.3 + i * 0.05, duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </motion.section>

        {/* ── 3. QUICK ACCESS (O'QISH BO'LIMI) ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-[15px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4">
            O'qish
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {quickCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                >
                  <Link
                    href={card.href}
                    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/60 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4 group block"
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{card.label}</p>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{card.sublabel}</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── 4. STATS ROW ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3 sm:gap-4"
        >
          {[
            { label: "Testlar", value: stats?.totalTests ?? 0, icon: ClipboardList, color: "text-brand-blue", bg: "bg-brand-blue/10" },
            { label: "O'rtacha", value: `${stats?.averageScore ?? 0}%`, icon: BarChart3, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", isStr: true },
            { label: "Tangalar", value: stats?.totalCoins ?? 0, icon: Trophy, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/60 dark:border-slate-700/50 shadow-sm flex flex-col items-center gap-2 text-center"
              >
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon size={20} className={s.color} />
                </div>
                <p className="text-xl font-bold font-fredoka text-slate-800 dark:text-white">{s.isStr ? s.value : s.value}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{s.label}</p>
              </div>
            );
          })}
        </motion.section>

        {/* ── 5. UPCOMING TESTS ── */}
        {(upcomingTests?.length ?? 0) > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Zap size={16} className="text-brand-blue" />
                Testlar
              </h2>
              <Link href="/dashboard/tests" className="text-[13px] text-brand-blue font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                Barchasi <ChevronRight size={14} />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {upcomingTests?.slice(0, 3).map((test: any) => (
                <Link
                  key={test.id}
                  href={`/dashboard/tests/${test.id}`}
                  className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/60 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all flex items-center gap-4 group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                    <ClipboardList size={20} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{test.title}</p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock size={11} />
                      {test.duration_minutes ? `${test.duration_minutes} daqiqa` : "Cheksiz"} · {test.total_questions} savol
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── 6. YANGILIKLAR (FEATURED ANNOUNCEMENTS) ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden w-full"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Megaphone size={16} className="text-brand-blue" />
              Yangiliklar & E'lonlar
            </h2>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar w-full scroll-smooth">
            {featuredAnnouncements.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="snap-start shrink-0 w-[290px] sm:w-[380px] relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all duration-300 h-[210px] sm:h-[250px] bg-slate-100 dark:bg-slate-900 group"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={item.image} 
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 290px, 380px"
                    priority={i < 2}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Glassy/Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/10 dark:from-slate-950 dark:via-slate-950/70 dark:to-slate-950/20 z-10" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 z-20 p-5 flex flex-col justify-between text-white">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full backdrop-blur-md shadow-sm tracking-wider ${item.badgeBg}`}>
                      {item.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-200/90 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <Clock size={11} />
                      {item.date}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold leading-snug font-fredoka tracking-wide text-white drop-shadow-sm line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[12px] sm:text-[13px] text-slate-200/80 mt-1.5 line-clamp-2 leading-relaxed font-medium">
                      {item.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </>) /* end isLoading check */}
      </div>
    </div>
  );
}
