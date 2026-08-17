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
  Plus
} from "lucide-react";
import MathRenderer from "@/components/MathRenderer";
import {
  AdminTournament,
  TournamentQuestion,
  getTournamentById,
  saveAdminTournament,
  deleteAdminTournament
} from "@/lib/admin-queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TournamentDetailPage({ params }: PageProps) {
  const { id: tournamentId } = use(params);
  const router = useRouter();
  const [tournament, setTournament] = useState<AdminTournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"questions" | "rules" | "results">("questions");
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  useEffect(() => {
    loadTournament();
  }, [tournamentId]);

  const loadTournament = async () => {
    setLoading(true);
    try {
      const data = await getTournamentById(tournamentId);
      setTournament(data);
    } catch (err) {
      console.error("Error loading tournament detail:", err);
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
      const res = await saveAdminTournament({ id: tournament.id, status: nextStatus });
      if (res.success) {
        setTournament({ ...tournament, status: nextStatus });
        toast.success(
          nextStatus === "live"
            ? "Musobaqa nashr qilindi (jonli)!"
            : "Musobaqa qoralamaga o'tkazildi!"
        );
      }
    } catch (err) {
      toast.error("Statusni o'zgartirishda xatolik");
    }
  };

  const handleDelete = async () => {
    if (!tournament) return;
    if (!confirm(`"${tournament.title}" musobaqasini o'chirishga ishonchingiz komilmi?`)) return;

    try {
      const res = await deleteAdminTournament(tournament.id);
      if (res.success) {
        toast.success("Musobaqa o'chirildi!");
        router.push("/admin/tournaments");
      }
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
        <Trophy className="mx-auto text-slate-300 dark:text-slate-700" size={56} />
        <p className="text-slate-500 font-semibold">Musobaqa topilmadi</p>
        <Link
          href="/admin/tournaments"
          className="inline-flex items-center gap-2 text-brand-blue hover:underline text-sm font-bold"
        >
          ← Musobaqalar ro'yxatiga qaytish
        </Link>
      </div>
    );
  }

  const questionsList = tournament.questions || [];

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-20">
      {/* ── HEADER ── */}
      <div className="flex items-start gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <Link
          href="/admin/tournaments"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 mt-0.5"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Link
              href="/admin/tournaments"
              className="text-slate-400 hover:text-brand-blue transition-colors font-medium"
            >
              Musobaqalar
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
            href={`/admin/tournaments/${tournamentId}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-brand-blue/10 active:scale-95"
          >
            <Edit size={15} /> <span>Tahrirlash</span>
          </Link>
        </div>
      </div>

      {/* ── INFO CARDS (5 Cols) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          {
            label: "Fan",
            value: tournament.subject,
            icon: BookOpen,
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
            label: "Sovrin",
            value: tournament.prizePool || "Diplom",
            icon: Award,
            color: "text-emerald-600"
          },
          {
            label: "Qatnashuvchilar",
            value: `${tournament.participantsCount || 0} ta`,
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
          { id: "results", label: "Natijalar", icon: BarChart3, count: tournament.participantsCount || 0 }
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
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
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

      {/* ── TAB 1: QUESTIONS TAB ── */}
      {activeTab === "questions" && (
        <div className="space-y-3">
          {questionsList.length === 0 ? (
            <div className="py-16 text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <FileText className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={48} />
              <p className="text-slate-500 text-sm font-semibold">Savollar hali qo'shilmagan</p>
              <Link
                href={`/admin/tournaments/${tournamentId}/edit`}
                className="mt-4 inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-blue bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
              >
                <Plus size={15} /> <span>Savol qo'shish</span>
              </Link>
            </div>
          ) : (
            questionsList.map((q: TournamentQuestion, idx: number) => (
              <div
                key={q.id}
                className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-sm overflow-hidden"
              >
                <button
                  className="w-full flex items-start gap-3.5 p-5 text-left transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer"
                  onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                >
                  <span className="shrink-0 w-7 h-7 rounded-xl bg-brand-blue/10 text-brand-blue text-xs font-black flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                    <MathRenderer content={q.question_text} />
                    {q.image_url && (
                      <div className="mt-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={q.image_url}
                          alt="Savol rasmi"
                          className="max-h-56 w-auto rounded-xl border border-slate-200 dark:border-slate-800 object-contain shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-400">{q.points} ball</span>
                    {expandedQ === q.id ? (
                      <ChevronUp size={16} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400" />
                    )}
                  </div>
                </button>

                {expandedQ === q.id && (
                  <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-3.5">
                    {q.options && (
                      <div className="space-y-2 mb-3">
                        {Object.entries(q.options).map(([key, value]) => (
                          <div
                            key={key}
                            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm ${
                              key === q.correct_answer
                                ? "bg-emerald-50/80 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 font-bold"
                                : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                key === q.correct_answer
                                  ? "bg-emerald-500 text-white"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {key === q.correct_answer ? <Check size={11} /> : key.toUpperCase()}
                            </span>
                            <MathRenderer content={String(value || "")} inline />
                          </div>
                        ))}
                      </div>
                    )}

                    {q.explanation && (
                      <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3.5 py-2.5 border border-slate-100 dark:border-slate-800">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 2: RULES & PRIZES ── */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Award className="text-amber-500" size={20} />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                G'oliblar Mukofotlari & Sovrinlar
              </h3>
            </div>
            <div className="space-y-2">
              {(tournament.topPrizes || []).map((prize, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/20 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  {prize}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FileText className="text-brand-blue" size={20} />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Musobaqa Nizomi & Qoidalari
              </h3>
            </div>
            <div className="space-y-2">
              {(tournament.rules || []).map((rule, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                >
                  <span className="font-bold text-brand-blue">{i + 1}.</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: RESULTS ── */}
      {activeTab === "results" && (
        <div className="space-y-4">
          <div className="py-16 text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <BarChart3 className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={48} />
            <p className="text-slate-500 text-sm font-semibold">Hali hech kim bu musobaqani topshirmagan</p>
          </div>
        </div>
      )}
    </div>
  );
}
