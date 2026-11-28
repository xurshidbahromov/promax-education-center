"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import StartTestConfirmSheet from "@/components/dashboard/StartTestConfirmSheet";
import PromaxEmptyState from "@/components/ui/PromaxEmptyState";
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
  FileText,
  AlertCircle,
  Timer,
  Calendar,
  RotateCcw
} from "lucide-react";
import {
  AdminTournament,
  TournamentLeaderboardEntry,
  getCachedAdminTournaments,
  getAdminTournaments,
  getTournamentLeaderboard,
  getCachedTournamentLeaderboard,
  registerForTournament,
  getTournamentRegistrations,
  getUserCompletedTournamentIds,
  getUserCompletedTournamentIdsSync
} from "@/lib/tournaments";
import { getTournamentTimingInfo, formatUzbekDate } from "@/lib/tournament-timing";
import { useCurrentUser, useUserProfile } from "@/hooks/useDashboardData";
import {
  OlympiadsBannerSkeleton,
  TournamentsSkeleton,
  LeaderboardSkeleton,
  CommentsSkeleton
} from "@/components/ui/Skeleton";
import TournamentLeaderboardView from "@/components/dashboard/TournamentLeaderboardView";
import TournamentCommentsView from "@/components/dashboard/TournamentCommentsView";

interface CommentItem {
  id: string;
  author: string;
  avatar?: string | null;
  role: string;
  time: string;
  text: string;
  likes: number;
  user_id?: string;
}

