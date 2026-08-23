"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Award,
  FileText,
  Edit,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Check,
  Plus,
  Globe
} from "lucide-react";
import MathRenderer from "@/components/MathRenderer";
import {
  InternationalTournament,
  InternationalQuestion,
  InternationalLeaderboardEntry,
  getInternationalTournamentById,
  saveInternationalTournament,
  deleteInternationalTournament,
  getInternationalLeaderboard
} from "@/lib/international-tournaments";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InternationalTournamentDetailPage({ params }: PageProps) {
  const { id: tournamentId } = use(params);
  const router = useRouter();
  const [tournament, setTournament] = useState<InternationalTournament | null>(null);
  const [leaderboard, setLeaderboard] = useState<InternationalLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"questions" | "rules" | "results">("questions");
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [tournamentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, lbData] = await Promise.all([
        getInternationalTournamentById(tournamentId),
        getInternationalLeaderboard(tournamentId)
      ]);
      setTournament(tData);
      setLeaderboard(lbData);
    } catch (err) {
      console.error("Error loading international tournament detail:", err);
      toast.error("Musobaqa ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!tournament) return;
    const isLive = tournament.status === "live";
    const nextStatus = isLive ? "upcoming" : "live";

    try {
      await saveInternationalTournament({ id: tournament.id, status: nextStatus });
      setTournament({ ...tournament, status: nextStatus });
      toast.success(
        nextStatus === "live"
          ? "Musobaqa nashr qilindi (jonli)!"
          : "Musobaqa qoralamaga o'tkazildi!"
      );
    } catch (err) {
      toast.error("Statusni o'zgartirishda xatolik");
    }
  };

  const handleDelete = async () => {
    if (!tournament) return;
    if (!confirm(`"${tournament.title}" musobaqasini o'chirishga ishonchingiz komilmi?`)) return;

    try {
      await deleteInternationalTournament(tournament.id);
      toast.success("Musobaqa o'chirildi!");
      router.push("/admin/international");
    } catch (err) {
      toast.error("O'chirishda xatolik");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-500">
        <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full mr-3" />
        Yuklanmoqda...
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="py-20 text-center space-y-4">
        <Globe className="mx-auto text-slate-300 dark:text-slate-700" size={56} />
        <p className="text-slate-500 font-semibold">Musobaqa topilmadi</p>
        <Link
          href="/admin/international"
          className="inline-flex items-center gap-2 text-brand-blue hover:underline text-sm font-bold"
        >
          ← Xalqaro musobaqalar ro'yxatiga qaytish
        </Link>
      </div>
    );
  }

  const questionsList = tournament.questions || [];

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-20">
      
      {/* ── HEADER (1:1 with /admin/tournaments/[id]) ── */}
      <div className="flex items-start gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <Link
          href="/admin/international"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 mt-0.5"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Link
              href="/admin/international"
              className="text-slate-400 hover:text-brand-blue transition-colors font-medium"
            >
              Xalqaro Musobaqalar
            </Link>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold truncate">
              {tournament.title}
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            {tournament.title}
          </h1>
          {tournament.description && (
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">{tournament.description}</p>
          )}
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer ${
              tournament.status === "live"
                ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100"
                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
            }`}
          >
            {tournament.status === "live" ? (
              <>
                <XCircle size={15} /> <span>Qoralamaga</span>
              </>
            ) : (
              <>
                <CheckCircle size={15} /> <span>Nashr qilish</span>
              </>
            )}
          </button>

          <Link
            href={`/admin/international/${tournamentId}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-brand-blue/10 active:scale-95"
          >
            <Edit size={15} /> <span>Tahrirlash</span>
          </Link>
        </div>
      </div>

      {/* ── INFO CARDS (5 Cols 1:1 with /admin/tournaments/[id]) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          {
            label: "Format / Fan",
            value: tournament.categoryLabel || tournament.subject,
            icon: Globe,
            color: "text-brand-blue"
          },
          {
            label: "Savollar",
            value: `${questionsList.length || tournament.totalQuestions} ta`,
            icon: FileText,
            color: "text-purple-600"
          },
          {
            label: "Vaqt",
            value: tournament.durationMinutes ? `${tournament.durationMinutes} min` : "∞",
            icon: Clock,
            color: "text-amber-500"
          },
          {
            label: "Shkala",
            value: tournament.scoringScale || "1600 SAT",
            icon: Award,
            color: "text-emerald-600"
          },
          {
            label: "Qatnashuvchilar",
            value: `${leaderboard.length || tournament.participantsCount || 0} ta`,
            icon: Users,
            color: "text-rose-500"
          }
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col gap-1 min-w-0"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <item.icon size={13} className={item.color} />
              <span>{item.label}</span>
            </div>
            <p className={`text-xl sm:text-2xl font-black tracking-tight ${item.color} truncate`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-px">
        {[
          { id: "questions", label: "Savollar", icon: FileText, count: questionsList.length },
          { id: "rules", label: "Qoidalar & Sovrinlar", icon: Award, count: (tournament.topPrizes || []).length },
          { id: "results", label: "Natijalar", icon: BarChart3, count: leaderboard.length || tournament.participantsCount || 0 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.id
                  ? "bg-brand-blue/10 text-brand-blue"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT: QUESTIONS ── */}
      {activeTab === "questions" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Musobaqa Savollari ({questionsList.length} ta)
            </h2>
            <Link
              href={`/admin/international/${tournamentId}/edit`}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline"
            >
              <Plus size={14} /> <span>Savol qo'shish / tahrirlash</span>
            </Link>
          </div>

          {questionsList.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <FileText size={32} className="mx-auto opacity-40" />
              <p className="text-sm font-semibold">Ushbu musobaqaga hali savollar biriktirilmagan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questionsList.map((q, idx) => {
                const isExpanded = expandedQ === q.id;

                return (
                  <div
                    key={q.id}
                    className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 transition-all"
                  >
                    <div
                      className="flex items-start justify-between gap-3 cursor-pointer select-none"
                      onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-brand-blue/10 text-brand-blue text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">
                            <MathRenderer content={q.question_text} />
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {q.question_type === "grid_in" ? "🔢 Grid-In (Yopiq)" : "🔘 4-Variantli"}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              To'g'ri javob: {q.correct_answer}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
                        {q.question_type === "multiple_choice" && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(["A", "B", "C", "D"] as const).map((opt) => {
                              const isCorrect = q.correct_answer === opt;
                              return (
                                <div
                                  key={opt}
                                  className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                                    isCorrect
                                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold"
                                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black ${
                                    isCorrect ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600"
                                  }`}>
                                    {opt}
                                  </span>
                                  <span>{q.options?.[opt] || "(Bo'sh)"}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.question_type === "grid_in" && (
                          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300">
                            <span className="font-bold block mb-0.5">Qabul qilinadigan javoblar:</span>
                            <span className="font-mono font-bold">{(q.accepted_answers || [q.correct_answer]).join(", ")}</span>
                          </div>
                        )}

                        {q.explanation && (
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
                            <span className="font-bold text-slate-700 dark:text-slate-300 block">Yechim / Tushuntirish:</span>
                            <p className="text-slate-600 dark:text-slate-400">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB CONTENT: RULES & PRIZES ── */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base">
              <Award size={18} className="text-amber-500" />
              <span>Sovrinlar Jamg'armasi & O'rinlar</span>
            </h3>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 text-xs font-bold text-amber-800 dark:text-amber-300">
              Jamg'arma: {tournament.prizePool || "Grantlar & Sertifikatlar"}
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {(tournament.topPrizes || []).map((prize, idx) => (
                <li key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                  <span>{prize}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base">
              <BookOpen size={18} className="text-brand-blue" />
              <span>Musobaqa Nizomi & Qoidalar</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {(tournament.rules || []).map((rule, idx) => (
                <li key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: RESULTS / LEADERBOARD ── */}
      {activeTab === "results" && (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Users size={32} className="mx-auto opacity-40" />
              <p className="text-sm font-semibold">Hozircha natijalar mavjud emas</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">O'rin</th>
                  <th className="py-3 px-4">O'quvchi</th>
                  <th className="py-3 px-4">Ball / Shkala</th>
                  <th className="py-3 px-4">Foiz</th>
                  <th className="py-3 px-4">Vaqt</th>
                  <th className="py-3 px-4">Sovrin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaderboard.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      #{entry.rank}
                    </td>
                    <td className="py-3 px-4 flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                      <img src={entry.student_avatar} alt="" className="w-6 h-6 rounded-full bg-slate-200" />
                      <span>{entry.student_name}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {entry.scaled_score || `${entry.score} / ${entry.max_score}`}
                    </td>
                    <td className="py-3 px-4 font-medium">{entry.percentage}%</td>
                    <td className="py-3 px-4 text-slate-400">{Math.round(entry.time_spent_seconds / 60)} daqiqa</td>
                    <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">{entry.prize || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

    </div>
  );
}
