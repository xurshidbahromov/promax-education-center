"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { getAdminTournaments, getCachedAdminTournaments, AdminTournament } from "@/lib/tournaments";
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
  ArrowDownRight,
  ArrowRight,
  Play
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

export function OlympiadBannerTeaser() {
  const { t } = useLanguage();
  const [participantsCount, setParticipantsCount] = useState(1240);

  useEffect(() => {
    getAdminTournaments().then((list: AdminTournament[]) => {
      if (list && list.length > 0) {
        const total = list.reduce((acc: number, item: AdminTournament) => acc + (item.participantsCount || 0), 0);
        if (total > 0) setParticipantsCount(total);
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative block w-full">
        
        {/* ── TOP ROW: DISTINCT 40% FULLY TRANSPARENT SHELF TAB + SEAMLESS RIGHT GLASS HEADER ── */}
        <div className="flex items-stretch relative z-20">
          
          {/* Top-Left Shelf Tab (100% Fully Transparent, no background fill, no blur) */}
          <Link
            href="/dashboard/olympiads"
            className="w-[37%] sm:w-[32%] bg-transparent backdrop-blur-none px-2.5 sm:px-6 py-2.5 sm:py-3.5 border-none flex items-center shrink-0 z-10 cursor-pointer group/step"
          >
            <h3 className="text-sm sm:text-2xl font-medium font-fredoka text-slate-800 dark:text-slate-100 leading-tight flex items-center gap-1 sm:gap-2 min-w-0">
              <span className="truncate">{t("olympiad.shelf_title")}</span>
              <motion.span
                animate={{ x: [0, 3, 0], y: [0, 3, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex text-brand-blue dark:text-blue-400 shrink-0"
              >
                <ArrowDownRight size={18} className="stroke-[2.5] sm:w-[22px] sm:h-[22px]" />
              </motion.span>
            </h3>
          </Link>

          {/* Top-Right Header Box (Longer for full participants text) */}
          <div className="flex-1 bg-white/60 dark:bg-slate-900/60 text-slate-900 dark:text-white px-2.5 sm:px-6 py-2.5 sm:py-3.5 rounded-t-3xl border-t border-r border-white/60 dark:border-slate-800/60 border-b-0 border-l-0 flex items-center justify-center gap-1.5 z-20 backdrop-blur-xl min-w-0">
            <Users size={14} className="text-brand-blue shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {t("olympiad.participants_count", { count: participantsCount })}
            </span>
          </div>
        </div>

        {/* ── MAIN CARD BODY ── */}
        <div className="relative z-10 w-full rounded-b-3xl rounded-tl-3xl rounded-tr-none bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl text-slate-800 dark:text-white p-4.5 sm:p-6 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 sm:gap-4 border-b border-l border-r border-t-0 border-white/60 dark:border-slate-800/60 shadow-none">
          
          {/* Smooth Top-Left Corner Curved Border */}
          <div className="absolute top-0 left-0 w-[37%] sm:w-[32%] h-6 rounded-tl-3xl border-t border-l border-white/60 dark:border-slate-800/60 pointer-events-none z-10" />
          
          {/* Left Text Content Area */}
          <div className="relative z-10 space-y-1 min-w-0 flex-1 w-full xs:w-auto">
            <h4 className="text-base sm:text-xl font-bold font-fredoka text-slate-800 dark:text-slate-100 leading-tight truncate tracking-tight">
              {t("olympiad.banner_title")}
            </h4>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5 truncate">
              <Gift size={14} className="text-amber-500 shrink-0" />
              <span>{t("olympiad.top_prizes")}</span>
            </p>
          </div>

          {/* Right Recessed Glassy Button */}
          <div className="relative z-10 shrink-0 w-full xs:w-auto flex justify-end">
            <Link
              href="/dashboard/olympiads"
              className="group/btn w-full xs:w-auto px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-none active:scale-95 transition-all cursor-pointer"
            >
              <span>{t("olympiad.btn_details")}</span>
              <ArrowUpRight size={15} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export function OlympiadSection() {
  const [tournaments, setTournaments] = useState<AdminTournament[]>(() => {
    return getCachedAdminTournaments();
  });
  const [selectedOlympiad, setSelectedOlympiad] = useState<any | null>(null);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cached = getCachedAdminTournaments();
    if (cached.length > 0) {
      setTournaments(cached);
    }
    getAdminTournaments().then((list) => {
      if (list && list.length > 0) {
        setTournaments(list);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const heroItem = tournaments[0] as any;
  if (loading || !heroItem) return null;

  const handleRegister = (olympiad: any) => {
    if (registeredIds.includes(olympiad.id)) {
      toast.success("Siz allaqachon ushbu musobaqaga ro'yxatdan o'tgansiz!");
      return;
    }

    setRegisteredIds(prev => [...prev, olympiad.id]);
    toast.success(`Muvaffaqiyatli ro'yxatdan o'tdingiz! "${olympiad.title}" boshlanishidan oldin sizga eslatma yuboriladi.`);
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
      <div
        className="relative rounded-[2.5rem] overflow-hidden border border-amber-500/30 shadow-xl shadow-amber-500/5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white"
      >
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-amber-500/20 via-purple-500/10 to-transparent blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-48 h-48 bg-blue-500/20 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 p-6 sm:p-8 gap-6 items-center">
          
          {/* Left Content Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider ${heroItem.badgeBg || "bg-amber-500/20 text-amber-300"}`}>
                {heroItem.badge || "RESPUBLIKA"}
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
              {registeredIds.includes(heroItem.id) ? (
                <Link
                  href={`/dashboard/tests/${heroItem.id}/take?type=olympiad`}
                  className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-lg active:scale-95 bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                >
                  <Play size={16} className="fill-white" />
                  <span>Testni Boshlash 🚀</span>
                </Link>
              ) : (
                <button
                  onClick={() => handleRegister(heroItem)}
                  className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-lg active:scale-95 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-amber-500/30"
                >
                  <Flame size={16} />
                  <span>Qatnashish (100 Tanga)</span>
                </button>
              )}

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
                {(heroItem.topRankings || []).map((item: any) => (
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
      </div>

      {/* ── 2. UPCOMING OLYMPIADS LIST ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tournaments.slice(1).map((item: any) => {
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

                {isRegistered ? (
                  <Link
                    href={`/dashboard/tests/${item.id}/take?type=olympiad`}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer active:scale-95 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                  >
                    <Play size={13} className="fill-white" />
                    <span>Boshlash</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => handleRegister(item)}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer active:scale-95 bg-brand-blue text-white hover:bg-blue-600 shadow-md shadow-brand-blue/20"
                  >
                    Qatnashish
                  </button>
                )}
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
                    <span className="text-xs font-black text-slate-800 dark:text-white">{selectedOlympiad.participantsCount}</span>
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
                    {(selectedOlympiad.topPrizes || []).map((pz: any, idx: number) => (
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
                    {(selectedOlympiad.rules || []).map((rule: any, idx: number) => (
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
                {registeredIds.includes(selectedOlympiad.id) ? (
                  <Link
                    href={`/dashboard/tests/${selectedOlympiad.id}/take?type=olympiad`}
                    onClick={() => setSelectedOlympiad(null)}
                    className="px-6 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Play size={14} className="fill-white" />
                    <span>Testni Boshlash 🚀</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      handleRegister(selectedOlympiad);
                      setSelectedOlympiad(null);
                    }}
                    className="px-6 py-2.5 text-xs font-black text-white bg-brand-blue hover:bg-blue-600 rounded-xl shadow-lg shadow-brand-blue/20 cursor-pointer active:scale-95 transition-all"
                  >
                    Qatnashish ({selectedOlympiad.entryCoins} Tanga)
                  </button>
                )}
              </div>

            </motion.div>
          </div>,
          document.body
        )}
      </AnimatePresence>
    </section>
  );
}