export default function OlympiadsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [confirmStartItem, setConfirmStartItem] = useState<AdminTournament | null>(null);

  useEffect(() => {
    if (confirmStartItem?.id) {
      router.prefetch(`/dashboard/tests/${confirmStartItem.id}/take?type=olympiad`);
    }
  }, [confirmStartItem?.id, router]);
  const searchParams = useSearchParams();
  const { data: user } = useCurrentUser();
  const { data: profile } = useUserProfile(user?.id);

  // Tab State: "tournaments" | "leaderboard" | "comments"
  const initialTab = (searchParams.get("tab") as "tournaments" | "leaderboard" | "comments") || "tournaments";
  const [activeTab, setActiveTab] = useState<"tournaments" | "leaderboard" | "comments">(initialTab);

  // Status Filter State for tournaments: "all" | "live" | "upcoming" | "finished"
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "upcoming" | "finished">("all");

  // Tournaments State (Instant initial state from cache for 0ms render)
  const [tournaments, setTournaments] = useState<AdminTournament[]>(() => {
    return getCachedAdminTournaments();
  });
  const [loading, setLoading] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AdminTournament | null>(null);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);

  // Determine initial tournament ID synchronously
  const initialTournamentId = useMemo(() => {
    const queryId = searchParams.get("id");
    const cachedList = getCachedAdminTournaments();
    if (queryId && cachedList.some(t => t.id === queryId)) return queryId;
    return cachedList[0]?.id || "tourn_grand_respublika_2026";
  }, [searchParams]);

  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    return getUserCompletedTournamentIdsSync(user?.id);
  });
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

  // Leaderboard State (Instant synchronous initial state from cache so podium never vanishes)
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(initialTournamentId);
  const [leaderboard, setLeaderboard] = useState<TournamentLeaderboardEntry[]>(() => {
    return getCachedTournamentLeaderboard(initialTournamentId);
  });
  const [leaderboardSearch, setLeaderboardSearch] = useState("");

  // Comments State (Starts empty, loads real user comments)
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);

  useEffect(() => {
    loadComments();
    if (typeof window !== 'undefined') {
      const savedLikes = localStorage.getItem('promax_olympiad_liked_comments');
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
      const res = await fetch(`/api/tournament-comments?category=olympiad&_t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.comments && Array.isArray(json.comments)) {
          setComments(json.comments);
        }
      }
    } catch (e) {
      console.error("Error loading olympiad comments:", e);
    }
  };

  useEffect(() => {
    const cached = getCachedAdminTournaments();
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

    const handleResume = () => {
      if (document.visibilityState === "visible") {
        loadData(true);
      }
    };
    window.addEventListener("focus", handleResume);
    document.addEventListener("visibilitychange", handleResume);
    return () => {
      window.removeEventListener("focus", handleResume);
      document.removeEventListener("visibilitychange", handleResume);
    };
  }, [user?.id]);

  const loadData = async (isSilent: boolean = false) => {
    if (!isSilent && !hasLoadedRef.current && tournaments.length === 0) {
      setLoading(true);
    }
    try {
      const data = await getAdminTournaments();
      if (Array.isArray(data) && data.length > 0) {
        setTournaments(data);
        hasLoadedRef.current = true;
        const queryId = searchParams.get("id");
        const defaultId = queryId && data.some(t => t.id === queryId) ? queryId : (selectedTournamentId || data[0].id);
        setSelectedTournamentId(defaultId);
        getTournamentLeaderboard(defaultId).then((fresh) => {
          if (Array.isArray(fresh)) {
            setLeaderboard(fresh);
          }
        }).catch(() => {});
      }

      const [regList, compList] = await Promise.all([
        getTournamentRegistrations(user?.id),
        getUserCompletedTournamentIds(user?.id)
      ]);
      setRegisteredIds(regList);
      setCompletedIds(compList);
    } catch (e) {
      console.error("Error loading tournaments:", e);
    } finally {
      setLoading(false);
    }
  };

  // Reactive leaderboard sync on activeTab or selectedTournamentId change (single fetch, proper loading state)
  useEffect(() => {
    if (!selectedTournamentId) return;
    let isMounted = true;

    const cached = getCachedTournamentLeaderboard(selectedTournamentId);
    setLeaderboard(cached);
    if (cached.length === 0) setLeaderboardLoading(true);

    getTournamentLeaderboard(selectedTournamentId)
      .then((fresh) => {
        if (isMounted && Array.isArray(fresh)) {
          setLeaderboard(fresh);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLeaderboardLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedTournamentId, activeTab]);

  const handleTournamentSelectForLeaderboard = (id: string) => {
    setSelectedTournamentId(id);
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
      name: profile?.full_name || user?.user_metadata?.full_name || "O'quvchi"
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

  const currentUserName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "O'quvchi";
  const currentUserAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
  const currentUserRole = profile?.role === 'admin' ? "Tashkilotchi" : profile?.role === 'teacher' ? "Ustoz" : "O'quvchi";

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const commentText = newCommentText.trim();
    setNewCommentText("");

    const payload = {
      category: 'olympiad',
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
          toast.success("Izohingiz muvaffaqiyatli qo'shildi!");
          return;
        }
      }
      toast.error("Izoh yuborishda xatolik yuz berdi");
    } catch (err) {
      console.error("Error adding comment:", err);
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
      localStorage.setItem('promax_olympiad_liked_comments', JSON.stringify(updatedLikes));
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

  const handleDeleteComment = async (id: string) => {
    try {
      const res = await fetch(`/api/tournament-comments?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
        toast.success("Izoh o'chirildi");
      } else {
        const json = await res.json().catch(() => ({}));
        toast.error(json.error || "Izohni o'chirib bo'lmadi");
      }
    } catch {
      toast.error("Izohni o'chirishda xatolik yuz berdi");
    }
  };

  const selectedTournament = tournaments.find((t) => t.id === selectedTournamentId) || tournaments[0];
  
  // Deduplicate leaderboard: Each unique student appears only once with their highest score
  const uniqueLeaderboard = useMemo(() => {
    const sorted = [...leaderboard].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.time_spent_seconds || 0) - (b.time_spent_seconds || 0);
    });
    const seen = new Set<string>();
    const unique: TournamentLeaderboardEntry[] = [];
    for (const entry of sorted) {
      const key = (entry.user_id && entry.user_id !== 'anonymous_user' && entry.user_id !== 'current_user' && entry.user_id !== 'guest')
        ? entry.user_id
        : (entry.student_name ? entry.student_name.trim().toLowerCase() : entry.id);

      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(entry);
    }
    return unique.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  }, [leaderboard]);

  return (
    <div className="relative text-slate-800 dark:text-white font-sans pb-20">

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
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-sans font-semibold text-slate-900 dark:text-white leading-tight tracking-tight">
                Milliy imtihonlar
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                Bilimingizni sinang va mukofotlarni qo'lga kiriting
              </p>
            </div>

            {/* Minimalist Meta Row */}
            <div className="flex items-center gap-x-5 gap-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 flex-wrap pt-0.5">
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-brand-blue shrink-0" />
                <span>{tournaments.reduce((acc, t) => acc + (t.participantsCount || 0), 0)} nafar qatnashuvchi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gift size={14} className="text-[#EB7C0E] dark:text-orange-400 shrink-0" />
                <span>Qimmatbaho sovg'alar</span>
              </div>
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
                  <Trophy size={14} className={statusFilter === "all" ? "text-amber-400 dark:text-amber-500" : "text-slate-400"} />
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
                <PromaxEmptyState
                  variant="trophy"
                  compact
                  title={
                    statusFilter === "live"
                      ? "Hozirda faol musobaqa mavjud emas"
                      : statusFilter === "upcoming"
                      ? "Hozircha kutilayotgan musobaqalar yo'q"
                      : statusFilter === "finished"
                      ? "Hali yakunlangan musobaqalar mavjud emas"
                      : "Musobaqalar topilmadi"
                  }
                  description={
                    statusFilter === "live"
                      ? "Yaqinda boshlanadigan musobaqalarga ro'yxatdan o'tib, tayyorgarlik ko'rishingiz mumkin."
                      : "Yangi musobaqalar muntazam e'lon qilib boriladi."
                  }
                  actions={
                    statusFilter !== "all" && (
                      <button
                        type="button"
                        onClick={() => setStatusFilter("all")}
                        className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold transition-colors active:scale-95 cursor-pointer"
                      >
                        Barcha musobaqalarni ko&apos;rish
                      </button>
                    )
                  }
                />
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
                        className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl rounded-[2rem] border border-white/60 dark:border-slate-800/60 transition-all duration-300 hover:shadow-xl active:scale-[0.99] flex flex-col justify-between overflow-hidden relative"
                      >
                        {/* ── MINIMAL PREMIUM TICKET / RECEIPT STUB (CHIPTA QISMI) ── */}
                        <div className="relative bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-md px-6 py-4 flex items-center justify-between gap-3">
                          {/* Left: Sana & Vaqt */}
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <Calendar size={14} className="text-[#EB7C0E] dark:text-orange-400 shrink-0" />
                            <span className="text-slate-800 dark:text-slate-200">{formatUzbekDate(item.startDate) || item.startDate}</span>
                          </div>

                          {/* Right: Solid Smooth Glassy Status Badge (Bordersiz, toza glassy uslubda) */}
                          <div className="shrink-0">
                            {isCompleted ? (
                              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/15 dark:bg-indigo-500/20 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5">
                                <CheckCircle2 size={12} />
                                <span>Topshirilgan</span>
                              </span>
                            ) : isLive ? (
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 dark:bg-emerald-500/20 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span>Faol</span>
                              </span>
                            ) : isUpcoming ? (
                              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/15 dark:bg-amber-500/20 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5">
                                <Clock size={12} />
                                <span>Kutilmoqda</span>
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-500/15 dark:bg-slate-500/20 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5">
                                <span>Yakunlangan</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ── SMOOTH GLASSY TICKET PERFORATION LINE & TICKET NOTCHES ── */}
                        <div className="relative w-full flex items-center h-0 z-20">
                          {/* Left ticket cutout notch (Smooth 24px Yarim oy, ochiq og'iz) */}
                          <div className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-3.5 h-6 overflow-hidden pointer-events-none">
                            <div className="w-6 h-6 rounded-full -ml-3 bg-[var(--background)] border border-slate-200/90 dark:border-slate-800" />
                          </div>

                          {/* Smooth, refined chipta perforatsiya chizig'i */}
                          <div className="w-full px-4 flex items-center overflow-hidden">
                            <svg className="w-full h-[2px] text-slate-200/90 dark:text-slate-800" preserveAspectRatio="none">
                              <line
                                x1="0"
                                y1="1"
                                x2="100%"
                                y2="1"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeDasharray="6 5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>

                          {/* Right ticket cutout notch (Smooth 24px Yarim oy, ochiq og'iz) */}
                          <div className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-3.5 h-6 overflow-hidden pointer-events-none">
                            <div className="w-6 h-6 rounded-full bg-[var(--background)] border border-slate-200/90 dark:border-slate-800" />
                          </div>
                        </div>

                        {/* ── CARD BODY (TITLE, DESCRIPTION, SPECS, ACTIONS) ── */}
                        <div className="p-5 sm:p-6 flex flex-col justify-between gap-5 flex-1">
                          <div className="space-y-3.5">
                            {/* Title */}
                            <h3 className="text-lg sm:text-xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-tight">
                              {item.title}
                            </h3>

                            {/* Description */}
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                              {item.description || "Musobaqa qoidalariga muvofiq qatnashing va yuqori natijalarni qo'lga kiriting."}
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
                                  <Timer size={14} className={isLive ? "text-emerald-500" : isUpcoming ? "text-amber-500" : "text-slate-400"} />
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

                              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                <span className="flex items-center gap-2">
                                  <Users size={15} className="text-slate-400" />
                                  <span>Qatnashuvchilar:</span>
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {item.participantsCount || 0} nafar
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Action Buttons */}
                          <div className="pt-2 space-y-2">
                            {isCompleted ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setSelectedItem(item)}
                                    className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs sm:text-sm active:scale-95 transition-all text-center cursor-pointer"
                                  >
                                    Nizom
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleTournamentSelectForLeaderboard(item.id);
                                      setActiveTab("leaderboard");
                                    }}
                                    className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                                  >
                                    <Award size={15} />
                                    <span>Natijangiz</span>
                                  </button>
                                </div>

                                <Link
                                  href={`/dashboard/tests/${item.id}/take?type=olympiad&olympiad=true&mode=practice`}
                                  className="w-full py-2.5 sm:py-3 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
                                >
                                  <RotateCcw size={15} />
                                  <span>Qayta yechish</span>
                                </Link>
                              </>
                            ) : isLive ? (
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setSelectedItem(item)}
                                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm active:scale-95 transition-all text-center cursor-pointer"
                                >
                                  Nizom
                                </button>
                                <button
                                  onClick={() => setConfirmStartItem(item)}
                                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center cursor-pointer"
                                >
                                  <Play size={14} className="fill-white" />
                                  <span>Boshlash</span>
                                </button>
                              </div>
                            ) : isFinished ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setSelectedItem(item)}
                                    className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs sm:text-sm active:scale-95 transition-all text-center cursor-pointer"
                                  >
                                    Nizom
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleTournamentSelectForLeaderboard(item.id);
                                      setActiveTab("leaderboard");
                                    }}
                                    className="flex-1 py-2.5 sm:py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                                  >
                                    <Award size={15} />
                                    <span>Reyting</span>
                                  </button>
                                </div>

                                <Link
                                  href={`/dashboard/tests/${item.id}/take?type=olympiad&olympiad=true&mode=practice`}
                                  className="w-full py-2.5 sm:py-3 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
                                >
                                  <Play size={14} className="fill-white" />
                                  <span>Mashq qilish</span>
                                </Link>
                              </>
                            ) : isRegistered ? (
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setSelectedItem(item)}
                                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm active:scale-95 transition-all text-center cursor-pointer"
                                >
                                  Nizom
                                </button>
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
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setSelectedItem(item)}
                                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm active:scale-95 transition-all text-center cursor-pointer"
                                >
                                  Nizom
                                </button>
                                <button
                                  onClick={() => handleRegister(item)}
                                  className="flex-1 py-3 rounded-2xl font-bold text-xs sm:text-sm active:scale-95 flex items-center justify-center gap-1.5 transition-all bg-brand-blue hover:bg-blue-600 text-white shadow-sm cursor-pointer"
                                >
                                  <span>Qatnashish</span>
                                  <ArrowUpRight size={16} />
                                </button>
                              </div>
                            )}
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

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── TAB 2: REYTING (3D ISOMETRIC PODIUM LEADERBOARD) ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "leaderboard" && (
          (loading || leaderboardLoading) && leaderboard.length === 0 ? (
            <LeaderboardSkeleton />
          ) : (
            <TournamentLeaderboardView
              mode="national"
              subtitle="Milliy imtihonlar bo'yicha eng yuqori natijalar"
              tournaments={tournaments}
              selectedTournamentId={selectedTournamentId}
              onSelectTournament={handleTournamentSelectForLeaderboard}
              searchQuery={leaderboardSearch}
              onSearchChange={setLeaderboardSearch}
              entries={uniqueLeaderboard}
              completedIds={completedIds}
              currentUserId={user?.id}
              currentUserAvatar={profile?.avatar_url}
              onStartParticipate={() => {
                const currentTourney = tournaments.find((t) => t.id === selectedTournamentId);
                if (currentTourney && currentTourney.status !== "finished") {
                  setConfirmStartItem(currentTourney);
                } else {
                  setActiveTab("tournaments");
                }
              }}
            />
          )
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── TAB 3: IZOHLAR (COMMENTS) ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === "comments" && (
          loading ? (
            <CommentsSkeleton />
          ) : (
            <TournamentCommentsView
              subtitle="Milliy imtihonlar bo'yicha savollar va fikr-mulohazalar"
              comments={comments}
              likedCommentIds={likedCommentIds}
              currentUserId={user?.id}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
              currentUserRole={currentUserRole}
              isAdmin={["admin", "superadmin", "staff", "teacher"].includes(profile?.role || "")}
              newCommentText={newCommentText}
              onNewCommentTextChange={setNewCommentText}
              onSubmitComment={handleAddComment}
              onToggleLike={handleToggleLike}
              onDeleteComment={handleDeleteComment}
            />
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
                <h3 className="text-lg font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-tight">
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

              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Users size={15} className="text-brand-blue shrink-0" />
                <span>Qatnashuvchilar soni: <b className="text-slate-900 dark:text-white">{selectedItem.participantsCount || 0} nafar</b></span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm"
                >
                  Yopish
                </button>

                {completedIds.includes(selectedItem.id) ? (
                  <>
                    <button
                      onClick={() => {
                        const id = selectedItem.id;
                        setSelectedItem(null);
                        handleTournamentSelectForLeaderboard(id);
                        setActiveTab("leaderboard");
                      }}
                      className="flex-1 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all text-center cursor-pointer"
                    >
                      <Award size={15} />
                      <span>Natija</span>
                    </button>
                    <Link
                      href={`/dashboard/tests/${selectedItem.id}/take?type=olympiad&olympiad=true&mode=practice`}
                      onClick={() => setSelectedItem(null)}
                      className="flex-1 py-3 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center cursor-pointer"
                    >
                      <RotateCcw size={15} />
                      <span>Qayta yechish</span>
                    </Link>
                  </>
                ) : selectedItem.status === "finished" ? (
                  <>
                    <button
                      onClick={() => {
                        const id = selectedItem.id;
                        setSelectedItem(null);
                        handleTournamentSelectForLeaderboard(id);
                        setActiveTab("leaderboard");
                      }}
                      className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all text-center cursor-pointer"
                    >
                      <Award size={15} />
                      <span>Reyting</span>
                    </button>
                    <Link
                      href={`/dashboard/tests/${selectedItem.id}/take?type=olympiad&olympiad=true&mode=practice`}
                      onClick={() => setSelectedItem(null)}
                      className="flex-1 py-3 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center cursor-pointer"
                    >
                      <Play size={14} className="fill-white" />
                      <span>Mashq qilish</span>
                    </Link>
                  </>
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

      {/* ── START COMPETITION CONFIRMATION SHEET (Portaled, lightweight) ── */}
      <StartTestConfirmSheet
        item={confirmStartItem}
        onClose={() => setConfirmStartItem(null)}
        onConfirm={(item) => {
          setConfirmStartItem(null);
          router.push(`/dashboard/tests/${item.id}/take?type=olympiad`);
        }}
      />
    </div>
  );
}
