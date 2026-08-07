"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Save,
  Eye,
  CheckCircle2,
  BookOpen,
  FileText,
  Clock,
  HelpCircle
} from "lucide-react";
import { createTest, type Subject, type TestType } from "@/lib/tests";
import { useSubjects } from "@/hooks/useAdminData";
import Link from "next/link";

interface Question {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  options?: Record<string, string>;
  correct_answer: string;
  explanation?: string;
  points: number;
}

type Step = "basic" | "questions" | "preview";

export default function CreateTestPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [saving, setSaving] = useState(false);

  // Basic info state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState<Subject>("math");
  const [testType, setTestType] = useState<TestType>("subject");
  const [difficultyLevel, setDifficultyLevel] = useState<"easy" | "medium" | "hard">("medium");
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Load real subjects from DB
  const { data: dbSubjects = [] } = useSubjects();

  const fallbackSubjects: { value: Subject; label: string }[] = [
    { value: "math", label: "Matematika" },
    { value: "english", label: "Ingliz tili" },
    { value: "physics", label: "Fizika" },
    { value: "chemistry", label: "Kimyo" },
    { value: "biology", label: "Biologiya" },
    { value: "general", label: "Umumiy" },
  ];

  const subjectOptions = dbSubjects.length > 0
    ? dbSubjects.map(s => ({ value: s.title.toLowerCase().replace(/\s+/g, '_') as Subject, label: s.title }))
    : fallbackSubjects;

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question_text: "",
      question_type: "multiple_choice",
      options: { A: "", B: "", C: "", D: "" },
      correct_answer: "",
      explanation: "",
      points: 1,
    };
    setEditingQuestion(newQuestion);
  };

  const saveQuestion = () => {
    if (!editingQuestion) return;
    if (!editingQuestion.question_text.trim()) return toast.error("Savol matnini kiriting!");

    if (questions.find(q => q.id === editingQuestion.id)) {
      setQuestions(questions.map(q => q.id === editingQuestion.id ? editingQuestion : q));
    } else {
      setQuestions([...questions, editingQuestion]);
    }
    setEditingQuestion(null);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSaveTest = async (publish: boolean = false) => {
    if (!title.trim()) {
      toast.error("Test nomini kiriting!");
      setCurrentStep("basic");
      return;
    }
    if (questions.length === 0) {
      toast.error("Kamida bitta savol qo'shing!");
      setCurrentStep("questions");
      return;
    }

    setSaving(true);
    try {
      const result = await createTest({
        title,
        description: description || null,
        subject,
        test_type: testType,
        difficulty_level: difficultyLevel,
        duration_minutes: durationMinutes,
        is_published: publish,
        questions: questions.map((q, idx) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options || null,
          correct_answer: q.correct_answer,
          explanation: q.explanation || null,
          points: q.points,
          order_index: idx + 1,
          image_url: null
        }))
      });

      if (result) {
        toast.success(publish ? "Test yaratildi va nashr qilindi!" : "Test qoralama sifatida saqlandi!");
        router.push("/admin/tests");
      } else {
        toast.error("Test yaratishda xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Save test error:", error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-20">
      {/* Header & Step Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/tests"
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Orqaga"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
              Yangi Test Yaratish
            </h1>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
              Test parametrlari va savollari quruvchisi
            </p>
          </div>
        </div>

        {/* Minimalist Step Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-2xl self-start md:self-auto">
          {[
            { key: "basic", label: "1. Asosiy" },
            { key: "questions", label: `2. Savollar (${questions.length})` },
            { key: "preview", label: "3. Ko'rish" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setCurrentStep(s.key as Step)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentStep === s.key
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: Basic Info */}
      {currentStep === "basic" && (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 space-y-6 max-w-3xl">
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen size={20} className="text-slate-400" />
            <span>Asosiy Ma'lumotlar</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Test Sarlavhasi *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masalan: Matematika DTM 1-Variant"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-bold text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Tavsif / Ko'rsatma
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Test haqida qisqacha ma'lumot..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-medium text-slate-800 dark:text-slate-100 resize-none h-20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Fan *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as Subject)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-bold text-slate-800 dark:text-slate-100"
                >
                  {subjectOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Vaqt (daqiqa)
                </label>
                <input
                  type="number"
                  value={durationMinutes || ""}
                  onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Cheklanmagan bo'lsa bo'sh qoldiring"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-bold text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-end">
            <button
              onClick={() => {
                if (!title.trim()) return toast.error("Test nomini kiriting!");
                setCurrentStep("questions");
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors"
            >
              <span>Keyingisi: Savollar</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Questions Editor */}
      {currentStep === "questions" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <HelpCircle size={20} className="text-slate-400" />
              <span>Savollar Ro'yxati ({questions.length} ta)</span>
            </h2>

            <button
              onClick={addQuestion}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>Yangi Savol Qo'shish</span>
            </button>
          </div>

          {/* Question List */}
          {questions.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-sm font-semibold">Hali savollar qo'shilmadi</p>
              <button
                onClick={addQuestion}
                className="mt-3 px-4 py-2 text-xs font-bold text-brand-blue hover:underline"
              >
                + Birinchi savolni qo'shish
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate block">
                      {idx + 1}. {q.question_text || "Savol matni kiritilmagan"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      To'g'ri javob: {q.correct_answer || "Belgilanmagan"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingQuestion(q)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Question Editor Modal */}
          {editingQuestion && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                  Savolni Tahrirlash
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Savol Matni *</label>
                  <textarea
                    value={editingQuestion.question_text}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none resize-none h-20"
                    placeholder="Savolni kiriting..."
                  />
                </div>

                {/* Options A, B, C, D */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Javob Variantlari</label>
                  {["A", "B", "C", "D"].map((optKey) => (
                    <div key={optKey} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-4">{optKey}:</span>
                      <input
                        type="text"
                        value={editingQuestion.options?.[optKey] || ""}
                        onChange={(e) => setEditingQuestion({
                          ...editingQuestion,
                          options: { ...editingQuestion.options, [optKey]: e.target.value }
                        })}
                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                        placeholder={`Variant ${optKey}`}
                      />
                      <input
                        type="radio"
                        name="correct_opt"
                        checked={editingQuestion.correct_answer === optKey}
                        onChange={() => setEditingQuestion({ ...editingQuestion, correct_answer: optKey })}
                        className="w-4 h-4 text-emerald-500"
                        title="To'g'ri javob qilib belgilash"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={saveQuestion}
                    className="px-4 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-blue-600 rounded-xl"
                  >
                    Saqlash
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/50">
            <button
              onClick={() => setCurrentStep("basic")}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Orqaga
            </button>
            <button
              onClick={() => setCurrentStep("preview")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors"
            >
              <span>Keyingisi: Ko'rish & Saqlash</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Preview & Save */}
      {currentStep === "preview" && (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 space-y-6 max-w-3xl">
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <span>Testni Yakunlash</span>
          </h2>

          <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{title || "Sarlavhasiz Test"}</p>
            <p className="text-xs text-slate-500">{description || "Tavsif berilmagan"}</p>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 pt-2">
              <span>Fan: {subject}</span>
              <span>Savollar: {questions.length} ta</span>
              <span>Vaqt: {durationMinutes ? `${durationMinutes} daqiqa` : "Cheksiz"}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/50">
            <button
              onClick={() => handleSaveTest(false)}
              disabled={saving}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl disabled:opacity-50"
            >
              Qoralama Sifatida Saqlash
            </button>
            <button
              onClick={() => handleSaveTest(true)}
              disabled={saving}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl disabled:opacity-50"
            >
              {saving ? "Saqlanmoqda..." : "Nashr Qilish & Saqlash"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
