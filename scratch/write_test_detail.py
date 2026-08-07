content = """"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ArrowLeft, Edit, CheckCircle, XCircle, Clock, Target, Users,
  FileText, PlayCircle, Trash2, Plus, BookOpen, BarChart3,
  UserCheck, TrendingUp, X, ChevronDown, ChevronUp, Check
} from "lucide-react";
import { toggleTestPublish, assignTestToGroup, removeTestFromGroup, type Question } from "@/lib/tests";
import { useTestDetail, useTestResults, useTestGroups, useGroups, useSubjects } from "@/hooks/useAdminData";

interface PageProps { params: Promise<{ id: string }> }

const SUBJECT_LABELS: Record<string, string> = {
  math: "Matematika", english: "Ingliz tili", physics: "Fizika",
  chemistry: "Kimyo", biology: "Biologiya", general: "Umumiy",
};
const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  easy: { label: "Oson", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
  medium: { label: "O'rta", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
  hard: { label: "Qiyin", color: "text-red-600 bg-red-50 dark:bg-red-900/20" },
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
      <div className="py-20 text-center">
        <FileText className="mx-auto text-slate-300 mb-4" size={56} />
        <p className="text-slate-500 mb-4">Test topilmadi</p>
        <Link href="/admin/tests" className="text-brand-blue hover:underline text-sm">← Testlar ro'yxatiga qaytish</Link>
      </div>
    );
  }

  const difficulty = DIFFICULTY_CONFIG[test.difficulty_level] || { label: test.difficulty_level, color: "text-slate-600 bg-slate-50" };
  const completedResults = results.filter(r => r.status === "completed");
  const avgScore = completedResults.length > 0
    ? Math.round(completedResults.reduce((s, r) => s + (r.percentage || 0), 0) / completedResults.length)
    : 0;
  const passedCount = completedResults.filter(r => (r.percentage || 0) >= test.passing_score).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/admin/tests" className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 mt-0.5">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-sm mb-1">
            <Link href="/admin/tests" className="text-slate-400 hover:text-brand-blue transition-colors">Testlar</Link>
            <span className="text-slate-300 dark:text-slate-600">›</span>
            <span className="text-slate-700 dark:text-slate-200 font-semibold truncate">{test.title}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug">{test.title}</h1>
          {test.description && <p className="text-sm text-slate-500 mt-1">{test.description}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleTogglePublish}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors active:scale-95 ${
              test.is_published
                ? "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20"
                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20"
            }`}
          >
            {test.is_published ? <><XCircle size={15} /> Qoralamaga</> : <><CheckCircle size={15} /> Nashr qilish</>}
          </button>
          <Link
            href={`/admin/tests/${testId}/edit`}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors shadow-md shadow-brand-blue/20 active:scale-95"
          >
            <Edit size={15} /> Tahrirlash
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Fan", value: SUBJECT_LABELS[test.subject] || test.subject, icon: BookOpen, color: "text-brand-blue" },
          { label: "Savollar", value: `${test.questions.length} ta`, icon: FileText, color: "text-purple-600" },
          { label: "Vaqt", value: test.duration_minutes ? `${test.duration_minutes} min` : "∞", icon: Clock, color: "text-amber-500" },
          { label: "O'tish bali", value: `${test.passing_score}%`, icon: Target, color: "text-emerald-600" },
          { label: "Urinishlar", value: `${results.length} ta`, icon: Users, color: "text-rose-500" },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-3 shadow-sm flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <item.icon size={13} className={item.color} />
              {item.label}
            </div>
            <p className={`font-bold text-base ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-px">
        {[
          { id: "questions", label: "Savollar", icon: FileText, count: test.questions.length },
          { id: "results", label: "Natijalar", icon: BarChart3, count: results.length },
          { id: "groups", label: "Guruhlar", icon: Users, count: assignedGroups.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              activeTab === tab.id ? "bg-brand-blue/10 text-brand-blue" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* QUESTIONS TAB */}
      {activeTab === "questions" && (
        <div className="space-y-3">
          {test.questions.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
              <FileText className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 text-sm">Savollar hali qo'shilmagan</p>
              <Link href={`/admin/tests/${testId}/edit`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors">
                <Plus size={15} /> Savol qo'shish
              </Link>
            </div>
          ) : (
            test.questions.map((q: Question, idx: number) => (
              <div key={q.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-start gap-3 p-4 text-left"
                  onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-brand-blue/10 text-brand-blue text-xs font-bold flex items-center justify-center mt-0.5">{idx + 1}</span>
                  <p className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">{q.question_text}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400">{q.points} ball</span>
                    {expandedQ === q.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </button>
                {expandedQ === q.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-slate-800 pt-3">
                    {q.question_type === "multiple_choice" && q.options && (
                      <div className="space-y-2 mb-3">
                        {Object.entries(q.options).map(([key, value]) => (
                          <div key={key} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm ${
                            key === q.correct_answer
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-medium"
                              : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                          }`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              key === q.correct_answer ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            }`}>{key === q.correct_answer ? <Check size={11} /> : key.toUpperCase()}</span>
                            {value}
                          </div>
                        ))}
                      </div>
                    )}
                    {q.question_type === "true_false" && (
                      <p className="text-sm mb-3">
                        To'g'ri javob: <span className="font-bold text-emerald-600">{q.correct_answer === "true" ? "To'g'ri" : "Noto'g'ri"}</span>
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
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

      {/* RESULTS TAB */}
      {activeTab === "results" && (
        <div className="space-y-4">
          {completedResults.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Topshirdi", value: completedResults.length, color: "text-brand-blue" },
                { label: "O'rtacha ball", value: `${avgScore}%`, color: avgScore >= test.passing_score ? "text-emerald-600" : "text-red-500" },
                { label: "O'tdi", value: `${passedCount} ta`, color: "text-emerald-600" },
              ].map((s, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 text-center shadow-sm">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}
          {results.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
              <BarChart3 className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 text-sm">Hali hech kim bu testni topshirmagan</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                    <tr>
                      {["O'quvchi", "Sana", "Ball", "Holat"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {results.map((r) => {
                      const pct = r.percentage || 0;
                      const passed = pct >= test.passing_score;
                      return (
                        <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-semibold text-sm flex-shrink-0">
                                {r.student?.full_name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{r.student?.full_name || "Noma'lum"}</p>
                                <p className="text-xs text-slate-400">{r.student?.phone || ""}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {r.completed_at ? new Date(r.completed_at).toLocaleDateString("uz-UZ") : "Davom etmoqda"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${passed ? "bg-emerald-500" : "bg-red-400"}`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                              <span className={`text-sm font-bold ${passed ? "text-emerald-600" : "text-red-500"}`}>{pct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {r.status === "completed" ? (
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                passed
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20"
                                  : "bg-red-50 text-red-600 dark:bg-red-900/20"
                              }`}>
                                {passed ? <><CheckCircle size={11} /> O'tdi</> : <><XCircle size={11} /> O'tmadi</>}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                                <PlayCircle size={11} /> Davom etmoqda
                              </span>
                            )}
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

      {/* GROUPS TAB */}
      {activeTab === "groups" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">Ushbu test biriktirilgan guruhlar</p>
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-md shadow-brand-blue/20 active:scale-95"
            >
              <Plus size={16} /> Guruhga biriktirish
            </button>
          </div>

          {assignedGroups.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
              <Users className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500 text-sm mb-4">Bu test hali hech qaysi guruhga biriktirilmagan</p>
              <button
                onClick={() => setShowAssignModal(true)}
                className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                <Plus size={15} /> Guruhga biriktirish
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedGroups.map((g) => (
                <div key={g.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                      <Users size={18} className="text-brand-blue" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{g.group?.name || "Noma'lum guruh"}</p>
                      <p className="text-xs text-slate-400">{new Date(g.assigned_at).toLocaleDateString("uz-UZ")}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveGroup(g.group_id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Assign Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Users size={20} className="text-brand-blue" />
                    Guruhga biriktirish
                  </h3>
                  <button onClick={() => setShowAssignModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Fan tanlang</label>
                    <select
                      value={selectedSubjectForGroup}
                      onChange={e => setSelectedSubjectForGroup(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-slate-800 dark:text-slate-100"
                    >
                      <option value="">— Fan tanlang —</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                  {selectedSubjectForGroup && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Guruh tanlang</label>
                      {groupsForSubject.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-800 rounded-xl">Bu fanda guruhlar yo'q</p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {groupsForSubject.map(g => {
                            const alreadyAssigned = assignedGroups.some(ag => ag.group_id === g.id);
                            return (
                              <button
                                key={g.id}
                                onClick={() => !alreadyAssigned && handleAssignGroup(g.id)}
                                disabled={alreadyAssigned || assigning}
                                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-colors ${
                                  alreadyAssigned
                                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 cursor-default"
                                    : "bg-slate-50 dark:bg-slate-800 hover:bg-brand-blue/5 text-slate-700 dark:text-slate-300 hover:text-brand-blue"
                                }`}
                              >
                                <span className="font-medium">{g.name}</span>
                                {alreadyAssigned ? (
                                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                    <CheckCircle size={13} /> Biriktirilgan
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400">Biriktirish</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-end px-6 py-4 border-t border-gray-100 dark:border-slate-800">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
"""

import os
os.makedirs("src/app/admin/tests/[id]", exist_ok=True)
with open("src/app/admin/tests/[id]/page.tsx", "w") as f:
    f.write(content)
print("Test detail page written!")
