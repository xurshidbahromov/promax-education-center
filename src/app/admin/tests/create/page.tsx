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
  CheckCircle2,
  BookOpen,
  FileText,
  Clock,
  HelpCircle,
  X,
  Lock,
  Edit3,
  Image as ImageIcon,
  UploadCloud,
  Loader2
} from "lucide-react";
import MathRenderer from "@/components/MathRenderer";
import MathToolbar from "@/components/MathToolbar";
import { createTest, uploadQuestionImage, type Subject, type TestType } from "@/lib/tests";
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
  image_url?: string | null;
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
  const [mathTargetField, setMathTargetField] = useState<'question' | 'A' | 'B' | 'C' | 'D'>('question');
  const [uploadingImg, setUploadingImg] = useState(false);

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

  // Validation functions for sequential progression
  const canGoToQuestions = () => {
    return title.trim().length > 0;
  };

  const canGoToPreview = () => {
    return canGoToQuestions() && questions.length > 0;
  };

  const handleStepClick = (targetStep: Step) => {
    if (targetStep === "basic") {
      setCurrentStep("basic");
      return;
    }
    if (targetStep === "questions") {
      if (!canGoToQuestions()) {
        toast.error("Avval 1-bosqichda test nomini kiriting!");
        return;
      }
      setCurrentStep("questions");
      return;
    }
    if (targetStep === "preview") {
      if (!canGoToQuestions()) {
        toast.error("Avval 1-bosqichda test nomini kiriting!");
        return;
      }
      if (questions.length === 0) {
        toast.error("Avval 2-bosqichda kamida 1 ta savol qo'shing!");
        return;
      }
      setCurrentStep("preview");
      return;
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question_text: "",
      question_type: "multiple_choice",
      options: { A: "", B: "", C: "", D: "" },
      correct_answer: "A",
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
          image_url: q.image_url || null
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
      {/* Page Header */}
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
            <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
              Bosqichma-bosqich test parametrlari va savollar quruvchisi
            </p>
          </div>
        </div>

        {/* Sequential Step Navigation Bar */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl self-start md:self-auto">
          {/* Step 1 */}
          <button
            onClick={() => handleStepClick("basic")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentStep === "basic"
                ? "bg-white dark:bg-slate-900 text-brand-blue shadow-sm"
                : canGoToQuestions()
                ? "text-emerald-600 dark:text-emerald-400 hover:text-slate-800"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {canGoToQuestions() ? <CheckCircle2 size={14} className="text-emerald-500" /> : null}
            <span>1. Asosiy</span>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => handleStepClick("questions")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentStep === "questions"
                ? "bg-white dark:bg-slate-900 text-brand-blue shadow-sm"
                : canGoToPreview()
                ? "text-emerald-600 dark:text-emerald-400 hover:text-slate-800"
                : !canGoToQuestions()
                ? "text-slate-400 opacity-60 cursor-not-allowed"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {!canGoToQuestions() ? <Lock size={12} className="text-slate-400" /> : questions.length > 0 ? <CheckCircle2 size={14} className="text-emerald-500" /> : null}
            <span>2. Savollar ({questions.length})</span>
          </button>

          {/* Step 3 */}
          <button
            onClick={() => handleStepClick("preview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentStep === "preview"
                ? "bg-white dark:bg-slate-900 text-brand-blue shadow-sm"
                : !canGoToPreview()
                ? "text-slate-400 opacity-60 cursor-not-allowed"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {!canGoToPreview() ? <Lock size={12} className="text-slate-400" /> : null}
            <span>3. Ko'rish & Saqlash</span>
          </button>
        </div>
      </div>

      {/* Main Form Container (Uniform Max-Width & Card Box Scale) */}
      <div className="max-w-4xl mx-auto">
        {/* STEP 1: Basic Info */}
        {currentStep === "basic" && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <BookOpen size={22} className="text-brand-blue" />
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                    1-Bosqich: Asosiy Ma'lumotlar
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Test nomi va imtihon parametrlarini kiriting</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                1 / 3 Bosqich
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Test Sarlavhasi *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: Matematika DTM 1-Variant 2025"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Tavsif / Ko'rsatma
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Test yo'riqnomasi yoki qisqacha ma'lumot..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 resize-none h-24"
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
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100"
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
                    Vaqt Chegarasi (daqiqa)
                  </label>
                  <input
                    type="number"
                    value={durationMinutes || ""}
                    onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Cheklanmagan bo'lsa bo'sh qoldiring"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Sequential Step Footer Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Davom etish uchun test nomini to'ldiring</span>
              <button
                onClick={() => {
                  if (!canGoToQuestions()) return toast.error("Test nomini kiriting!");
                  setCurrentStep("questions");
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-600 transition-colors shadow-md shadow-brand-blue/10"
              >
                <span>2-Bosqich: Savollar</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Questions Editor */}
        {currentStep === "questions" && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <HelpCircle size={22} className="text-brand-blue" />
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                    2-Bosqich: Savollar Ro'yxati ({questions.length} ta)
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Test savollari va javob variantlarini qo'shing</p>
                </div>
              </div>

              <button
                onClick={addQuestion}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-600 transition-colors shadow-sm"
              >
                <Plus size={16} />
                <span>Yangi Savol Qo'shish</span>
              </button>
            </div>

            {/* Questions List */}
            {questions.length === 0 ? (
              <div className="py-16 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                <HelpCircle size={32} className="mx-auto mb-1 opacity-40 text-slate-400" />
                <p className="text-sm font-semibold">Hali savollar qo'shilmadi</p>
                <button
                  onClick={addQuestion}
                  className="mt-2 px-4 py-2 text-xs font-bold text-brand-blue hover:underline"
                >
                  + Birinchi savolni qo'shish
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                        <span className="mr-1.5">{idx + 1}.</span>
                        <MathRenderer content={q.question_text || "Savol matni kiritilmagan"} />
                      </div>
                      {q.image_url && (
                        <div className="mt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={q.image_url} alt="Savol rasmi" className="h-16 w-auto rounded-lg border border-slate-200 dark:border-slate-700 object-contain" />
                        </div>
                      )}
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 inline-block">
                        To'g'ri javob: {q.correct_answer || "Belgilanmagan"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setEditingQuestion(q)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sequential Step Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
              <button
                onClick={() => setCurrentStep("basic")}
                className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ← 1-Bosqichga Qaytish
              </button>
              <button
                onClick={() => {
                  if (!canGoToPreview()) return toast.error("Kamida 1 ta savol qo'shing!");
                  setCurrentStep("preview");
                }}
                disabled={questions.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-md shadow-brand-blue/10"
              >
                <span>3-Bosqich: Tasdiqlash</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Question Editor Modal */}
            {editingQuestion && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                      Savolni Tahrirlash
                    </h3>
                    <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-slate-700">
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-3.5 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
                    {/* Math Target Selector Bar */}
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                      <span>Formulani qaysi maydonga kiritasiz?</span>
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        {[
                          { id: 'question', label: 'Savol' },
                          { id: 'A', label: 'A' },
                          { id: 'B', label: 'B' },
                          { id: 'C', label: 'C' },
                          { id: 'D', label: 'D' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setMathTargetField(item.id as any)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all ${
                              mathTargetField === item.id
                                ? 'bg-brand-blue text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Math & Formula Insertion Toolbar */}
                    <MathToolbar
                      currentValue={
                        mathTargetField === 'question'
                          ? editingQuestion.question_text
                          : editingQuestion.options?.[mathTargetField] || ''
                      }
                      onInsert={(formulaText) => {
                        if (mathTargetField === 'question') {
                          setEditingQuestion({
                            ...editingQuestion,
                            question_text: editingQuestion.question_text
                              ? `${editingQuestion.question_text} ${formulaText}`
                              : formulaText
                          });
                        } else {
                          const prevVal = editingQuestion.options?.[mathTargetField] || '';
                          setEditingQuestion({
                            ...editingQuestion,
                            options: {
                              ...editingQuestion.options,
                              [mathTargetField]: prevVal ? `${prevVal} ${formulaText}` : formulaText
                            }
                          });
                        }
                      }}
                    />

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">Savol Matni *</label>
                      <textarea
                        value={editingQuestion.question_text}
                        onFocus={() => setMathTargetField('question')}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium outline-none resize-none h-24"
                        placeholder="Savol matnini kiriting (masalan: $x^2 + y^2 = z^2$)..."
                      />
                      {editingQuestion.question_text && (
                        <div className="mt-2 p-3 bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/20 rounded-xl space-y-1">
                          <span className="text-[10px] uppercase font-bold text-brand-blue tracking-wider block">
                            Savol Matni Ko'rinishi (Formula Live Preview):
                          </span>
                          <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                            <MathRenderer content={editingQuestion.question_text} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Question Image Upload Section */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon size={14} className="text-brand-blue" />
                          Savol Rasmi (Ixtiyoriy)
                        </label>
                        {editingQuestion.image_url && (
                          <button
                            type="button"
                            onClick={() => setEditingQuestion({ ...editingQuestion, image_url: null })}
                            className="text-[11px] font-bold text-red-500 hover:underline"
                          >
                            Rasmni o'chirish
                          </button>
                        )}
                      </div>

                      {editingQuestion.image_url ? (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 group max-h-48 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={editingQuestion.image_url}
                            alt="Savol rasmi"
                            className="max-h-44 w-auto rounded-xl object-contain shadow-sm"
                          />
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors text-center">
                          {uploadingImg ? (
                            <div className="flex items-center gap-2 text-xs font-bold text-brand-blue py-1.5">
                              <Loader2 size={16} className="animate-spin" />
                              <span>Rasm yuklanmoqda...</span>
                            </div>
                          ) : (
                            <>
                              <UploadCloud size={22} className="text-brand-blue mb-1" />
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                Savol uchun rasm yuklang
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                                PNG, JPG, WEBP (Maks: 5MB)
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingImg}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingImg(true);
                              const url = await uploadQuestionImage(file);
                              setUploadingImg(false);
                              if (url) {
                                setEditingQuestion({ ...editingQuestion, image_url: url });
                                toast.success("Rasm yuklandi!");
                              } else {
                                toast.error("Rasm yuklashda xatolik yuz berdi");
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Options A, B, C, D */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Javob Variantlari</label>
                      {["A", "B", "C", "D"].map((optKey) => {
                        const optVal = editingQuestion.options?.[optKey] || "";
                        return (
                          <div key={optKey} className="space-y-1">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-bold text-slate-400 w-5 text-center">{optKey}:</span>
                              <input
                                type="text"
                                value={optVal}
                                onFocus={() => setMathTargetField(optKey as any)}
                                onChange={(e) => setEditingQuestion({
                                  ...editingQuestion,
                                  options: { ...editingQuestion.options, [optKey]: e.target.value }
                                })}
                                className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium outline-none"
                                placeholder={`Variant ${optKey}`}
                              />
                              <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name="correct_opt"
                                  checked={editingQuestion.correct_answer === optKey}
                                  onChange={() => setEditingQuestion({ ...editingQuestion, correct_answer: optKey })}
                                  className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="text-[11px] font-bold text-slate-500">To'g'ri</span>
                              </label>
                            </div>
                            {/* Live Option Formula Preview */}
                            {optVal && (optVal.includes('$') || optVal.includes('\\') || optVal.includes('^') || optVal.includes('_')) && (
                              <div className="ml-7 text-xs font-semibold text-slate-500 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 px-3 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                                <span className="text-[10px] text-brand-blue uppercase font-bold">Ko'rinishi:</span>
                                <MathRenderer content={optVal} inline />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setEditingQuestion(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Bekor qilish
                    </button>
                    <button
                      onClick={saveQuestion}
                      className="px-4 py-2.5 text-xs font-bold text-white bg-brand-blue hover:bg-blue-600 rounded-xl"
                    >
                      Saqlash
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Preview & Save */}
        {currentStep === "preview" && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={22} className="text-emerald-500" />
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                    3-Bosqich: Testni Yakunlash & Nashr Qilish
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Ma'lumotlarni ko'rib chiqing va saqlang</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
                Tayyor
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-3">
              <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">{title || "Sarlavhasiz Test"}</p>
              <p className="text-xs text-slate-500 font-medium">{description || "Tavsif berilmagan"}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                <span>Fan: {subject}</span>
                <span>Savollar: {questions.length} ta</span>
                <span>Vaqt: {durationMinutes ? `${durationMinutes} daqiqa` : "Cheksiz"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
              <button
                onClick={() => setCurrentStep("questions")}
                className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                ← 2-Bosqichga Qaytish
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSaveTest(false)}
                  disabled={saving}
                  className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl disabled:opacity-50"
                >
                  Qoralama Sifatida Saqlash
                </button>
                <button
                  onClick={() => handleSaveTest(true)}
                  disabled={saving}
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl disabled:opacity-50 shadow-md shadow-emerald-500/10"
                >
                  {saving ? "Saqlanmoqda..." : "Nashr Qilish & Saqlash"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
