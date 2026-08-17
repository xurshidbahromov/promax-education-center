"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Users,
  FileText,
  Trash2,
  Plus,
  BookOpen,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Check
} from "lucide-react";
import { toggleTestPublish, assignTestToGroup, removeTestFromGroup, type Question } from "@/lib/tests";
import { useTestDetail, useTestResults, useTestGroups, useGroups, useSubjects } from "@/hooks/useAdminData";
import MathRenderer from "@/components/MathRenderer";

interface PageProps {
  params: Promise<{ id: string }>;
}

const SUBJECT_LABELS: Record<string, string> = {
  math: "Matematika",
  english: "Ingliz tili",
  physics: "Fizika",
  chemistry: "Kimyo",
  biology: "Biologiya",
  general: "Umumiy",
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  easy: { label: "Oson", color: "text-emerald-600 dark:text-emerald-400" },
  medium: { label: "O'rta", color: "text-amber-600 dark:text-amber-400" },
  hard: { label: "Qiyin", color: "text-red-600 dark:text-red-400" },
};

export default function TestDetailPage({ params }: PageProps) {
  const { id: testId } = use(params);
  const queryClient = useQueryClient();

  const { data: test, isLoading } = useTestDetail(testId);
  const { data: results = [] } = useTestResults(testId);
  const { data: assignedGroups = [] } = useTestGroups(testId);
  const { data: subjects = [] } = useSubjects();

  const [activeTab, setActiveTab] = useState<"questions" | "results" | "groups">("questions");
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSubjectForGroup, setSelectedSubjectForGroup] = useState("");
  const { data: groupsForSubject = [] } = useGroups(selectedSubjectForGroup);
  const [assigning, setAssigning] = useState(false);

  const handleTogglePublish = async () => {
    if (!test) return;
    const ok = await toggleTestPublish(testId);
    if (ok) {
      queryClient.invalidateQueries({ queryKey: ["testDetail", testId] });
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      toast.success(test.is_published ? "Qoralamaga o'tkazildi" : "Nashr qilindi!");
    } else {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleAssignGroup = async (groupId: string) => {
    setAssigning(true);
    const res = await assignTestToGroup(testId, groupId);
    setAssigning(false);
    if (!res.success) {
      toast.error(res.error || "Xatolik yuz berdi");
    } else {
      queryClient.invalidateQueries({ queryKey: ["testGroups", testId] });
      toast.success("Guruhga biriktirildi!");
      setShowAssignModal(false);
    }
  };

  const handleRemoveGroup = async (groupId: string) => {
    if (!confirm("Bu guruhdan testni olib tashlashni xohlaysizmi?")) return;
    const res = await removeTestFromGroup(testId, groupId);
    if (!res.success) {
      toast.error(res.error || "Xatolik");
    } else {
      queryClient.invalidateQueries({ queryKey: ["testGroups", testId] });
      toast.success("Olib tashlandi");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-500">
        <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full mr-3" />
        Yuklanmoqda...
      </div>
    );
  }

  if (!test) {
    return (
      <div className="py-20 text-center space-y-4">
        <FileText className="mx-auto text-slate-300 dark:text-slate-700" size={56} />
        <p className="text-slate-500 font-semibold">Test topilmadi</p>
        <Link href="/admin/tests" className="inline-flex items-center gap-2 text-brand-blue hover:underline text-sm font-bold">
          ← Testlar ro'yxatiga qaytish
        </Link>
      </div>
    );
  }

  const completedResults = results.filter(r => r.status === "completed");
  const avgScore = completedResults.length > 0
    ? Math.round(completedResults.reduce((s, r) => s + (r.percentage || 0), 0) / completedResults.length)
    : 0;
  const passedCount = completedResults.filter(r => (r.percentage || 0) >= test.passing_score).length;

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-20">
      {/* ── HEADER ── */}
      <div className="flex items-start gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <Link
          href="/admin/tests"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 mt-0.5"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Link href="/admin/tests" className="text-slate-400 hover:text-brand-blue transition-colors font-medium">
              Testlar
            </Link>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold truncate">{test.title}</span>
          </div>

          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            {test.title}
          </h1>
          {test.description && <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">{test.description}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleTogglePublish}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer ${
              test.is_published
                ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100"
                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
            }`}
          >
            {test.is_published ? (
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
            href={`/admin/tests/${testId}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-brand-blue/10 active:scale-95"
          >
            <Edit size={15} /> <span>Tahrirlash</span>
          </Link>
        </div>
      </div>

      {/* ── INFO CARDS GRID (5 Cols) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Fan", value: SUBJECT_LABELS[test.subject] || test.subject, icon: BookOpen, color: "text-brand-blue" },
          { label: "Savollar", value: `${test.questions.length} ta`, icon: FileText, color: "text-purple-600" },
          { label: "Vaqt", value: test.duration_minutes ? `${test.duration_minutes} min` : "∞", icon: Clock, color: "text-amber-500" },
          { label: "O'tish bali", value: `${test.passing_score}%`, icon: Target, color: "text-emerald-600" },
          { label: "Urinishlar", value: `${results.length} ta`, icon: Users, color: "text-rose-500" },
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
          { id: "questions", label: "Savollar", icon: FileText, count: test.questions.length },
          { id: "results", label: "Natijalar", icon: BarChart3, count: results.length },
          { id: "groups", label: "Guruhlar", icon: Users, count: assignedGroups.length },
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

      {/* ── TAB 1: QUESTIONS ── */}
      {activeTab === "questions" && (
        <div className="space-y-3">
          {test.questions.length === 0 ? (
            <div className="py-16 text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <FileText className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={48} />
              <p className="text-slate-500 text-sm font-semibold">Savollar hali qo'shilmagan</p>
              <Link
                href={`/admin/tests/${testId}/edit`}
                className="mt-4 inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-blue bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
              >
                <Plus size={15} /> <span>Savol qo'shish</span>
              </Link>
            </div>
          ) : (
            test.questions.map((q: Question, idx: number) => (
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
                    {q.question_type === "multiple_choice" && q.options && (
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
                    {q.question_type === "true_false" && (
                      <p className="text-xs sm:text-sm mb-3">
                        To'g'ri javob:{" "}
                        <span className="font-bold text-emerald-600">
                          {q.correct_answer === "true" ? "To'g'ri" : "Noto'g'ri"}
                        </span>
                      </p>
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

      {/* ── TAB 2: RESULTS ── */}
      {activeTab === "results" && (
        <div className="space-y-4">
          {completedResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Topshirdi", value: `${completedResults.length} ta`, color: "text-brand-blue" },
                {
                  label: "O'rtacha ball",
                  value: `${avgScore}%`,
                  color: avgScore >= test.passing_score ? "text-emerald-600" : "text-red-500"
                },
                { label: "O'tdi", value: `${passedCount} ta`, color: "text-emerald-600" }
              ].map((s, i) => (
                <div
                  key={i}
                  className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-3xl text-center shadow-sm"
                >
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}
          {results.length === 0 ? (
            <div className="py-16 text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <BarChart3 className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={48} />
              <p className="text-slate-500 text-sm font-semibold">Hali hech kim bu testni topshirmagan</p>
            </div>
          ) : (
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-800">
                    <tr>
                      {["O'quvchi", "Sana", "Ball", "Holat"].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {results.map((r) => {
                      const pct = r.percentage || 0;
                      const passed = pct >= test.passing_score;
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-xs shrink-0">
                                {r.student?.full_name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                                  {r.student?.full_name || "Noma'lum"}
                                </p>
                                <p className="text-[11px] text-slate-400">{r.student?.phone || ""}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-500">
                            {new Date(r.completed_at || r.started_at).toLocaleDateString("uz-UZ")}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {r.score} / {r.max_score} ({pct}%)
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                passed
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                                  : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                              }`}
                            >
                              {passed ? "O'tdi" : "O'tmadi"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: GROUPS ── */}
      {activeTab === "groups" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-600 transition-colors shadow-md shadow-brand-blue/10"
            >
              <Plus size={16} /> <span>Guruhga Biriktirish</span>
            </button>
          </div>

          {assignedGroups.length === 0 ? (
            <div className="py-16 text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <Users className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={48} />
              <p className="text-slate-500 text-sm font-semibold">Bu test hali birorta guruhga biriktirilmagan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {assignedGroups.map((g) => (
                <div
                  key={g.id}
                  className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 rounded-3xl flex items-center justify-between shadow-sm"
                >
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">{g.group?.name}</p>
                    <p className="text-xs text-slate-400">Biriktirilgan sana: {new Date(g.assigned_at).toLocaleDateString('uz-UZ')}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveGroup(g.group_id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Guruhdan o'chirish"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Assign to Group Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Guruhga Biriktirish</h3>
                  <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Fanni tanlang
                    </label>
                    <select
                      value={selectedSubjectForGroup}
                      onChange={(e) => setSelectedSubjectForGroup(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 outline-none"
                    >
                      <option value="">Barcha Fanlar</option>
                      {(subjects as any[]).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {groupsForSubject.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">Guruhlar topilmadi</p>
                    ) : (
                      groupsForSubject.map((grp) => (
                        <button
                          key={grp.id}
                          disabled={assigning}
                          onClick={() => handleAssignGroup(grp.id)}
                          className="w-full p-3 text-left rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-brand-blue/40 bg-slate-50/50 dark:bg-slate-800/40 transition-colors flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100"
                        >
                          <span>{grp.name}</span>
                          <Plus size={15} className="text-brand-blue" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
