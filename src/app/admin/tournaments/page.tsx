"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";
import {
  Plus,
  Search,
  BookOpen,
  Clock,
  FileText,
  CheckCircle2,
  Copy,
  Edit2,
  Eye,
  Trash2,
  HelpCircle,
  Trophy,
  Users,
  Award,
  PlayCircle,
  MessageSquare,
  AlertCircle,
  Send,
  ThumbsUp,
  X
} from "lucide-react";
import {
  AdminTournament,
  AdminTournamentComment,
  getCachedAdminTournaments,
  getAdminTournaments,
  saveAdminTournament,
  deleteAdminTournament,
  duplicateAdminTournament,
  getAdminTournamentComments,
  deleteAdminTournamentComment
} from "@/lib/admin-queries";

export default function AdminTournamentsPage() {
  const { t } = useLanguage();
  const [tournaments, setTournaments] = useState<AdminTournament[]>(() => {
    return getCachedAdminTournaments();
  });
  const [comments, setComments] = useState<AdminTournamentComment[]>([]);
  const [loading, setLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  // Tabs: 'tournaments' | 'comments'
  const [activeTab, setActiveTab] = useState<"tournaments" | "comments">("tournaments");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "upcoming" | "finished">("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  useEffect(() => {
    const cached = getCachedAdminTournaments();
    if (cached.length > 0) {
      setTournaments(cached);
      hasLoadedRef.current = true;
      loadData(true);
    } else {
      loadData(false);
    }
  }, []);

  const loadData = async (isSilent: boolean = false) => {
    if (!isSilent && !hasLoadedRef.current && tournaments.length === 0) {
      setLoading(true);
    }
    try {
      const [tList, cList] = await Promise.all([
        getAdminTournaments(),
        getAdminTournamentComments()
      ]);
      setTournaments(tList);
      setComments(cList);
      hasLoadedRef.current = true;
    } catch (err) {
      console.error("Error loading tournament data:", err);
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation (1:1 with /admin/tests)
  const stats = useMemo(() => {
    const total = tournaments.length;
    const live = tournaments.filter((t) => t.status === "live").length;
    const upcoming = tournaments.filter((t) => t.status === "upcoming").length;
    const totalQuestions = tournaments.reduce(
      (acc, t) => acc + (t.questions?.length || t.totalQuestions || 0),
      0
    );
    return { total, live, upcoming, totalQuestions };
  }, [tournaments]);

  // Unique subjects for filter
  const subjects = useMemo(() => {
    const list = Array.from(new Set(tournaments.map((t) => t.subject).filter(Boolean)));
    return ["all", ...list];
  }, [tournaments]);

  // Filtered tournaments
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesSubject = subjectFilter === "all" || t.subject === subjectFilter;

      return matchesSearch && matchesStatus && matchesSubject;
    });
  }, [tournaments, searchQuery, statusFilter, subjectFilter]);

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await duplicateAdminTournament(id);
      if (duplicated) {
        toast.success("Musobaqa nusxalandi!");
        setTournaments((prev) => [duplicated, ...prev]);
      } else {
        toast.error("Nusxalashda xatolik");
      }
    } catch (err) {
      toast.error("Nusxalashda xatolik");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" musobaqasini o'chirishga ishonchingiz komilmi?`)) return;

    try {
      const res = await deleteAdminTournament(id);
      if (res.success) {
        toast.success("Musobaqa o'chirildi!");
        setTournaments((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast.error("O'chirishda xatolik: " + (res.error || ""));
      }
    } catch (err) {
      toast.error("O'chirishda xatolik yuz berdi");
    }
  };

  const handleToggleStatus = async (
    tItem: AdminTournament,
    newStatus: "live" | "upcoming" | "finished"
  ) => {
    try {
      const res = await saveAdminTournament({ id: tItem.id, status: newStatus });
      if (res.success) {
        toast.success(
          newStatus === "live"
            ? "Musobaqa jonli (faol) qilindi!"
            : newStatus === "finished"
            ? "Musobaqa yakunlandi!"
            : "Musobaqa kutilmoqda holatiga o'tkazildi!"
        );
        setTournaments((prev) =>
          prev.map((item) => (item.id === tItem.id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      toast.error("Statusni o'zgartirishda xatolik");
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm("Ushbu izohni o'chirishni tasdiqlaysizmi?")) return;

    try {
      const res = await deleteAdminTournamentComment(id);
      if (res.success) {
        toast.success("Izoh o'chirildi!");
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      toast.error("Izohni o'chirishda xatolik");
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* ── HEADER (1:1 with /admin/tests) ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            {t("admin.tournaments.title") || "Musobaqalar Boshqaruvi"}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Barcha bilim musobaqalari va sovrinli bellashuvlar ({tournaments.length} ta)
          </p>
        </div>

        <Link
          href="/admin/tournaments/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-blue-600 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-blue/10 self-start md:self-auto"
        >
          <Plus size={16} />
          <span>{t("admin.tournaments.new") || "Yangi Musobaqa Yaratish"}</span>
        </Link>
      </div>

      {/* ── SUMMARY STATS GRID (1:1 with /admin/tests) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: "Jami Musobaqalar",
            value: `${stats.total} ta`,
            icon: Trophy,
            color: "text-blue-500"
          },
          {
            label: "Jonli (Faol)",
            value: `${stats.live} ta`,
            icon: CheckCircle2,
            color: "text-emerald-500"
          },
          {
            label: "Kutilmoqda",
            value: `${stats.upcoming} ta`,
            icon: Clock,
            color: "text-amber-500"
          },
          {
            label: "Jami Savollar",
            value: `${stats.totalQuestions} ta`,
            icon: HelpCircle,
            color: "text-purple-500"
          }
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 sm:p-6 rounded-3xl flex items-center justify-between min-w-0"
          >
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate mb-1">
                {s.label}
              </p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate">
                {s.value}
              </p>
            </div>
            
            {/* Box-free Icon */}
            <s.icon size={26} className={`${s.color} shrink-0 opacity-90`} />
          </div>
        ))}
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab("tournaments")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "tournaments"
              ? "bg-slate-800 text-white shadow-sm"
              : "bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200/60 dark:border-slate-800/60"
          }`}
        >
          <Trophy size={15} />
          <span>Musobaqalar Ro'yxati ({tournaments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("comments")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "comments"
              ? "bg-slate-800 text-white shadow-sm"
              : "bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200/60 dark:border-slate-800/60"
          }`}
        >
          <MessageSquare size={15} />
          <span>Izohlar Moderatsiyasi ({comments.length})</span>
        </button>
      </div>

      {/* ── TAB 1: TOURNAMENTS LIST (1:1 with /admin/tests) ── */}
      {activeTab === "tournaments" && (
        <div className="space-y-5">
          {/* Search & Filter Bar */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 relative w-full">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Musobaqa nomi yoki fani bo'yicha qidirish..."
                className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="all">Barcha Statuslar</option>
                <option value="live">Jonli (Faol)</option>
                <option value="upcoming">Kutilmoqda</option>
                <option value="finished">Yakunlangan</option>
              </select>

              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub === "all" ? "Barcha Fanlar" : sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tournaments Grid (1:1 with /admin/tests) */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />
              ))}
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">Musobaqalar topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base sm:text-lg line-clamp-2">
                        {tournament.title}
                      </h3>
                      <button
                        onClick={() =>
                          handleToggleStatus(
                            tournament,
                            tournament.status === "upcoming"
                              ? "live"
                              : tournament.status === "live"
                              ? "finished"
                              : "upcoming"
                          )
                        }
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
                          tournament.status === "live"
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
                            : tournament.status === "upcoming"
                            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {tournament.status === "live"
                          ? "Nashr qilingan (Faol)"
                          : tournament.status === "upcoming"
                          ? "Kutilmoqda"
                          : "Yakunlangan"}
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 font-medium line-clamp-2">
                      {tournament.description || "Tavsif kiritilmagan"}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 pt-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                        {tournament.subject}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                        <Clock size={13} />
                        {tournament.durationMinutes} min
                      </span>
                      <span className="text-slate-400 text-xs font-bold">
                        {tournament.questions?.length || tournament.totalQuestions || 0} ta savol
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-bold">
                        <Users size={13} className="text-brand-blue shrink-0" />
                        {tournament.participantsCount || 0} ta qatnashuvchi
                      </span>
                      {tournament.prizePool && (
                        <span className="text-amber-600 dark:text-amber-400 text-xs font-bold truncate max-w-[140px]">
                          {tournament.prizePool}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 1:1 Matching Card Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                    <button
                      onClick={() => handleDuplicate(tournament.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-blue transition-colors"
                    >
                      <Copy size={15} />
                      <span>Nusxalash</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/tournaments/${tournament.id}`}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="Ko'rish"
                      >
                        <Eye size={17} />
                      </Link>

                      <button
                        onClick={() => handleDelete(tournament.id, tournament.title)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: COMMENTS MODERATION ── */}
      {activeTab === "comments" && (
        <div className="space-y-4">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden">
            {comments.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-medium">
                Hozircha hech qanday izoh qoldirilmagan.
              </div>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="p-5 flex items-start justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={c.avatar}
                      alt={c.author}
                      className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 object-cover shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{c.author}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {c.role}
                        </span>
                        <span className="text-[11px] text-slate-400">{c.time}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                        {c.text}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                    title="Izohni o'chirish"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
