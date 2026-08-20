"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";
import {
  Trophy,
  ArrowLeft,
  Clock,
  Users,
  Gift,
  CheckCircle2,
  X,
  ArrowUpRight,
  MessageSquare,
  Send,
  ThumbsUp,
  Award,
  Crown,
  Play,
  Search,
  ChevronRight,
  Medal,
  Zap,
  Sparkles,
  ShieldCheck,
  FileText
} from "lucide-react";
import {
  AdminTournament,
  TournamentLeaderboardEntry,
  getAdminTournaments,
  getTournamentLeaderboard,
  registerForTournament,
  getTournamentRegistrations
} from "@/lib/tournaments";
import { useCurrentUser } from "@/hooks/useDashboardData";
import {
  OlympiadsBannerSkeleton,
  TournamentsSkeleton,
  LeaderboardSkeleton,
  CommentsSkeleton
} from "@/components/ui/Skeleton";

interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  role: string;
  time: string;
  text: string;
  likes: number;
}

const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: "c1",
    author: "Jasurbek Aliyev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasurbek",
    role: "O'quvchi",
    time: "10 daqiqa avval",
    text: "Matematika musobaqasi savollari darajasi qanday bo'ladi? Tayyorgarlik uchun tayyor testlar bormi?",
    likes: 8,
  },
  {
    id: "c2",
    author: "Promax Admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PromaxAdmin",
    role: "Tashkilotchi",
    time: "5 daqiqa avval",
    text: "Assalomu alaykum! Musobaqa savollari standart va mantiqiy darajada tuzilgan. Testlar bo'limida tayyorgarlik testlarini yechishingiz mumkin.",
    likes: 15,
  },
  {
    id: "c3",
    author: "Sevinch Usmonova",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sevinch",
    role: "O'quvchi",
    time: "Kecha",
    text: "Top o'rin egalari uchun sertifikatlar va sovg'alar qachon taqdim etiladi?",
    likes: 4,
  },
];

