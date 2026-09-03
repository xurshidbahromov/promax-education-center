"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";
import {
  Globe,
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
  FileText,
  AlertCircle,
  Timer
} from "lucide-react";
import {
  InternationalTournament,
  InternationalLeaderboardEntry,
  getCachedInternationalTournaments,
  getInternationalTournaments,
  getInternationalLeaderboard,
  registerForInternationalTournament,
  getInternationalRegistrations,
  getUserCompletedInternationalTournamentIds
} from "@/lib/international-tournaments";
import { getTournamentTimingInfo, formatUzbekDate } from "@/lib/tournament-timing";
import { useCurrentUser, useUserProfile } from "@/hooks/useDashboardData";
import {
  OlympiadsBannerSkeleton,
  TournamentsSkeleton,
  LeaderboardSkeleton,
  CommentsSkeleton
} from "@/components/ui/Skeleton";

interface CommentItem {
  id: string;
  author: string;
  avatar?: string | null;
  role: string;
  time: string;
  text: string;
  likes: number;
}

export default function InternationalCompetitionsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user } = useCurrentUser();
  const { data: profile } = useUserProfile(user?.id);

  // Tab State: "tournaments" | "leaderboard" | "comments"
  const initialTab = (searchParams.get("tab") as "tournaments" | "leaderboard" | "comments") || "tournaments";
  const [activeTab, setActiveTab] = useState<"tournaments" | "leaderboard" | "comments">(initialTab);

  // Status Filter State for tournaments: "all" | "live" | "upcoming" | "finished"
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "upcoming" | "finished">("all");

  // Tournaments State (Instant initial state from cache for 0ms render)
  const [tournaments, setTournaments] = useState<InternationalTournament[]>(() => {
    return getCachedInternationalTournaments();
  });
  const [loading, setLoading] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InternationalTournament | null>(null);
  const [confirmStartItem, setConfirmStartItem] = useState<InternationalTournament | null>(null);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const hasLoadedRef = useRef(false);

  // Precompute timing maps & counts for instant filtering
  const timingMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getTournamentTimingInfo>>();
    tournaments.forEach(t => {
      map.set(t.id, getTournamentTimingInfo(t));
    });
    return map;
  }, [tournaments]);

  const counts = useMemo(() => {
    let live = 0;
    let upcoming = 0;
    let finished = 0;
    tournaments.forEach(t => {
      const timing = timingMap.get(t.id);
      if (timing?.status === "live") live++;
      else if (timing?.status === "upcoming") upcoming++;
      else if (timing?.status === "finished") finished++;
    });
    return {
      all: tournaments.length,
      live,
      upcoming,
      finished
    };
  }, [tournaments, timingMap]);

  const filteredTournaments = useMemo(() => {
    return tournaments
      .filter(t => {
        if (statusFilter === "all") return true;
        const timing = timingMap.get(t.id);
        return timing?.status === statusFilter;
      })
      .sort((a, b) => {
        if (statusFilter === "all") {
          const statusWeight = (s?: string) => s === "live" ? 0 : s === "upcoming" ? 1 : 2;
          const weightA = statusWeight(timingMap.get(a.id)?.status);
          const weightB = statusWeight(timingMap.get(b.id)?.status);
          if (weightA !== weightB) return weightA - weightB;
        }
        return 0;
      });
  }, [tournaments, statusFilter, timingMap]);

  // Leaderboard State
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<InternationalLeaderboardEntry[]>([]);
  const [leaderboardSearch, setLeaderboardSearch] = useState("");

  // Comments State (Starts empty, loads real user comments)
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);

  useEffect(() => {
    loadComments();
    if (typeof window !== 'undefined') {
      const savedLikes = localStorage.getItem('promax_international_liked_comments');
      if (savedLikes) {
        try {
          setLikedCommentIds(JSON.parse(savedLikes));
        } catch (e) {}
      }
    }
  }, []);

  // Real-time sync interval when comments tab is open
  useEffect(() => {
    if (activeTab === "comments") {
      loadComments();
      const interval = setInterval(() => {
        loadComments();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/tournament-comments?category=international&_t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.comments && Array.isArray(json.comments)) {
          setComments(json.comments);
        }
      }
    } catch (e) {
      console.error("Error loading international comments:", e);
    }
  };

  useEffect(() => {
    const cached = getCachedInternationalTournaments();
    if (cached.length > 0) {
      setTournaments(cached);
      hasLoadedRef.current = true;
      const queryId = searchParams.get("id");
      const defaultId = queryId && cached.some(t => t.id === queryId) ? queryId : cached[0].id;
      setSelectedTournamentId(defaultId);
      loadData(true);
    } else {
      loadData(false);
    }
  }, [user?.id]);

  const loadData = async (isSilent: boolean = false) => {
    if (!isSilent && !hasLoadedRef.current && tournaments.length === 0) {
      setLoading(true);
    }
    try {
      const data = await getInternationalTournaments();
      if (Array.isArray(data) && data.length > 0) {
        setTournaments(data);
        hasLoadedRef.current = true;
        const queryId = searchParams.get("id");
        const defaultId = queryId && data.some(t => t.id === queryId) ? queryId : (selectedTournamentId || data[0].id);
        setSelectedTournamentId(defaultId);
        getInternationalLeaderboard(defaultId).then(setLeaderboard).catch(() => {});
      }

      const [regList, compList] = await Promise.all([
        getInternationalRegistrations(user?.id),
        getUserCompletedInternationalTournamentIds(user?.id)
      ]);
      setRegisteredIds(regList);
      setCompletedIds(compList);
    } catch (e) {
      console.error("Error loading international tournaments:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentSelectForLeaderboard = async (id: string) => {
    setSelectedTournamentId(id);
    try {
      const lb = await getInternationalLeaderboard(id);
      setLeaderboard(lb);
    } catch (e) {
      console.error("Error loading international leaderboard:", e);
    }
  };

  const handleRegister = async (item: InternationalTournament) => {
    if (registeredIds.includes(item.id)) {
      toast.success("Siz ro'yxatdan o'tgansiz!", { icon: "✅" });
      return;
    }

    try {
      registerForInternationalTournament(item.id, user?.id);
      setRegisteredIds(prev => [...prev, item.id]);
      toast.success(`"${item.title}" musobaqasiga muvaffaqiyatli ro'yxatdan o'tdingiz!`, {
        icon: "🎓"
      });
      setSelectedItem(null);
    } catch (e) {
      toast.error("Ro'yxatdan o'tishda xatolik yuz berdi");
    }
  };

  const currentUserName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "O'quvchi";
  const currentUserAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
  const currentUserRole = profile?.role === 'admin' ? "Tashkilotchi" : profile?.role === 'teacher' ? "Ustoz" : "Ishtirokchi";

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const commentText = newCommentText.trim();
    setNewCommentText("");

    const payload = {
      category: 'international',
      author: currentUserName,
      avatar: currentUserAvatar,
      role: currentUserRole,
      text: commentText,
      user_id: user?.id
    };

    try {
      const res = await fetch('/api/tournament-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.comment) {
          setComments((prev) => [json.comment, ...prev.filter(c => c.id !== json.comment.id)]);
          toast.success("Izohingiz muvaffaqiyatli qo'shildi!", { icon: "💬" });
          return;
        }
      }
      toast.error("Izoh yuborishda xatolik yuz berdi");
    } catch (err) {
      console.error("Error adding international comment:", err);
      toast.error("Izoh yuborishda xatolik yuz berdi");
    }
  };

  const handleToggleLike = async (id: string) => {
    const isLiked = likedCommentIds.includes(id);
    const delta = isLiked ? -1 : 1;
    const updatedLikes = isLiked
      ? likedCommentIds.filter((item) => item !== id)
      : [...likedCommentIds, id];

    setLikedCommentIds(updatedLikes);
    if (typeof window !== 'undefined') {
      localStorage.setItem('promax_international_liked_comments', JSON.stringify(updatedLikes));
    }

    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, likes: Math.max(0, (c.likes || 0) + delta) } : c))
    );

    try {
      await fetch('/api/tournament-comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: id, delta })
      });
    } catch (e) {}
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
            <h1 className="text-xl sm:text-2xl font-bold font-fredoka text-slate-800 dark:text-slate-100 leading-tight">
              Xalqaro musobaqalar
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              SAT, AMC, IELTS va xalqaro olimpiadalarda bilimingizni sinang
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-4 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex-wrap pt-1">
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Globe size={16} className="text-amber-500" />
                <span>Xalqaro musobaqalar</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Users size={16} className="text-brand-blue" />
                <span>{tournaments.reduce((acc, t) => acc + (t.participantsCount || 0), 0)} nafar qatnashuvchi</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1.5 text-[#EB7C0E] dark:text-orange-400 font-bold">
                <Gift size={16} className="text-[#EB7C0E]" />
                <span>Xalqaro sertifikat & grantlar</span>
              </span>
            </div>
          </div>
        )}

        {/* ── 3-TAB SWITCHER (ULTRA-ROUNDED PILL) ── */}
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
                layoutId="international-tab-active-pill"
                className="absolute inset-0 bg-brand-blue rounded-full shadow-none -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <Globe size={16} className={activeTab === "tournaments" ? "stroke-[2.5]" : "stroke-[2]"} />
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
                layoutId="international-tab-active-pill"
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
                layoutId="international-tab-active-pill"
                className="absolute inset-0 bg-brand-blue rounded-full shadow-none -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <MessageSquare size={16} className={activeTab === "comments" ? "stroke-[2.5]" : "stroke-[2]"} />
            <span>Izohlar</span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── TAB 1: MUSOBAQALAR (TOURNAMENTS GRID WITH STATUS FILTER) ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "tournaments" && (
          loading ? (
            <TournamentsSkeleton />
          ) : (
            <div className="space-y-5">
              {/* ── STATUS FILTER PILLS (BARCHASI / FAOL / KUTILAYOTGAN / YAKUNLANGAN) ── */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap">
                {/* Barchasi */}
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    statusFilter === "all"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                      : "bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-white/60 dark:border-slate-800/60"
                  }`}
                >
                  <Globe size={14} className={statusFilter === "all" ? "text-amber-400 dark:text-amber-500" : "text-slate-400"} />
                  <span>Barchasi</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                    statusFilter === "all"
                      ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}>
                    {counts.all}
                  </span>
                </button>

                {/* Faol */}
                <button
                  onClick={() => setStatusFilter("live")}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    statusFilter === "live"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-white/60 dark:border-slate-800/60"
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Faol</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                    statusFilter === "live"
                      ? "bg-white/20 text-white"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {counts.live}
                  </span>
                </button>

                {/* Kutilayotgan */}
                <button
                  onClick={() => setStatusFilter("upcoming")}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    statusFilter === "upcoming"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 border border-white/60 dark:border-slate-800/60"
                  }`}
                >
                  <Clock size={14} className={statusFilter === "upcoming" ? "text-white" : "text-amber-500"} />
                  <span>Kutilayotgan</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                    statusFilter === "upcoming"
                      ? "bg-white/20 text-white"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}>
                    {counts.upcoming}
                  </span>
                </button>

                {/* Yakunlangan */}
                <button
                  onClick={() => setStatusFilter("finished")}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                    statusFilter === "finished"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-white/60 dark:border-slate-800/60"
                  }`}
                >
                  <CheckCircle2 size={14} className={statusFilter === "finished" ? "text-white" : "text-indigo-500"} />
                  <span>Yakunlangan</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                    statusFilter === "finished"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}>
                    {counts.finished}
                  </span>
                </button>
              </div>

              {/* Grid or Empty State */}
              {filteredTournaments.length === 0 ? (
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-10 text-center border border-white/60 dark:border-slate-800/60 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Globe size={28} />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white">
                    {statusFilter === "live"
                      ? "Hozirda faol xalqaro musobaqa mavjud emas"
                      : statusFilter === "upcoming"
                      ? "Hozircha kutilayotgan xalqaro musobaqalar yo'q"
                      : statusFilter === "finished"
                      ? "Hali yakunlangan xalqaro musobaqalar mavjud emas"
                      : "Xalqaro musobaqalar topilmadi"}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    {statusFilter === "live"
                      ? "Yaqinda boshlanadigan xalqaro musobaqalarga ro'yxatdan o'tib, tayyorgarlik ko'rishingiz mumkin."
                      : "Yangi xalqaro musobaqalar muntazam e'lon qilib boriladi."}
                  </p>
                  {statusFilter !== "all" && (
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="mt-2 px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                      Barcha musobaqalarni ko'rish
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredTournaments.map((item) => {
                    const timing = timingMap.get(item.id) || getTournamentTimingInfo(item);
                    const isRegistered = registeredIds.includes(item.id);
                    const isCompleted = completedIds.includes(item.id);
                    const isLive = timing.status === "live";
                    const isUpcoming = timing.status === "upcoming";
                    const isFinished = timing.status === "finished";

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
                              {isCompleted ? (
                                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-md border border-indigo-500/20 flex items-center gap-1.5">
                                  <CheckCircle2 size={12} />
                                  Topshirilgan
                                </span>
                              ) : isLive ? (
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Faol
                                </span>
                              ) : isUpcoming ? (
                                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                                  <Clock size={11} />
                                  Kutilmoqda
                                </span>
                              ) : (
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                                  Yakunlangan
                                </span>
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-[#EB7C0E] dark:text-orange-400 shrink-0">
                              {formatUzbekDate(item.startDate) || item.startDate}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-lg sm:text-xl font-black font-fredoka text-slate-900 dark:text-white leading-tight">
                            {item.title}
                          </h3>

                          {/* Description */}
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                            {item.description}
                          </p>

                          {/* Specs Rows (Icons, Labels, Values) */}
                          <div className="space-y-2 pt-1 text-xs sm:text-sm">
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                              <span className="flex items-center gap-2">
                                <Clock size={15} className="text-slate-400" />
                                <span>Vaqti:</span>
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {item.startTime || "15:00"} ({item.durationMinutes || 60} daqiqa)
                              </span>
                            </div>

                            {/* Live Dynamic Countdown Row */}
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                              <span className="flex items-center gap-2 font-bold text-xs">
                                <Timer size={14} className={isLive ? "text-emerald-500 animate-spin" : isUpcoming ? "text-amber-500" : "text-slate-400"} />
                                <span>{timing.countdown.label}:</span>
                              </span>
                              <span className={`font-black text-xs sm:text-sm ${
                                isLive ? "text-emerald-600 dark:text-emerald-400" : isUpcoming ? "text-amber-600 dark:text-amber-400" : "text-slate-400"
                              }`}>
                                {timing.countdown.formatted}
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
                            className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm active:scale-95 transition-all text-center cursor-pointer"
                          >
                            Nizom
                          </button>

                          {isCompleted ? (
                            <button
                              onClick={() => {
                                handleTournamentSelectForLeaderboard(item.id);
                                setActiveTab("leaderboard");
                              }}
                              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                            >
                              <Award size={16} />
                              <span>Natijangiz</span>
                            </button>
                          ) : isLive ? (
                            <button
                              onClick={() => setConfirmStartItem(item)}
                              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center cursor-pointer animate-pulse"
                            >
                              <Play size={14} className="fill-white" />
                              <span>Boshlash</span>
                            </button>
                          ) : isFinished ? (
                            <button
                              onClick={() => {
                                handleTournamentSelectForLeaderboard(item.id);
                                setActiveTab("leaderboard");
                              }}
                              className="flex-1 py-3 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                            >
                              <Award size={16} />
                              <span>Reyting</span>
                            </button>
                          ) : isRegistered ? (
                            <button
                              onClick={() => {
                                toast.error(`Musobaqa hali boshlanmagan! Boshlanish vaqti: ${formatUzbekDate(item.startDate)} ${item.startTime || '15:00'}`, {
                                  duration: 4000
                                });
                              }}
                              className="flex-1 py-3 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-none active:scale-95 transition-all text-center cursor-pointer"
                            >
                              <Clock size={14} />
                              <span>Kutilmoqda</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegister(item)}
                              className="flex-1 py-3 rounded-2xl font-bold text-xs sm:text-sm active:scale-95 flex items-center justify-center gap-1.5 transition-all bg-brand-blue hover:bg-blue-600 text-white shadow-sm cursor-pointer"
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
              )}
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
                    SAT, AMC va xalqaro musobaqalar bo'yicha eng yuqori natijalar
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

            {/* ── 3D ISOMETRIC OLYMPIC PODIUM (TOP 3) ── */}
            {leaderboard.length >= 3 && (
              <div className="relative w-full bg-gradient-to-b from-white/70 via-slate-50/50 to-white/70 dark:from-slate-900/70 dark:via-slate-850/50 dark:to-slate-900/70 backdrop-blur-xl rounded-[2.5rem] p-5 sm:p-8 border border-white/60 dark:border-slate-800/60 shadow-none overflow-hidden">
                
                {/* Luminous Gold Halo behind Champion */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-gradient-to-b from-amber-400/20 via-amber-300/10 to-transparent dark:from-amber-500/15 dark:via-amber-500/5 dark:to-transparent rounded-full blur-3xl pointer-events-none" />

                {/* ── 3D STANDS CONTAINER ── */}
                <div className="relative z-10 max-w-lg mx-auto pt-6 pb-2">
                  <div className="grid grid-cols-3 items-end gap-2.5 sm:gap-4">
                    
                    {/* 🥈 2ND PLACE */}
                    {(() => {
                      const item = leaderboard[1];
                      const isSelf = user?.id && item.user_id === user.id;
                      const avatar = isSelf ? (profile?.avatar_url || item.student_avatar) : item.student_avatar;
                      const hasAvatar = avatar && !avatar.includes('dicebear');

                      return (
                        <div className="flex flex-col items-center text-center">
                          <div className="flex flex-col items-center space-y-1 mb-2.5">
                            {hasAvatar ? (
                              <img
                                src={avatar}
                                alt={item.student_name}
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-blue-300 dark:border-blue-500 shadow-none object-cover"
                              />
                            ) : (
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 text-brand-blue dark:text-blue-300 font-bold text-lg sm:text-xl flex items-center justify-center border-2 border-blue-300 dark:border-blue-500 shadow-none uppercase select-none">
                                {(item.student_name || "O")[0]}
                              </div>
                            )}

                            <div className="flex items-center justify-center gap-1 max-w-[90px] sm:max-w-[120px]">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                {item.student_name}
                              </h4>
                              {isSelf && (
                                <span className="px-1 py-0.2 rounded bg-brand-blue text-white text-[8px] font-black uppercase shrink-0 shadow-none">
                                  Siz
                                </span>
                              )}
                            </div>

                            <div className="text-xs font-bold text-brand-blue dark:text-blue-400">
                              <span>{item.scaled_score || `${item.score} ball`}</span>
                              <span className="text-[10px] font-semibold opacity-75 ml-1">({item.percentage}%)</span>
                            </div>
                            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
                              <Clock size={10} />
                              <span>{Math.floor(item.time_spent_seconds / 60)} daq</span>
                            </div>
                          </div>

                          <div className="w-full">
                            <div className="h-4 sm:h-5 w-full bg-gradient-to-r from-blue-200 via-indigo-200 to-sky-200 dark:from-blue-500 dark:via-indigo-400 dark:to-sky-400 rounded-t-2xl transform -skew-x-2 border-t border-x border-white/80 dark:border-white/30 shadow-none" />
                            <div className="h-28 sm:h-36 w-full bg-gradient-to-b from-blue-400 via-indigo-500 to-indigo-600 dark:from-blue-600 dark:via-indigo-700 dark:to-indigo-800 backdrop-blur-xl rounded-b-2xl shadow-none flex items-center justify-center text-white relative overflow-hidden">
                              <span className="text-4xl sm:text-5xl font-black font-fredoka tracking-tighter drop-shadow-md">
                                2
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* 🥇 1ST PLACE */}
                    {(() => {
                      const item = leaderboard[0];
                      const isSelf = user?.id && item.user_id === user.id;
                      const avatar = isSelf ? (profile?.avatar_url || item.student_avatar) : item.student_avatar;
                      const hasAvatar = avatar && !avatar.includes('dicebear');

                      return (
                        <div className="flex flex-col items-center text-center -mt-6 sm:-mt-8 z-20">
                          <div className="flex flex-col items-center space-y-1 mb-2.5">
                            <div className="relative">
                              {hasAvatar ? (
                                <img
                                  src={avatar}
                                  alt={item.student_name}
                                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-amber-400 shadow-none object-cover ring-4 ring-amber-400/30"
                                />
                              ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 font-black text-xl sm:text-2xl flex items-center justify-center border-4 border-amber-400 ring-4 ring-amber-400/30 uppercase select-none">
                                  {(item.student_name || "O")[0]}
                                </div>
                              )}
                              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 p-1.5 bg-gradient-to-b from-amber-400 to-amber-600 text-white rounded-full shadow-none border border-amber-200">
                                <Crown size={15} className="fill-white" />
                              </span>
                            </div>

                            <div className="flex items-center justify-center gap-1 max-w-[100px] sm:max-w-[140px]">
                              <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
                                {item.student_name}
                              </h4>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded bg-brand-blue text-white text-[9px] font-black uppercase shrink-0 shadow-none">
                                  Siz
                                </span>
                              )}
                            </div>

                            <div className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
                              <span>{item.scaled_score || `${item.score} ball`}</span>
                              <span className="text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 px-1 py-0.2 rounded ml-1">
                                {item.percentage}%
                              </span>
                            </div>
                            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] text-slate-400 font-medium">
                              <Clock size={10} />
                              <span>{Math.floor(item.time_spent_seconds / 60)} daq {item.time_spent_seconds % 60} son</span>
                            </div>
                          </div>

                          <div className="w-full">
                            <div className="h-5 sm:h-6 w-full bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-200 dark:from-amber-400 dark:via-amber-300 dark:to-yellow-300 rounded-t-2xl transform -skew-x-2 border-t border-x border-white/90 dark:border-white/40 shadow-none" />
                            <div className="h-38 sm:h-48 w-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 dark:from-amber-500 dark:via-amber-600 dark:to-amber-700 backdrop-blur-xl rounded-b-2xl shadow-none flex items-center justify-center text-white relative overflow-hidden">
                              <span className="text-5xl sm:text-6xl font-black font-fredoka tracking-tighter drop-shadow-lg">
                                1
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* 🥉 3RD PLACE */}
                    {(() => {
                      const item = leaderboard[2];
                      const isSelf = user?.id && item.user_id === user.id;
                      const avatar = isSelf ? (profile?.avatar_url || item.student_avatar) : item.student_avatar;
                      const hasAvatar = avatar && !avatar.includes('dicebear');

                      return (
                        <div className="flex flex-col items-center text-center">
                          <div className="flex flex-col items-center space-y-1 mb-2.5">
                            {hasAvatar ? (
                              <img
                                src={avatar}
                                alt={item.student_name}
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-orange-400 dark:border-orange-500 shadow-none object-cover"
                              />
                            ) : (
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 font-bold text-lg sm:text-xl flex items-center justify-center border-2 border-orange-400 dark:border-orange-500 shadow-none uppercase select-none">
                                {(item.student_name || "O")[0]}
                              </div>
                            )}

                            <div className="flex items-center justify-center gap-1 max-w-[90px] sm:max-w-[120px]">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                {item.student_name}
                              </h4>
                              {isSelf && (
                                <span className="px-1 py-0.2 rounded bg-brand-blue text-white text-[8px] font-black uppercase shrink-0 shadow-none">
                                  Siz
                                </span>
                              )}
                            </div>

                            <div className="text-xs font-bold text-orange-600 dark:text-orange-400">
                              <span>{item.scaled_score || `${item.score} ball`}</span>
                              <span className="text-[10px] font-semibold opacity-75 ml-1">({item.percentage}%)</span>
                            </div>
                            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
                              <Clock size={10} />
                              <span>{Math.floor(item.time_spent_seconds / 60)} daq</span>
                            </div>
                          </div>

                          <div className="w-full">
                            <div className="h-4 sm:h-5 w-full bg-gradient-to-r from-orange-200 via-amber-200 to-rose-200 dark:from-orange-500 dark:via-amber-400 dark:to-rose-400 rounded-t-2xl transform -skew-x-2 border-t border-x border-white/80 dark:border-white/30 shadow-none" />
                            <div className="h-24 sm:h-30 w-full bg-gradient-to-b from-orange-400 via-orange-500 to-amber-600 dark:from-orange-600 dark:via-orange-700 dark:to-amber-800 backdrop-blur-xl rounded-b-2xl shadow-none flex items-center justify-center text-white relative overflow-hidden">
                              <span className="text-4xl sm:text-5xl font-black font-fredoka tracking-tighter drop-shadow-md">
                                3
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                </div>

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
                  {leaderboard.length} ta ishtirokchi
                </span>
              </div>

              {leaderboard.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Award className="mx-auto text-slate-300 dark:text-slate-700" size={40} />
                  <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                    Ushbu musobaqa bo'yicha hali natijalar mavjud emas
                  </p>
                  <p className="text-xs text-slate-400">
                    Musobaqada qatnashing va birinchi bo'lib reytingga kiring!
                  </p>
                </div>
              ) : (leaderboard.length >= 3 && filteredLeaderboard.filter((e) => e.rank > 3).length === 0) ? (
                <div className="text-center py-6 space-y-1">
                  <Award className="mx-auto text-slate-300 dark:text-slate-700" size={32} />
                  <p className="font-bold text-slate-600 dark:text-slate-300 text-xs">
                    Barcha ishtirokchilar yuqoridagi g'oliblar shoxsupasida aks etgan
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(leaderboard.length >= 3
                    ? filteredLeaderboard.filter((entry) => entry.rank > 3)
                    : filteredLeaderboard
                  ).map((entry) => {
                    const isSelf = user?.id && entry.user_id === user.id;
                    const avatar = isSelf ? (profile?.avatar_url || entry.student_avatar) : entry.student_avatar;
                    const hasAvatar = avatar && !avatar.includes('dicebear');

                      return (
                        <div
                          key={entry.id}
                          className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                            isSelf
                              ? "bg-blue-50/80 dark:bg-blue-950/30 border-brand-blue/40 shadow-none"
                              : "bg-white/40 dark:bg-slate-800/30 hover:bg-white/70 dark:hover:bg-slate-800/60 border-slate-100/60 dark:border-slate-800/60"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs inline-flex items-center justify-center shrink-0">
                              #{entry.rank}
                            </span>

                            {hasAvatar ? (
                              <img
                                src={avatar}
                                alt={entry.student_name}
                                className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 object-cover border border-slate-200/60 dark:border-slate-700"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-brand-blue/20 shrink-0 select-none uppercase">
                                {(entry.student_name || "O")[0]}
                              </div>
                            )}

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

                          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                            {entry.prize && (
                              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                                <Gift size={12} className="text-amber-500" />
                                <span>{entry.prize}</span>
                              </span>
                            )}

                            <div className="text-right">
                              <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                                <span className="text-brand-blue dark:text-blue-400 font-black">
                                  {entry.scaled_score || `${entry.score} ball`}
                                </span>
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
            <form onSubmit={handleAddComment} className="flex items-center gap-3">
              {currentUserAvatar ? (
                <img
                  src={currentUserAvatar}
                  alt={currentUserName}
                  className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-blue-400 font-bold text-sm flex items-center justify-center border border-brand-blue/20 shrink-0 select-none uppercase shadow-sm">
                  {(currentUserName || "O")[0]}
                </div>
              )}
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Fikringiz yoki savolingizni yozing..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-blue"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-5 py-3 rounded-2xl bg-brand-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 shrink-0 shadow-none transition-all cursor-pointer"
                >
                  <span>Yuborish</span>
                  <Send size={14} />
                </button>
              </div>
            </form>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <MessageSquare size={22} />
                </div>
                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                  Hozircha hech qanday izoh yo'q
                </p>
                <p className="text-xs text-slate-400">
                  Birinchi bo'lib fikringiz yoki savolingizni qoldiring!
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {comments.map((comment) => {
                  const isLiked = likedCommentIds.includes(comment.id);

                  return (
                    <div
                      key={comment.id}
                      className="p-4 rounded-2xl bg-white/40 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/40 flex items-start gap-3.5"
                    >
                      {comment.avatar ? (
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-brand-blue/20 shrink-0 select-none uppercase">
                          {(comment.author || "O")[0]}
                        </div>
                      )}

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
                            className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
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
            )}

          </div>
          )
        )}

      </div>

      {/* ── CLEAN NIZOMNOMA / RULES MODAL ── */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 dark:border-slate-800 shadow-2xl space-y-4">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
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
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm cursor-pointer"
                >
                  Yopish
                </button>

                {completedIds.includes(selectedItem.id) ? (
                  <button
                    onClick={() => {
                      const id = selectedItem.id;
                      setSelectedItem(null);
                      handleTournamentSelectForLeaderboard(id);
                      setActiveTab("leaderboard");
                    }}
                    className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center cursor-pointer"
                  >
                    <Award size={16} />
                    <span>Natijani ko'rish</span>
                  </button>
                ) : selectedItem.status === "live" || registeredIds.includes(selectedItem.id) ? (
                  <button
                    onClick={() => {
                      const item = selectedItem;
                      setSelectedItem(null);
                      setConfirmStartItem(item);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center cursor-pointer"
                  >
                    <Play size={14} className="fill-white" />
                    <span>Boshlash</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleRegister(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
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

      {/* ── START COMPETITION CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {confirmStartItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 border border-white/80 dark:border-slate-800 shadow-2xl space-y-5"
            >
              <button
                onClick={() => setConfirmStartItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Icon & Title */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertCircle size={26} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-fredoka text-slate-900 dark:text-white leading-tight">
                    Musobaqani boshlaysizmi?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-[240px]">
                    {confirmStartItem.title}
                  </p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Clock size={15} className="text-brand-blue" />
                  <span>Vaqti: <strong>{confirmStartItem.durationMinutes} daqiqa</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <FileText size={15} className="text-indigo-500" />
                  <span>Savollar: <strong>{confirmStartItem.totalQuestions || 30} ta</strong></span>
                </div>
              </div>

              {/* Important Warning Alert */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 flex items-start gap-2.5">
                <Clock size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                  Testni boshlaganingizdan so'ng vaqt hisobi darhol boshlanadi va uni to'xtatib bo'lmaydi. Barqaror internet aloqangiz borligiga ishonch hosil qiling.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => setConfirmStartItem(null)}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer text-center"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={() => {
                    const id = confirmStartItem.id;
                    setConfirmStartItem(null);
                    router.push(`/dashboard/tests/${id}/take?type=international`);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer text-center"
                >
                  <Play size={15} className="fill-white" />
                  <span>Ha, boshlash</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
