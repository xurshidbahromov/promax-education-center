"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  BookOpen,
  Clock,
  HelpCircle,
  X,
  Lock,
  Image as ImageIcon,
  UploadCloud,
  Loader2,
  Calculator,
  Trophy,
  Award,
  Globe
} from "lucide-react";
import MathRenderer from "@/components/MathRenderer";
import { InlineMathPanel } from "@/components/MathToolbar";
import { useLanguage } from "@/context/LanguageContext";
import {
  InternationalTournament,
  InternationalQuestion,
  saveInternationalTournament
} from "@/lib/international-tournaments";
import { uploadQuestionImage } from "@/lib/tests";

type Step = "basic" | "questions" | "preview";

const CATEGORY_OPTIONS: { value: InternationalTournament["category"]; label: string; defaultScale: string; defaultSubject: string }[] = [
  { value: "sat", label: "Digital SAT 1600 (Math & Reading)", defaultScale: "1600 Ballik SAT Shkalasi", defaultSubject: "SAT Math & Reading" },
  { value: "amc", label: "American Mathematics Competitions (AMC 10/12)", defaultScale: "150 Ballik AMC Shkalasi", defaultSubject: "AMC Mathematics" },
  { value: "ielts", label: "IELTS Arena (Band 9.0)", defaultScale: "9.0 IELTS Band Shkalasi", defaultSubject: "IELTS English" },
  { value: "stem", label: "STEM & Science Arena", defaultScale: "100 Ballik Shkala", defaultSubject: "STEM Science" },
  { value: "general", label: "Umumiy Xalqaro Musobaqa", defaultScale: "100 Ballik Shkala", defaultSubject: "Xalqaro Fan" },
];

