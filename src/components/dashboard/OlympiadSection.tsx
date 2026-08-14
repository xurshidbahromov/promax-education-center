"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Flame,
  Clock,
  Coins,
  Users,
  Sparkles,
  ChevronRight,
  Award,
  Gift,
  Calendar,
  CheckCircle2,
  X,
  Zap,
  Star,
  Info,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export interface OlympiadItem {
  id: string;
  title: string;
  subject: string;
  subjectColor: string;
  badge: string;
  badgeBg: string;
  status: "live" | "upcoming" | "finished";
  startDate: string;
  startTime: string;
  durationMinutes: number;
  totalQuestions: number;
  entryCoins: number;
  prizePool: string;
  topPrizes: string[];
  participantsCount: number;
  description: string;
  rules: string[];
  bannerGradient: string;
  topRankings?: { name: string; score: number; rank: number; avatar: string }[];
}

const SAMPLE_OLYMPIADS: OlympiadItem[] = [
  {
    id: "math-pro-2026",
    title: "Respublika Matematika Pro Onlayn Olimpiadasi",
    subject: "Matematika",
    subjectColor: "from-blue-600 to-indigo-600",
    badge: "🔥 HAFTALIK GRAND MUSOBAQA",
    badgeBg: "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/20",
    status: "upcoming",
    startDate: "18-Avgust, 2026",
    startTime: "15:00",
    durationMinutes: 60,
    totalQuestions: 30,
    entryCoins: 100,
    prizePool: "1,500,000 SO'M + Planshet",
    topPrizes: [
      "🥇 1-O'rin: 1,000,000 So'm + Oltin Medal + Planshet",
      "🥈 2-O meksarin: 300,000 So'm + Kumush Medal + Premium Akkaunt",
      "🥉 3-O'rin: 200,000 So'm + Bronza Medal + 500 Tanga"
    ],
    participantsCount: 428,
    description: "Matematika bo'yicha eng kuchli o'quvchilar bellashuvi! Murakkab va mantiqiy masalalarni yechib, qimmatbaho sovg'alar va sertifikatlarni qo'lga kiriting.",
    rules: [
      "Imtihon belgilangan vaqtda aniq boshlanadi va 60 daqiqa davom etadi.",
      "Har bir to'g'ri javob uchun 3.1 ball beriladi va reyting real-vaqtda shakllanadi.",
      "Olimpiada yakunlangach, top o'rin egalari mukofotlarni olish uchun Admin bilan bog'lanishadi."
    ],
    bannerGradient: "from-blue-600 via-indigo-700 to-purple-800",
    topRankings: [
      { name: "Sardor M.", score: 98, rank: 1, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sardor" },
      { name: "Malika K.", score: 95, rank: 2, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Malika" },
      { name: "Javohir S.", score: 92, rank: 3, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Javohir" }
    ]
  },
  {
    id: "physics-master-2026",
    title: "Fizika Bilimdonlari Milliy Chempionati",
    subject: "Fizika",
    subjectColor: "from-purple-600 to-pink-600",
    badge: "⚡ JARA YONDA G'OLIB BO'LING",
    badgeBg: "bg-purple-500/80 text-white backdrop-blur-md",
    status: "upcoming",
    startDate: "22-Avgust, 2026",
    startTime: "16:30",
    durationMinutes: 45,
    totalQuestions: 25,
    entryCoins: 50,
    prizePool: "Brend Noutbuk Sumkasi + Sertifikat",
    topPrizes: [
      "🥇 1-O'rin: Brend Noutbuk Sumkasi + Oltin Medal",
      "🥈 2-O'rin: PowerBank (20.000 mAh) + Kumush Medal",
      "🥉 3-O'rin: Aqlli Soat + Bronza Medal"
    ],
    participantsCount: 289,
    description: "Fizikaning eng qiziqarli mexanika va mekslektrodinamika bo'limlari bo'yicha bilimingizni sinang.",
    rules: [
      "Vaqt chegaralangan (45 minut).",
      "G'oliblar ball va sarflangan vaqtga qarab aniqlanadi."
    ],
    bannerGradient: "from-purple-700 via-pink-700 to-rose-700"
  },
  {
    id: "english-grammar-battle",
    title: "English Grammar & Vocabulary Battle",
    subject: "Ingliz tili",
    subjectColor: "from-emerald-600 to-teal-600",
    badge: "🌟 BEPUL QATNASHISH",
    badgeBg: "bg-emerald-500/80 text-white backdrop-blur-md",
    status: "upcoming",
    startDate: "25-Avgust, 2026",
    startTime: "18:00",
    durationMinutes: 40,
    totalQuestions: 40,
    entryCoins: 0,
    prizePool: "IELTS Kitoblar To'plami & Vafcherlar",
    topPrizes: [
      "🥇 1-O'rin: IELTS Official Cambridge Kitoblar To'plami",
      "🥈 2-O'rin: Speaking Club 1 Oylik Bepul A'zolik",
      "🥉 3-O'rin: 300 Tanga + Rasmiy Sertifikat"
    ],
    participantsCount: 512,
    description: "Ingliz tili grammatikasi va soz boyligi bo'yicha tekoris musobaqa!",
    rules: [
      "Barcha foydalanuvchilar bepul qatnashishi mumkin.",
      "Eng yuqori ball to'plagan 5 kishi sertifikat oladi."
    ],
    bannerGradient: "from-emerald-700"
  }
];

export function OlympiadBannerTeaser() {
  const heroItem = SAMPLE_OLYMPIADS[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative w-full"
    >
      <div className="relative block w-full">
        
        {/* ── TOP ROW: CONNECTED 40% SHELF + RIGHT GLASS HEADER (Fully Responsive) ── */}
        <div className="flex items-stretch">
          
          {/* Top-Left Shelf (40% width, bold enlarged text without arrow) */}
          <Link
            href="/dashboard/olympiads"
            className="w-[45%] sm:w-[40%] bg-transparent px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-t-3xl border-none flex items-center shrink-0 z-10 cursor-pointer group/step"
          >
            <h3 className="text-sm sm:text-xl font-black font-fredoka text-slate-900 dark:text-white leading-tight truncate flex items-center gap-2">
              <Trophy size={18} className="text-brand-blue dark:text-blue-400 shrink-0" />
              <span>Bilimni Sinash</span>
            </h3>
          </Link>

          {/* Top-Right Header (Platform Brand Gradient Glass Box, Responsive) */}
          <div className="flex-1 bg-gradient-to-r from-blue-600/95 via-indigo-600/95 to-purple-600/95 text-white px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-t-3xl border-t border-r border-white/20 flex items-center gap-1.5 -ml-px z-0 backdrop-blur-xl min-w-0">
            <Sparkles size={14} className="text-amber-300 shrink-0" />
            <h3 className="text-xs sm:text-base font-black font-fredoka text-white leading-tight uppercase tracking-wider truncate">
              PROMAX TOURNAMENTS
            </h3>
          </div>
        </div>

        {/* ── MAIN CARD BODY (Platform Glassmorphism, Fully Responsive Layout) ── */}
        <div className="relative w-full rounded-b-3xl rounded-tl-3xl rounded-tr-none overflow-hidden border border-white/80 dark:border-slate-800/80 bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl text-slate-800 dark:text-white p-4 sm:p-6 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 sm:gap-4 -mt-px shadow-none">
          
          {/* Ambient Platform Glowing Gradients */}
          <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-brand-blue/20 via-purple-500/15 to-amber-500/10 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-40 h-40 bg-blue-500/15 rounded-full blur-[70px] pointer-events-none" />

          {/* Left Text Content Area (Clean & Minimalist Typography) */}
          <div className="relative z-10 space-y-1 sm:space-y-1.5 min-w-0 flex-1 w-full xs:w-auto">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 sm:px-3 py-0.5 rounded-full border border-slate-200 dark:border-slate-700/60 flex items-center gap-1">
                <Users size={11} className="text-brand-blue" />
                <span>{heroItem.participantsCount} nafar qatnashmoqda</span>
              </span>
            </div>

            <h4 className="text-sm sm:text-xl font-black font-fredoka text-slate-900 dark:text-white leading-tight truncate">
              Milliy Bilim Musobaqalari
            </h4>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold flex flex-wrap items-center gap-2 sm:gap-2.5 truncate">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                <Trophy size={13} className="sm:w-3.5 sm:h-3.5" />
                Mukofot: {heroItem.prizePool}
              </span>
              <span className="hidden xs:inline">•</span>
              <span className="flex items-center gap-1 text-brand-blue dark:text-blue-400 font-bold">
                <Coins size={12} className="text-amber-500 sm:w-3.5 sm:h-3.5" />
                {heroItem.entryCoins > 0 ? `${heroItem.entryCoins} Tanga` : "BEPUL"}
              </span>
            </p>
          </div>

          {/* Right Corner Glassy Button (Responsive Positioning) */}
          <div className="relative z-10 shrink-0 w-full xs:w-auto flex justify-end">
            <Link
              href="/dashboard/olympiads"
              className="group/btn w-full xs:w-auto px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 backdrop-blur-md active:scale-95 transition-all cursor-pointer shadow-none"
            >
              <span>Batafsil</span>
              <ArrowUpRight size={15} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
            </Link>
          </div>

        </div>

      </div>
    </motion.div>
  );
}

export function OlympiadSection() {
  const [selectedOlympiad, setSelectedOlympiad] = useState<OlympiadItem | null>(null);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);

  const heroItem = SAMPLE_OLYMPIADS[0];

  const handleRegister = (olympiad: OlympiadItem) => {
    if (registeredIds.includes(olympiad.id)) {
      toast.success("Siz allaqachon uybushbu musobaqaga ro'yxatdan o'tgansiz!");
      return;
    }

    setRegisteredIds(prev => [...prev, olympiad.id]);
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 border border-brand-blue/30 p-4 gap-3 items-center`}>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 font-bold">
          🏆
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-800 dark:text-white">
            Muvaffaqiyatli ro'yxatdan o'tdingiz!
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            "{olympiad.title}" boshlanishidan oldin sizga eslatma yuboriladi.
          </p>
        </div>
      </div>
    ), { duration: 4000 });
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-fredoka text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
            <Trophy className="text-amber-500 w-5 h-5 animate-pulse" />
            <span>Onlayn Olimpiadalar & Musobaqalar</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Bilimingizni sinang, g'olib bo'ling va qimmatbaho mukofotlarga ega bo'ling
          </p>
        </div>

        <button
          onClick={() => setSelectedOlympiad(heroItem)}
          className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Qoidalari</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* ── 1. HERO BANNER (MATCHING USER SKETCH) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-[2.5rem] overflow-hidden border border-amber-500/30 shadow-xl shadow-amber-500/5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white"
      >
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-amber-500/20 via-purple-500/10 to-transparent blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-48 h-48 bg-blue-500/20 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 p-6 sm:p-8 gap-6 items-center">
          
          {/* Left Content Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider ${heroItem.badgeBg}`}>
                {heroItem.badge}
              </span>
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                <Sparkles size={12} />
                Sovg'alar Jamg'armasi
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black font-fredoka leading-snug tracking-wide text-white drop-shadow-md">
              {heroItem.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-medium line-clamp-2">
              {heroItem.description}
            </p>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Calendar size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Boshlanishi</span>
                  <span className="text-xs font-black text-white">{heroItem.startDate}</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Coins size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Kirish To'lovi</span>
                  <span className="text-xs font-black text-amber-300">
                    {heroItem.entryCoins > 0 ? `${heroItem.entryCoins} Tanga` : "BEPUL"}
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Users size={16} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Qatnashchilar</span>
                  <span className="text-xs font-black text-white">{heroItem.participantsCount} o'quvchi</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleRegister(heroItem)}
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-lg active:scale-95 ${
                  registeredIds.includes(heroItem.id)
                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-amber-500/30"
                }`}
              >
                {registeredIds.includes(heroItem.id) ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Ro'yxatdan O'tgansiz ✓</span>
                  </>
                ) : (
                  <>
                    <Flame size={16} />
                    <span>Qatnashish (100 Tanga)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedOlympiad(heroItem)}
                className="px-5 py-3 rounded-2xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition-all cursor-pointer"
              >
                Batafsil ma'lumot
              </button>
            </div>
          </div>

          {/* Right Column (5 cols) - Elevated Curved Card (Matching User Sketch!) */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Curved Elevation Container */}
            <div className="relative w-full max-w-sm bg-gradient-to-br from-amber-500/20 via-purple-600/20 to-slate-900/90 rounded-[2.2rem] p-5 border border-amber-500/30 backdrop-blur-xl shadow-2xl transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
              
              {/* Top Curved Trophy Header Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Trophy size={22} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">Top Reyting</h4>
                    <p className="text-[10px] text-slate-300 font-medium">O'tgan haftaning g'olislari</p>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
                  TOP 3
                </span>
              </div>

              {/* Leaderboard Podiums List */}
              <div className="space-y-2.5">
                {heroItem.topRankings?.map((item) => (
                  <div
                    key={item.rank}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                      item.rank === 1
                        ? "bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-amber-500/40"
                        : item.rank === 2
                        ? "bg-gradient-to-r from-slate-400/20 to-slate-400/5 border-slate-400/30"
                        : "bg-gradient-to-r from-orange-600/20 to-orange-600/5 border-orange-600/30"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full text-center text-xs font-black flex items-center justify-center ${
                        item.rank === 1 ? "bg-amber-500 text-slate-950" : item.rank === 2 ? "bg-slate-300 text-slate-900" : "bg-orange-500 text-white"
                      }`}>
                        {item.rank}
                      </span>
                      <img src={item.avatar} alt={item.name} className="w-8 h-8 rounded-full border border-white/20 bg-slate-800" />
                      <span className="text-xs font-bold text-white">{item.name}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-amber-300 block">{item.score} ball</span>
                      <span className="text-[9px] text-slate-400 font-medium">100 dan</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Prize Note */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-bold text-amber-300/90">
                <span className="flex items-center gap-1">
                  <Gift size={13} className="text-amber-400" />
                  <span>Pul mukofotlari va sovg'alar</span>
                </span>
                <span className="text-[10px] text-slate-400">Admin orqali</span>
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      {/* ── 2. UPCOMING OLYMPIADS LIST (3 CARDS) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SAMPLE_OLYMPIADS.slice(1).map((item) => {
          const isRegistered = registeredIds.includes(item.id);

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2rem] p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full ${item.badgeBg}`}>
                    {item.badge}
                  </span>
                  <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-lg">
                    <Coins size={12} />
                    {item.entryCoins > 0 ? `${item.entryCoins} Tanga` : "BEPUL"}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold font-fredoka text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-brand-blue transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-brand-blue shrink-0" />
                    <span>{item.startDate} ({item.startTime})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift size={13} className="text-amber-500 shrink-0" />
                    <span className="line-clamp-1">{item.prizePool}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => setSelectedOlympiad(item)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  Batafsil
                </button>

                <button
                  onClick={() => handleRegister(item)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer active:scale-95 ${
                    isRegistered
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-brand-blue text-white hover:bg-blue-600 shadow-md shadow-brand-blue/20"
                  }`}
                >
                  {isRegistered ? "Ro'yxatdasiz ✓" : "Qatnashish"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── 3. OLYMPIAD DETAILS MODAL ── */}
      <AnimatePresence>
        {selectedOlympiad && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header Banner */}
              <div className={`p-6 bg-gradient-to-r ${selectedOlympiad.bannerGradient} text-white relative`}>
                <button
                  onClick={() => setSelectedOlympiad(null)}
                  className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>

                <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-3 py-1 rounded-full uppercase tracking-wider text-white inline-block mb-2">
                  {selectedOlympiad.subject} Olimpiadasi
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-fredoka leading-snug">
                  {selectedOlympiad.title}
                </h3>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                
                {/* Status & Entry info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Vaqt</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">{selectedOlympiad.durationMinutes} daqiqa</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Savollar</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">{selectedOlympiad.totalQuestions} ta</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">To'lov</span>
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                      {selectedOlympiad.entryCoins > 0 ? `${selectedOlympiad.entryCoins} Tanga` : "BEPUL"}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Qatnashchilar</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white">{selectedOlympiad.participantsCount}+</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Musobaqa haqida</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {selectedOlympiad.description}
                  </p>
                </div>

                {/* Top Prizes */}
                <div className="bg-amber-500/10 dark:bg-amber-500/15 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                  <h4 className="text-xs font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy size={15} />
                    <span>Top O'rinlar Uchun Mukofotlar</span>
                  </h4>
                  <ul className="space-y-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                    {selectedOlympiad.topPrizes.map((pz, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span>{pz}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Rules */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Musobaqa Qoidalari</h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {selectedOlympiad.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Info size={14} className="text-brand-blue shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedOlympiad(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400"
                >
                  Yopish
                </button>
                <button
                  onClick={() => {
                    handleRegister(selectedOlympiad);
                    setSelectedOlympiad(null);
                  }}
                  className="px-6 py-2.5 text-xs font-black text-white bg-brand-blue hover:bg-blue-600 rounded-xl shadow-lg shadow-brand-blue/20 cursor-pointer active:scale-95 transition-all"
                >
                  {registeredIds.includes(selectedOlympiad.id) ? "Ro'yxatdasiz ✓" : `Qatnashish (${selectedOlympiad.entryCoins} Tanga)`}
                </button>
              </div>

            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </section>
  );
}