export default function OlympiadsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user } = useCurrentUser();

  // Tab State: "tournaments" | "leaderboard" | "comments"
  const initialTab = (searchParams.get("tab") as "tournaments" | "leaderboard" | "comments") || "tournaments";
  const [activeTab, setActiveTab] = useState<"tournaments" | "leaderboard" | "comments">(initialTab);

  // Tournaments State
  const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AdminTournament | null>(null);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);

  // Leaderboard State
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<TournamentLeaderboardEntry[]>([]);
  const [leaderboardSearch, setLeaderboardSearch] = useState("");

  // Comments State
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);
  const [newCommentText, setNewCommentText] = useState("");
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAdminTournaments();
      setTournaments(data);
      if (data.length > 0) {
        const queryId = searchParams.get("id");
        const defaultId = queryId && data.some(t => t.id === queryId) ? queryId : data[0].id;
        setSelectedTournamentId(defaultId);
        const lb = await getTournamentLeaderboard(defaultId);
        setLeaderboard(lb);
      }

      const regList = getTournamentRegistrations(user?.id);
      setRegisteredIds(regList);
    } catch (e) {
      console.error("Error loading tournaments:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentSelectForLeaderboard = async (id: string) => {
    setSelectedTournamentId(id);
    setLeaderboardLoading(true);
    try {
      const lb = await getTournamentLeaderboard(id);
      setLeaderboard(lb);
    } catch (e) {
      console.error("Error loading tournament leaderboard:", e);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleRegister = async (item: AdminTournament) => {
    if (registeredIds.includes(item.id)) {
      toast.success("Siz ro'yxatdan o'tgansiz!", {
        icon: "✅"
      });
      return;
    }

    const res = await registerForTournament(item.id, {
      id: user?.id || `user_${Date.now()}`,
      name: user?.user_metadata?.full_name || "O'quvchi"
    });

    if (res.success) {
      setRegisteredIds((prev) => [...prev, item.id]);
      setTournaments((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, participantsCount: (t.participantsCount || 0) + 1 } : t))
      );
      toast.success(`"${item.title}" - Ro'yxatdan o'tildi!`, {
        icon: "🎉"
      });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: `c_${Date.now()}`,
      author: user?.user_metadata?.full_name || "O'quvchi",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_metadata?.full_name || 'Student'}`,
      role: "O'quvchi",
      time: "Hozir",
      text: newCommentText.trim(),
      likes: 0,
    };

    setComments((prev) => [newComment, ...prev]);
    setNewCommentText("");
    toast.success("Izoh yuborildi!", { icon: "💬" });
  };

  const handleToggleLike = (id: string) => {
    if (likedCommentIds.includes(id)) {
      setLikedCommentIds((prev) => prev.filter((item) => item !== id));
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, likes: c.likes - 1 } : c))
      );
    } else {
      setLikedCommentIds((prev) => [...prev, id]);
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
      );
    }
  };

  const selectedTournament = tournaments.find((t) => t.id === selectedTournamentId) || tournaments[0];
  const filteredLeaderboard = leaderboard.filter((entry) =>
    entry.student_name.toLowerCase().includes(leaderboardSearch.toLowerCase())
  );

  return (
    <div className="relative text-slate-800 dark:text-white font-sans pb-20">
      {/* Standard Ambient background matching all dashboard subpages */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 space-y-4 sm:space-y-5 w-full max-w-[1600px] mx-auto pt-1 sm:pt-2">
        
        {/* ── TOP BACK BUTTON ── */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 active:scale-95 transition-all shadow-none"
          >
            <ArrowLeft size={16} />
            <span>Dashboardga qaytish</span>
          </Link>
        </div>

        {/* ── TOP BANNER CARD ── */}
        {loading ? (
          <OlympiadsBannerSkeleton />
        ) : (
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-7 border border-white/60 dark:border-slate-800/60 shadow-none space-y-3">
            <h1 className="text-xl sm:text-2xl font-black font-fredoka text-slate-900 dark:text-white leading-tight">
              Milliy bilim musobaqalari
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Bilimingizni sinang va mukofotlarni qo'lga kiriting
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex-wrap pt-1">
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Trophy size={16} className="text-amber-500" />
                <span>Bilim musobaqalari</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Users size={16} className="text-brand-blue" />
                <span>{tournaments.reduce((acc, t) => acc + (t.participantsCount || 0), 0) || 1240}+ qatnashuvchi</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1.5 text-[#EB7C0E] dark:text-orange-400 font-bold">
                <Gift size={16} className="text-[#EB7C0E]" />
                <span>Top mukofotlar</span>
              </span>
            </div>
          </div>
        )}

        {/* ── 3-TAB SWITCHER (ULTRA-ROUNDED PILL WITH EQUAL DISTRIBUTION) ── */}
        <div className="relative w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 p-1.5 sm:p-2 rounded-full grid grid-cols-3 gap-1 sm:gap-2 shadow-none">
          
          {/* Tab 1: Musobaqalar */}
          <button
            onClick={() => setActiveTab("tournaments")}
            className={`relative w-full py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 active:scale-95 z-10 ${
              activeTab === "tournaments"
                ? "text-white"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {activeTab === "tournaments" && (
              <motion.div
                layoutId="olympiad-tab-active-pill"
                className="absolute inset-0 bg-brand-blue rounded-full shadow-none -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <Trophy size={16} className={activeTab === "tournaments" ? "stroke-[2.5]" : "stroke-[2]"} />
            <span>Musobaqalar</span>
          </button>

          {/* Tab 2: Reyting */}
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`relative w-full py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 active:scale-95 z-10 ${
              activeTab === "leaderboard"
                ? "text-white"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {activeTab === "leaderboard" && (
              <motion.div
                layoutId="olympiad-tab-active-pill"
                className="absolute inset-0 bg-brand-blue rounded-full shadow-none -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <Award size={16} className={activeTab === "leaderboard" ? "stroke-[2.5]" : "stroke-[2]"} />
            <span>Reyting</span>
          </button>

          {/* Tab 3: Izohlar */}
          <button
            onClick={() => setActiveTab("comments")}
            className={`relative w-full py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-2 active:scale-95 z-10 ${
              activeTab === "comments"
                ? "text-white"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {activeTab === "comments" && (
              <motion.div
                layoutId="olympiad-tab-active-pill"
                className="absolute inset-0 bg-brand-blue rounded-full shadow-none -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <MessageSquare size={16} className={activeTab === "comments" ? "stroke-[2.5]" : "stroke-[2]"} />
            <span>Izohlar</span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── TAB 1: MUSOBAQALAR (TOURNAMENTS GRID MATCHING SCREENSHOT) ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "tournaments" && (
          loading ? (
            <TournamentsSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {tournaments.map((item) => {
              const isRegistered = registeredIds.includes(item.id);
              const isLive = item.status === "live";

              return (
                <div
                  key={item.id}
                  className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white/60 dark:border-slate-800/60 shadow-none flex flex-col justify-between gap-5 transition-all active:scale-[0.99]"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Subject + Status Badge & Date */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {item.subject}
                        </span>
                        {isLive ? (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            Faol
                          </span>
                        ) : item.status === "upcoming" ? (
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/20">
                            Kutilmoqda
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            Yakunlangan
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-[#EB7C0E] dark:text-orange-400 shrink-0">
                        {item.startDate}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-black font-fredoka text-slate-900 dark:text-white leading-tight">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                      {item.description || "Matematika bo'yicha eng kuchli o'quvchilar bellashuvi! Murakkab va mantiqiy masalalarni yechib, qimmatbaho mukofotlarga ega bo'ling."}
                    </p>

                    {/* Specs Rows (Icons, Labels, Values) */}
                    <div className="space-y-2 pt-1 text-xs sm:text-sm">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-2">
                          <Clock size={15} className="text-slate-400" />
                          <span>Vaqti:</span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.startTime} ({item.durationMinutes} min)
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-2">
                          <Users size={15} className="text-slate-400" />
                          <span>Qatnashuvchilar:</span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.participantsCount || 428} nafar qatnashuvchi
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-2">
                          <Gift size={15} className="text-slate-400" />
                          <span>Sovrinlar:</span>
                        </span>
                        <span className="font-bold text-[#EB7C0E] dark:text-orange-400 truncate max-w-[200px] text-right">
                          {item.prizePool || "Top o'rinlar uchun mukofotlar"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm active:scale-95 transition-all text-center"
                    >
                      Nizamnoma
                    </button>

                    {isLive ? (
                      <Link
                        href={`/dashboard/tests/${item.id}/take?type=olympiad`}
                        className="flex-1 py-3 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center"
                      >
                        <span>Boshlash</span>
                        <ArrowUpRight size={16} />
                      </Link>
                    ) : item.status === "finished" ? (
                      <button
                        onClick={() => {
                          handleTournamentSelectForLeaderboard(item.id);
                          setActiveTab("leaderboard");
                        }}
                        className="flex-1 py-3 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Award size={16} />
                        <span>Reyting</span>
                      </button>
                    ) : isRegistered ? (
                      <Link
                        href={`/dashboard/tests/${item.id}/take?type=olympiad`}
                        className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center"
                      >
                        <Play size={14} className="fill-white" />
                        <span>Boshlash</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleRegister(item)}
                        className="flex-1 py-3 rounded-2xl font-bold text-xs sm:text-sm active:scale-95 flex items-center justify-center gap-1.5 transition-all bg-brand-blue hover:bg-blue-600 text-white shadow-sm"
                      >
                        <span>Qatnashish</span>
                        <ArrowUpRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── TAB 2: REYTING (3D ISOMETRIC PODIUM LEADERBOARD) ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "leaderboard" && (
          loading || leaderboardLoading ? (
            <LeaderboardSkeleton />
          ) : (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Top Toolbar: Tournament Selector & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4 sm:p-5 rounded-[2rem] border border-white/60 dark:border-slate-800/60 shadow-none">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold shadow-none">
                  <Award size={22} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black font-fredoka text-slate-900 dark:text-white leading-tight">
                    G'oliblar & Natijalar Reytingi
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Barcha fanlar bo'yicha eng yuqori natija ko'rsatgan o'quvchilar
                  </p>
                </div>
              </div>

              {/* Selector & Search Inputs */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                <select
                  value={selectedTournamentId}
                  onChange={(e) => handleTournamentSelectForLeaderboard(e.target.value)}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none max-w-full sm:max-w-[240px] truncate"
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.subject ? `[${t.subject}] ` : ""}{t.title}
                    </option>
                  ))}
                </select>

                <div className="relative flex-1 sm:flex-initial">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={leaderboardSearch}
                    onChange={(e) => setLeaderboardSearch(e.target.value)}
                    placeholder="Qidirish..."
                    className="w-full sm:w-44 pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ── 3D ISOMETRIC OLYMPIC PODIUM (TOP 3 - PREMIUM GLASSY 3D) ── */}
            {leaderboard.length >= 3 && (
              <div className="relative w-full bg-gradient-to-b from-white/70 via-slate-50/50 to-white/70 dark:from-slate-900/70 dark:via-slate-850/50 dark:to-slate-900/70 backdrop-blur-xl rounded-[2.5rem] p-5 sm:p-8 border border-white/60 dark:border-slate-800/60 shadow-none overflow-hidden">
                
                {/* Luminous Gold Halo & Ray Glow behind Champion */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-gradient-to-b from-amber-400/20 via-amber-300/10 to-transparent dark:from-amber-500/15 dark:via-amber-500/5 dark:to-transparent rounded-full blur-3xl pointer-events-none" />

                {/* ── 3D STANDS CONTAINER ── */}
                <div className="relative z-10 max-w-lg mx-auto pt-6 pb-2">
                  <div className="grid grid-cols-3 items-end gap-2.5 sm:gap-4">
                    
                    {/* 🥈 2ND PLACE (LEFT - BLUE/INDIGO GLASSY 3D STAND) */}
                    <div className="flex flex-col items-center text-center">
                      {/* Floating Profile Info */}
                      <div className="flex flex-col items-center space-y-1 mb-2.5">
                        <img
                          src={leaderboard[1].student_avatar}
                          alt={leaderboard[1].student_name}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-blue-300 dark:border-blue-500 shadow-none object-cover"
                        />

                        <div className="flex items-center justify-center gap-1 max-w-[90px] sm:max-w-[120px]">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {leaderboard[1].student_name}
                          </h4>
                          {user?.id && leaderboard[1].user_id === user.id && (
                            <span className="px-1 py-0.2 rounded bg-brand-blue text-white text-[8px] font-black uppercase shrink-0 shadow-none">
                              Siz
                            </span>
                          )}
                        </div>

                        {/* Additional Metrics */}
                        <div className="text-xs font-bold text-brand-blue dark:text-blue-400">
                          <span>{leaderboard[1].score} ball</span>
                          <span className="text-[10px] font-semibold opacity-75 ml-1">({leaderboard[1].percentage}%)</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Clock size={10} />
                          <span>{Math.floor(leaderboard[1].time_spent_seconds / 60)} daq</span>
                        </div>
                      </div>

                      {/* 3D Glassy Isometric Stand 2 */}
                      <div className="w-full">
                        {/* 3D Top Cap */}
                        <div className="h-4 sm:h-5 w-full bg-gradient-to-r from-blue-200 via-indigo-200 to-sky-200 dark:from-blue-500 dark:via-indigo-400 dark:to-sky-400 rounded-t-2xl transform -skew-x-2 border-t border-x border-white/80 dark:border-white/30 shadow-none" />
                        {/* 3D Front Face */}
                        <div className="h-28 sm:h-36 w-full bg-gradient-to-b from-blue-400 via-indigo-500 to-indigo-600 dark:from-blue-600 dark:via-indigo-700 dark:to-indigo-800 backdrop-blur-xl rounded-b-2xl shadow-none flex items-center justify-center text-white relative overflow-hidden">
                          <span className="text-4xl sm:text-5xl font-black font-fredoka tracking-tighter drop-shadow-md">
                            2
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 🥇 1ST PLACE (CENTER - TALL GOLD GLASSY 3D STAND) */}
                    <div className="flex flex-col items-center text-center -mt-6 sm:-mt-8 z-20">
                      {/* Floating Profile Info */}
                      <div className="flex flex-col items-center space-y-1 mb-2.5">
                        <div className="relative">
                          <img
                            src={leaderboard[0].student_avatar}
                            alt={leaderboard[0].student_name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-amber-400 shadow-none object-cover ring-4 ring-amber-400/30"
                          />
                          {/* ONLY SINGLE CROWN ABOVE AVATAR */}
                          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 p-1.5 bg-gradient-to-b from-amber-400 to-amber-600 text-white rounded-full shadow-none border border-amber-200">
                            <Crown size={15} className="fill-white" />
                          </span>
                        </div>

                        <div className="flex items-center justify-center gap-1 max-w-[100px] sm:max-w-[140px]">
                          <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
                            {leaderboard[0].student_name}
                          </h4>
                          {user?.id && leaderboard[0].user_id === user.id && (
                            <span className="px-1.5 py-0.2 rounded bg-brand-blue text-white text-[9px] font-black uppercase shrink-0 shadow-none">
                              Siz
                            </span>
                          )}
                        </div>

                        {/* Additional Metrics */}
                        <div className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
                          <span>{leaderboard[0].score} ball</span>
                          <span className="text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 px-1 py-0.2 rounded ml-1">
                            {leaderboard[0].percentage}%
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] text-slate-400 font-medium">
                          <Clock size={10} />
                          <span>{Math.floor(leaderboard[0].time_spent_seconds / 60)} daq {leaderboard[0].time_spent_seconds % 60} son</span>
                        </div>
                      </div>

                      {/* 3D Glassy Isometric Stand 1 */}
                      <div className="w-full">
                        {/* 3D Top Cap */}
                        <div className="h-5 sm:h-6 w-full bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-200 dark:from-amber-400 dark:via-amber-300 dark:to-yellow-300 rounded-t-2xl transform -skew-x-2 border-t border-x border-white/90 dark:border-white/40 shadow-none" />
                        {/* 3D Front Face */}
                        <div className="h-38 sm:h-48 w-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 dark:from-amber-500 dark:via-amber-600 dark:to-amber-700 backdrop-blur-xl rounded-b-2xl shadow-none flex items-center justify-center text-white relative overflow-hidden">
                          <span className="text-5xl sm:text-6xl font-black font-fredoka tracking-tighter drop-shadow-lg">
                            1
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 🥉 3RD PLACE (RIGHT - ORANGE/BRONZE GLASSY 3D STAND) */}
                    <div className="flex flex-col items-center text-center">
                      {/* Floating Profile Info */}
                      <div className="flex flex-col items-center space-y-1 mb-2.5">
                        <img
                          src={leaderboard[2].student_avatar}
                          alt={leaderboard[2].student_name}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-orange-400 dark:border-orange-500 shadow-none object-cover"
                        />

                        <div className="flex items-center justify-center gap-1 max-w-[90px] sm:max-w-[120px]">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {leaderboard[2].student_name}
                          </h4>
                          {user?.id && leaderboard[2].user_id === user.id && (
                            <span className="px-1 py-0.2 rounded bg-brand-blue text-white text-[8px] font-black uppercase shrink-0 shadow-none">
                              Siz
                            </span>
                          )}
                        </div>

                        {/* Additional Metrics */}
                        <div className="text-xs font-bold text-orange-600 dark:text-orange-400">
                          <span>{leaderboard[2].score} ball</span>
                          <span className="text-[10px] font-semibold opacity-75 ml-1">({leaderboard[2].percentage}%)</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Clock size={10} />
                          <span>{Math.floor(leaderboard[2].time_spent_seconds / 60)} daq</span>
                        </div>
                      </div>

                      {/* 3D Glassy Isometric Stand 3 */}
                      <div className="w-full">
                        {/* 3D Top Cap */}
                        <div className="h-4 sm:h-5 w-full bg-gradient-to-r from-orange-200 via-amber-200 to-rose-200 dark:from-orange-500 dark:via-amber-400 dark:to-rose-400 rounded-t-2xl transform -skew-x-2 border-t border-x border-white/80 dark:border-white/30 shadow-none" />
                        {/* 3D Front Face */}
                        <div className="h-24 sm:h-30 w-full bg-gradient-to-b from-orange-400 via-orange-500 to-amber-600 dark:from-orange-600 dark:via-orange-700 dark:to-amber-800 backdrop-blur-xl rounded-b-2xl shadow-none flex items-center justify-center text-white relative overflow-hidden">
                          <span className="text-4xl sm:text-5xl font-black font-fredoka tracking-tighter drop-shadow-md">
                            3
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Sub-Podium Update Pill */}
                <div className="text-center pt-3">
                  <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Clock size={12} />
                    <span>Reyting real-vaqt rejimida yangilanadi • Jami: {filteredLeaderboard.length} ishtirokchi</span>
                  </p>
                </div>

              </div>
            )}

            {/* ── RANKED LIST ── */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-4 sm:p-6 border border-white/60 dark:border-slate-800/60 space-y-3 shadow-none">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-black font-fredoka text-sm sm:text-base text-slate-900 dark:text-white">
                  Ishtirokchilar Natijalari
                </h4>
                <span className="text-xs text-slate-400 font-medium">
                  {filteredLeaderboard.filter((e) => e.rank > 3).length} ta ishtirokchi
                </span>
              </div>

              {filteredLeaderboard.filter((e) => e.rank > 3).length === 0 ? (
                <div className="text-center py-8 space-y-1.5">
                  <Award className="mx-auto text-slate-300 dark:text-slate-700" size={36} />
                  <p className="font-bold text-slate-600 dark:text-slate-300 text-xs">
                    Barcha ishtirokchilar yuqoridagi g'oliblar shoxsupasida aks etgan
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLeaderboard
                    .filter((entry) => entry.rank > 3)
                    .map((entry) => {
                      const isSelf = user?.id && entry.user_id === user.id;

                      return (
                        <div
                          key={entry.id}
                          className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                            isSelf
                              ? "bg-blue-50/80 dark:bg-blue-950/30 border-brand-blue/40 shadow-none"
                              : "bg-white/40 dark:bg-slate-800/30 hover:bg-white/70 dark:hover:bg-slate-800/60 border-slate-100/60 dark:border-slate-800/60"
                          }`}
                        >
                          {/* Left: Rank + Avatar + Name + Submission Date */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs inline-flex items-center justify-center shrink-0">
                              #{entry.rank}
                            </span>

                            <img
                              src={entry.student_avatar}
                              alt={entry.student_name}
                              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 object-cover border border-slate-200/60 dark:border-slate-700"
                            />

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                                  {entry.student_name}
                                </p>
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded bg-brand-blue text-white text-[9px] font-black uppercase shrink-0">
                                    Siz
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">
                                Topshirildi: {entry.completed_at}
                              </p>
                            </div>
                          </div>

                          {/* Right: Score + Accuracy + Time + Prize */}
                          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                            {entry.prize && (
                              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                                <Gift size={12} className="text-amber-500" />
                                <span>{entry.prize}</span>
                              </span>
                            )}

                            <div className="text-right">
                              <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                                <span className="text-brand-blue dark:text-blue-400 font-black">{entry.score}</span>
                                <span className="text-[11px] text-slate-400 font-medium">/ {entry.max_score} ball</span>
                                <span className="ml-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.2 rounded">
                                  {entry.percentage}%
                                </span>
                              </div>
                              <p className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-medium">
                                <Clock size={10} />
                                <span>{Math.floor(entry.time_spent_seconds / 60)} daq {entry.time_spent_seconds % 60} son</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* ── ADDITIONAL INFORMATION & RULES (QO'SHIMCHA MA'LUMOTLAR) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 pt-1">
              
              {/* Card 1: Mukofotlar & Sovrinlar */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-4 sm:p-6 border border-white/60 dark:border-slate-800/60 space-y-3.5 shadow-none">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold">
                    <Gift size={18} />
                  </div>
                  <div>
                    <h4 className="font-black font-fredoka text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                      Musobaqa Mukofotlari
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                      Top o'rin egalari uchun belgilangan sovrinlar
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {selectedTournament?.topPrizes && selectedTournament.topPrizes.length > 0 ? (
                    selectedTournament.topPrizes.map((prize, idx) => {
                      const cleanText = prize
                        .replace(/^[0-9]+-O'rin:\s*/i, '')
                        .replace(/[🥇🥈🥉🎁🏆]/g, '')
                        .trim();

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-white/40 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/40"
                        >
                          <span className="shrink-0">
                            {idx === 0 ? (
                              <Crown size={14} className="text-amber-500 fill-amber-500" />
                            ) : idx === 1 ? (
                              <Medal size={14} className="text-blue-500" />
                            ) : (
                              <Award size={14} className="text-orange-500" />
                            )}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white shrink-0">
                            {idx + 1}-o'rin:
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
                            {cleanText}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 rounded-2xl bg-white/40 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/40 text-slate-500 font-medium">
                      {selectedTournament?.prizePool || "Top o'rinlar uchun esdalik sovg'alari va sertifikatlar"}
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Baholash & Nizom Qoidalari */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-4 sm:p-6 border border-white/60 dark:border-slate-800/60 space-y-3.5 shadow-none">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-brand-blue dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="font-black font-fredoka text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                      Baholash & Nizom Qoidalari
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                      Reyting shakllantirish mezonlari
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-white/40 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/40">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      Har bir to'g'ri javob uchun belgilangan ball beriladi va xatolar uchun ball chegirilmaydi.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-white/40 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/40">
                    <Clock size={15} className="text-brand-blue shrink-0 mt-0.5" />
                    <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      Ballar teng kelganda, testni kamroq vaqtda bajargan ishtirokchi yuqori o'ringa loyiq ko'riladi.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-white/40 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/40">
                    <Award size={15} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      Barcha g'oliblar natijasi moderatorlar tomonidan tekshirilib, diplomlar topshiriladi.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
          )
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── TAB 3: IZOHLAR (COMMENTS) ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "comments" && (
          loading ? (
            <CommentsSkeleton />
          ) : (
          <div className="w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white/60 dark:border-slate-800/60 space-y-5 shadow-none">
            
            <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Fikringiz yoki savolingizni yozing..."
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-blue"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 shrink-0 shadow-none"
              >
                <span>Yuborish</span>
                <Send size={14} />
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3 pt-1">
              {comments.map((comment) => {
                const isLiked = likedCommentIds.includes(comment.id);

                return (
                  <div
                    key={comment.id}
                    className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/40 flex items-start gap-3.5"
                  >
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {comment.author}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {comment.role}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-400 font-medium shrink-0">
                          {comment.time}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {comment.text}
                      </p>

                      <div className="pt-1">
                        <button
                          onClick={() => handleToggleLike(comment.id)}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${
                            isLiked
                              ? "text-brand-blue"
                              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          }`}
                        >
                          <ThumbsUp size={13} className={isLiked ? "fill-brand-blue" : ""} />
                          <span>{comment.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
          )
        )}

      </div>

      {/* ── CLEAN RULES MODAL ── */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 dark:border-slate-800 shadow-2xl space-y-4">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={16} />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                  {selectedItem.subject}
                </span>
                <h3 className="text-lg font-black font-fredoka text-slate-900 dark:text-white leading-tight">
                  {selectedItem.title}
                </h3>
              </div>

              {selectedItem.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {selectedItem.description}
                </p>
              )}

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-white">Musobaqa Qoidalari:</p>
                <ul className="space-y-1 list-disc list-inside">
                  {(selectedItem.rules || []).map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm"
                >
                  Yopish
                </button>

                {selectedItem.status === "live" || registeredIds.includes(selectedItem.id) ? (
                  <Link
                    href={`/dashboard/tests/${selectedItem.id}/take?type=olympiad`}
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center"
                  >
                    <Play size={14} className="fill-white" />
                    <span>Boshlash</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      handleRegister(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                  >
                    <span>Qatnashish</span>
                    <ArrowUpRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