export default function CreateInternationalTournamentPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [saving, setSaving] = useState(false);

  // ── STEP 1: BASIC INFO ──
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<InternationalTournament["category"]>("sat");
  const [categoryLabel, setCategoryLabel] = useState("SAT Digital");
  const [subject, setSubject] = useState("SAT Math & Reading");
  const [scoringScale, setScoringScale] = useState("1600 Ballik SAT Shkalasi");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("15:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("18:00");
  const [durationMinutes, setDurationMinutes] = useState<number | null>(70);
  const [entryCoins, setEntryCoins] = useState(0);
  const [prizePool, setPrizePool] = useState("");
  const [topPrizesText, setTopPrizesText] = useState("");
  const [rulesText, setRulesText] = useState("");
  const [status, setStatus] = useState<"upcoming" | "live" | "finished">("upcoming");

  // ── STEP 2: QUESTIONS BUILDER ──
  const [questions, setQuestions] = useState<InternationalQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<InternationalQuestion | null>(null);
  const [activeMathField, setActiveMathField] = useState<'question' | 'A' | 'B' | 'C' | 'D' | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  const handleCategoryChange = (newCat: InternationalTournament["category"]) => {
    setCategory(newCat);
    const catObj = CATEGORY_OPTIONS.find(c => c.value === newCat);
    if (catObj) {
      setCategoryLabel(newCat === 'sat' ? 'SAT Digital' : newCat === 'amc' ? 'AMC Math' : newCat === 'ielts' ? 'IELTS Arena' : 'Xalqaro');
      setScoringScale(catObj.defaultScale);
      setSubject(catObj.defaultSubject);
    }
  };

  // Validation functions
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
        toast.error("Avval 1-bosqichda musobaqa nomini kiriting!");
        return;
      }
      setCurrentStep("questions");
      return;
    }
    if (targetStep === "preview") {
      if (!canGoToQuestions()) {
        toast.error("Avval 1-bosqichda musobaqa nomini kiriting!");
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

  const addQuestion = (type: InternationalQuestion["question_type"] = "multiple_choice") => {
    const newQuestion: InternationalQuestion = {
      id: `iq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      question_text: "",
      question_type: type,
      options: type === "multiple_choice" ? { A: "", B: "", C: "", D: "" } : undefined,
      correct_answer: type === "multiple_choice" ? "A" : "",
      accepted_answers: [],
      explanation: "",
      points: 1,
      image_url: null,
      category: category === "sat" ? "sat_math" : category === "amc" ? "amc_math" : "general"
    };
    setEditingQuestion(newQuestion);
  };

  const saveQuestion = () => {
    if (!editingQuestion) return;
    if (!editingQuestion.question_text.trim()) return toast.error("Savol matnini kiriting!");
    if (!editingQuestion.correct_answer.trim()) return toast.error("To'g'ri javobni kiriting!");

    if (questions.find((q) => q.id === editingQuestion.id)) {
      setQuestions(questions.map((q) => (q.id === editingQuestion.id ? editingQuestion : q)));
    } else {
      setQuestions([...questions, editingQuestion]);
    }
    setEditingQuestion(null);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSaveTournament = async (publish: boolean = false) => {
    if (!title.trim()) {
      toast.error("Musobaqa nomini kiriting!");
      setCurrentStep("basic");
      return;
    }
    if (questions.length === 0) {
      toast.error("Kamida bitta savol qo'shing!");
      setCurrentStep("questions");
      return;
    }

    setSaving(true);

    const topPrizes = topPrizesText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const rules = rulesText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const finalStatus = publish ? "live" : status;

    const payload: Partial<InternationalTournament> = {
      id: `intl_${Date.now()}`,
      title: title.trim(),
      category,
      categoryLabel,
      subject,
      description: description.trim(),
      startDate: startDate.trim() || new Date().toISOString().split("T")[0],
      startTime: startTime.trim(),
      endDate: endDate.trim() || startDate.trim(),
      endTime: endTime.trim(),
      durationMinutes: Number(durationMinutes) || 60,
      totalQuestions: questions.length,
      entryCoins: Number(entryCoins) || 0,
      prizePool: prizePool.trim() || "Xalqaro Mukofotlar",
      scoringScale: scoringScale.trim(),
      topPrizes: topPrizes.length > 0 ? topPrizes : ["Top o'rinlar uchun grantlar"],
      rules: rules.length > 0 ? rules : ["Xalqaro musobaqa qoidalariga rioya qiling."],
      status: finalStatus,
      participantsCount: 0,
      questions
    };

    try {
      await saveInternationalTournament(payload);
      toast.success(
        publish
          ? "Xalqaro musobaqa yaratildi va Jonli (Faol) qilindi!"
          : "Xalqaro musobaqa qoralama sifatida saqlandi!"
      );
      router.push("/admin/international");
    } catch (error) {
      console.error("Save international tournament error:", error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 pb-20">
      
      {/* ── HEADER (1:1 with /admin/tournaments/create) ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/international"
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Orqaga"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
              Yangi Xalqaro Musobaqa Yaratish
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
              Digital SAT (1600), AMC Matematika, IELTS va yopiq (grid-in) savollar konstruktori
            </p>
          </div>
        </div>

        {/* Sequential Step Navigation Bar (1:1 with /admin/tournaments/create) */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl self-start md:self-auto">
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
            {!canGoToQuestions() ? (
              <Lock size={12} className="text-slate-400" />
            ) : questions.length > 0 ? (
              <CheckCircle2 size={14} className="text-emerald-500" />
            ) : null}
            <span>2. Savollar ({questions.length})</span>
          </button>

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

      {/* Main Form Container (Uniform Max-Width & Card Box Scale 1:1) */}
      <div className="max-w-4xl mx-auto">
        
        {/* STEP 1: Basic Info (1:1 with /admin/tournaments/create) */}
        {currentStep === "basic" && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Globe size={22} className="text-brand-blue" />
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                    1-Bosqich: Xalqaro Musobaqa Ma'lumotlari
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Musobaqa nomi, formati, baholash shkalasi va parametrlarini kiriting
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                1 / 3 Bosqich
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Musobaqa Sarlavhasi *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: Digital SAT Grand League (Math & EBRW 1600)"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Tavsif / Yo'riqnoma
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Xalqaro musobaqa haqida qisqacha ma'lumot yoki yo'riqnoma..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 resize-none h-24"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Xalqaro Format *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Baholash Shkalasi
                  </label>
                  <input
                    type="text"
                    value={scoringScale}
                    onChange={(e) => setScoringScale(e.target.value)}
                    placeholder="Masalan: 1600 SAT Shkalasi"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Vaqt Chegarasi (daqiqa)
                  </label>
                  <input
                    type="number"
                    value={durationMinutes || ""}
                    onChange={(e) =>
                      setDurationMinutes(e.target.value ? parseInt(e.target.value) : null)
                    }
                    placeholder="Masalan: 70"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Start/End Date, Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Boshlanish Sanasi
                  </label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Masalan: 2026-08-25"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Boshlanish Vaqti
                  </label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="Masalan: 15:00"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Tugash Sanasi
                  </label>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="Masalan: 2026-08-28"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Tugash Vaqti
                  </label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="Masalan: 23:59"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Mukofot Jamg'armasi
                </label>
                <input
                  type="text"
                  value={prizePool}
                  onChange={(e) => setPrizePool(e.target.value)}
                  placeholder="Masalan: 2,000,000 SO'M + Ivy League SAT Kursi"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Top Prizes & Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    G'oliblar Sovg'alari (har qatorda bittadan)
                  </label>
                  <textarea
                    value={topPrizesText}
                    onChange={(e) => setTopPrizesText(e.target.value)}
                    placeholder="1-O'rin: 1,000,000 So'm + Sertifikat&#10;2-O'rin: 500,000 So'm&#10;3-O'rin: 300,000 So'm"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-medium text-slate-800 dark:text-slate-100 resize-none h-20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Nizomnoma Qoidalari (har qatorda bittadan)
                  </label>
                  <textarea
                    value={rulesText}
                    onChange={(e) => setRulesText(e.target.value)}
                    placeholder="Multiple choice va Grid-In yopiq savollar mavjud.&#10;Vaqt to'xtatilmaydi."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs font-medium text-slate-800 dark:text-slate-100 resize-none h-20 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Sequential Step Footer Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Davom etish uchun musobaqa nomini to'ldiring
              </span>
              <button
                onClick={() => {
                  if (!canGoToQuestions()) return toast.error("Musobaqa nomini kiriting!");
                  setCurrentStep("questions");
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-600 transition-colors shadow-md shadow-brand-blue/10 cursor-pointer"
              >
                <span>2-Bosqich: Savollar</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Questions Editor (1:1 with /admin/tournaments/create) */}
        {currentStep === "questions" && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <HelpCircle size={22} className="text-brand-blue" />
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                    2-Bosqich: Savollar Ro'yxati ({questions.length} ta)
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Multiple Choice yoki SAT Grid-In (yopiq javobli) savollar qo'shing
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => addQuestion("multiple_choice")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
                >
                  <Plus size={14} />
                  <span>+ Variantli Savol</span>
                </button>
                <button
                  onClick={() => addQuestion("grid_in")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                >
                  <Plus size={14} />
                  <span>+ Yopiq (Grid-In)</span>
                </button>
              </div>
            </div>

            {/* Questions List */}
            {questions.length === 0 ? (
              <div className="py-16 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                <HelpCircle size={32} className="mx-auto mb-1 opacity-40 text-slate-400" />
                <p className="text-sm font-semibold">Hali savollar qo'shilmadi</p>
                <button
                  onClick={() => addQuestion("multiple_choice")}
                  className="mt-2 px-4 py-2 text-xs font-bold text-brand-blue hover:underline cursor-pointer"
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
                          <img
                            src={q.image_url}
                            alt="Savol rasmi"
                            className="h-16 w-auto rounded-lg border border-slate-200 dark:border-slate-700 object-contain"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-xs font-bold">
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px]">
                          {q.question_type === "grid_in" ? "🔢 Grid-In (Yopiq)" : "🔘 4-Variantli"}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          To'g'ri javob: {q.correct_answer || "Belgilanmagan"}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{q.points} ball</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setEditingQuestion(q)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
              <button
                onClick={() => setCurrentStep("basic")}
                className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                ← 1-Bosqichga Qaytish
              </button>
              <button
                onClick={() => {
                  if (!canGoToPreview()) return toast.error("Kamida 1 ta savol qo'shing!");
                  setCurrentStep("preview");
                }}
                disabled={questions.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-md shadow-brand-blue/10 cursor-pointer"
              >
                <span>3-Bosqich: Tasdiqlash</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Question Editor Modal (1:1 with /admin/tournaments/create) */}
            {editingQuestion && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                        {editingQuestion.question_type === "grid_in" ? "Yopiq (Grid-In) Savol" : "Variantli Savol"}
                      </h3>
                    </div>
                    <button
                      onClick={() => setEditingQuestion(null)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-3.5 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          Savol Matni *
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMathField(activeMathField === "question" ? null : "question")
                          }
                          className={`px-2.5 py-1 rounded-lg font-black text-[11px] transition-all flex items-center gap-1 border cursor-pointer ${
                            activeMathField === "question"
                              ? "bg-brand-blue text-white border-brand-blue shadow-sm"
                              : "bg-brand-blue/10 hover:bg-brand-blue hover:text-white text-brand-blue dark:text-blue-300 border-brand-blue/20"
                          }`}
                        >
                          <Calculator size={13} />
                          <span>Formula ∑</span>
                        </button>
                      </div>
                      <textarea
                        value={editingQuestion.question_text}
                        onChange={(e) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            question_text: e.target.value
                          })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium outline-none resize-none h-24"
                        placeholder="Savol matnini kiriting (masalan: $x^2 + y^2 = z^2$)..."
                      />

                      {/* Inline Expandable Formula Panel for Question */}
                      <InlineMathPanel
                        isOpen={activeMathField === "question"}
                        onClose={() => setActiveMathField(null)}
                        title="Savol uchun formulalar"
                        onInsert={(formulaText) => {
                          const current = editingQuestion.question_text || "";
                          setEditingQuestion({
                            ...editingQuestion,
                            question_text: current ? `${current} ${formulaText}` : formulaText
                          });
                        }}
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
                            onClick={() =>
                              setEditingQuestion({ ...editingQuestion, image_url: null })
                            }
                            className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                          >
                            Rasmni o'chirish
                          </button>
                        )}
                      </div>

                      {editingQuestion.image_url ? (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 group max-h-48 flex items-center justify-center">
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

                    {/* Options A, B, C, D (if Multiple Choice) */}
                    {editingQuestion.question_type === "multiple_choice" && (
                      <div className="space-y-2.5">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          Javob Variantlari
                        </label>
                        {(["A", "B", "C", "D"] as const).map((optKey) => {
                          const optVal = editingQuestion.options?.[optKey] || "";
                          return (
                            <div key={optKey} className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 w-5 text-center">
                                  {optKey}:
                                </span>
                                <input
                                  type="text"
                                  value={optVal}
                                  onChange={(e) =>
                                    setEditingQuestion({
                                      ...editingQuestion,
                                      options: {
                                        ...(editingQuestion.options || { A: "", B: "", C: "", D: "" }),
                                        [optKey]: e.target.value
                                      }
                                    })
                                  }
                                  placeholder={`Variant ${optKey}...`}
                                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium outline-none focus:border-brand-blue"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveMathField(activeMathField === optKey ? null : optKey)
                                  }
                                  className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-colors shrink-0 cursor-pointer ${
                                    activeMathField === optKey
                                      ? "bg-brand-blue text-white border-brand-blue"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                                  }`}
                                  title={`Variant ${optKey} uchun formula`}
                                >
                                  ∑
                                </button>
                              </div>

                              <InlineMathPanel
                                isOpen={activeMathField === optKey}
                                onClose={() => setActiveMathField(null)}
                                title={`Variant ${optKey} uchun formulalar`}
                                onInsert={(formulaText) => {
                                  const cur = editingQuestion.options?.[optKey] || "";
                                  setEditingQuestion({
                                    ...editingQuestion,
                                    options: {
                                      ...(editingQuestion.options || { A: "", B: "", C: "", D: "" }),
                                      [optKey]: cur ? `${cur} ${formulaText}` : formulaText
                                    }
                                  });
                                }}
                              />
                            </div>
                          );
                        })}

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1 mt-2">
                            To'g'ri Javob *
                          </label>
                          <select
                            value={editingQuestion.correct_answer}
                            onChange={(e) =>
                              setEditingQuestion({
                                ...editingQuestion,
                                correct_answer: e.target.value
                              })
                            }
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-emerald-600 outline-none"
                          >
                            <option value="A">A varianti</option>
                            <option value="B">B varianti</option>
                            <option value="C">C varianti</option>
                            <option value="D">D varianti</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Grid-In Closed Answer Fields (if Grid-In) */}
                    {editingQuestion.question_type === "grid_in" && (
                      <div className="space-y-3 p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl">
                        <div>
                          <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-1">
                            To'g'ri Javob (Aniq son yoki kasr) *
                          </label>
                          <input
                            type="text"
                            value={editingQuestion.correct_answer}
                            onChange={(e) =>
                              setEditingQuestion({
                                ...editingQuestion,
                                correct_answer: e.target.value
                              })
                            }
                            placeholder="Masalan: 24 yoki 3/4"
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-xl text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                            Muqobil qabul qilinadigan javoblar (Vergul bilan ajrating)
                          </label>
                          <input
                            type="text"
                            value={(editingQuestion.accepted_answers || []).join(", ")}
                            onChange={(e) =>
                              setEditingQuestion({
                                ...editingQuestion,
                                accepted_answers: e.target.value.split(/[,;\n]/).map(s => s.trim()).filter(Boolean)
                              })
                            }
                            placeholder="Masalan: 3/4, 0.75, .75"
                            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Yechim / Tushuntirish
                      </label>
                      <textarea
                        value={editingQuestion.explanation || ""}
                        onChange={(e) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            explanation: e.target.value
                          })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium outline-none resize-none h-16"
                        placeholder="Savol qoidasi yoki to'liq yechimi..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingQuestion(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Bekor qilish
                    </button>
                    <button
                      type="button"
                      onClick={saveQuestion}
                      className="px-5 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
                    >
                      Savolni Saqlash
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Preview & Confirm (1:1 with /admin/tournaments/create) */}
        {currentStep === "preview" && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={22} className="text-emerald-500" />
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                    3-Bosqich: Ko'rib Chiqish & Tasdiqlash
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Musobaqa ma'lumotlarini tekshiring va nashr qiling
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
                3 / 3 Bosqich
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold">
                      {categoryLabel} • {scoringScale}
                    </span>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">
                      {title}
                    </h3>
                  </div>
                  {prizePool && (
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200/60 shrink-0">
                      {prizePool}
                    </span>
                  )}
                </div>

                {description && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 pt-1">
                  <span>Fan: {subject}</span>
                  <span>•</span>
                  <span>Vaqt: {durationMinutes ? `${durationMinutes} daqiqa` : "Cheklanmagan"}</span>
                  <span>•</span>
                  <span>Savollar: {questions.length} ta</span>
                </div>
              </div>

              {/* Questions Quick List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Kiritilgan Savollar ({questions.length} ta):
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 truncate max-w-md">
                        <span className="font-bold text-slate-400">{idx + 1}.</span>
                        <span className="truncate">{q.question_text}</span>
                      </div>
                      <span className="font-bold text-emerald-600 shrink-0 ml-2">
                        To'g'ri javob: {q.correct_answer}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep("questions")}
                className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                ← 2-Bosqichga Qaytish
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSaveTournament(false)}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  {saving ? "Saqlanmoqda..." : "Qoralama sifatida saqlash"}
                </button>

                <button
                  onClick={() => handleSaveTournament(true)}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                >
                  <CheckCircle2 size={16} />
                  <span>{saving ? "Saqlanmoqda..." : "Jonli (Faol) qilish"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
