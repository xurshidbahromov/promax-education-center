"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";
import {
 ArrowLeft,
 Plus,
 Trash2,
 Save,
 CheckCircle,
 AlertCircle,
 Image as ImageIcon,
 UploadCloud,
 Loader2,
 Calculator
} from "lucide-react";
import { getTestById, updateTest, uploadQuestionImage, type Subject, type TestType, type Question } from "@/lib/tests";
import MathRenderer from "@/components/MathRenderer";
import { InlineMathPanel } from "@/components/MathToolbar";

// Extend Question type to optionally include ID for UI state
interface UIQuestion extends Omit<Question, 'test_id'> {
 id: string; // We always need a UI ID (temp or real)
 isNew?: boolean; // Flag to track if it's a new question locally
}

type Step = "basic" | "questions" | "preview";

export default function EditTestPage() {
 const router = useRouter();
 const params = useParams();
 const { t } = useLanguage();

 const [currentStep, setCurrentStep] = useState<Step>("basic");
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);

 // Basic info state
 const [title, setTitle] = useState("");
 const [description, setDescription] = useState("");
 const [subject, setSubject] = useState<Subject>("math");
 const [testType, setTestType] = useState<TestType>("subject");
 const [difficultyLevel, setDifficultyLevel] = useState<"easy" | "medium" | "hard">("medium");
 const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
 const [isPublished, setIsPublished] = useState(false);

 useEffect(() => {
 if (params.id) {
 fetchTest(params.id as string);
 }
 }, [params.id]);

 const fetchTest = async (id: string) => {
 try {
 // Need to fetch test AND questions.
 // getTestById currently fetches test but we need questions too. 
 // Wait, getTestById description said "Get test by ID with all questions" but looking at code it did .select('*'), it might NOT join questions unless specified or I missed it in my read. 
 // Checking tests.ts again... getTestById just did select('*').single(). It usually doesn't fetch relations unless queried. 
 // If getTestById doesn't return questions, I need to fetch them separately.

 // Let's assume for now I need to fetch questions explicitly if getTestById is simple.
 // Actually, let's use the supabase client here directly if needed, or rely on getTestById to change.
 // Ideally I should have checked getTestById output. 
 // BUT, I can see getTestById in tests.ts just selects from 'tests'.
 // So I will create a small local fetcher or use what I have.

 // Let's rely on `getTestById` for the test wrapper, and I might need to fetch questions. 
 // Wait, looking at `tests.ts` again via memory... 
 // Yes, line 184: .from('tests').select('*')...
 // So it does NOT fetch questions.

 // I'll fetch the test, then fetch questions.
 const test = await getTestById(id);

 if (test) {
 setTitle(test.title);
 setDescription(test.description || "");
 setSubject(test.subject);
 setTestType(test.test_type);
 setDifficultyLevel(test.difficulty_level);
 setDurationMinutes(test.duration_minutes);
 setIsPublished(test.is_published);

 // Now fetch questions
 // I need a way to get questions for a test. I can import createClient here or use a helper. 
 // There isn't a "getQuestionsByTestId" public helper exported in tests.ts I think?
 // Wait, `getAttemptResults` fetches questions via responses. 
 // I should probably export a `getTestQuestions` from tests.ts or just do it here.
 // For speed, I'll do it here by importing createClient from utils.
 }
 } catch (error) {
 console.error("Error fetching test:", error);
 }
 // I'll implement the actual fetch inside.
 };

 // ... we need to fetch questions properly. 
 // Since I can't easily change the import during write_to_file without context, I will include the supabase client creation here.

 // ... Refactored fetch logic below ...
 return <EditTestContent id={params.id as string} />
}

import { createClient } from "@/utils/supabase/client";

function EditTestContent({ id }: { id: string }) {
 const router = useRouter();
 const { t } = useLanguage();
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [currentStep, setCurrentStep] = useState<Step>("basic");

 // Form Stats
 const [title, setTitle] = useState("");
 const [description, setDescription] = useState("");
 const [subject, setSubject] = useState<Subject>("math");
 const [testType, setTestType] = useState<TestType>("subject");
 const [difficultyLevel, setDifficultyLevel] = useState<"easy" | "medium" | "hard">("medium");
 const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
 const [isPublished, setIsPublished] = useState(false);

 const [questions, setQuestions] = useState<UIQuestion[]>([]);
 const [editingQuestion, setEditingQuestion] = useState<UIQuestion | null>(null);
 const [activeMathField, setActiveMathField] = useState<'question' | 'A' | 'B' | 'C' | 'D' | null>(null);
 const [uploadingImg, setUploadingImg] = useState(false);

 const subjects: { value: Subject; label: string }[] = [
 { value: "math", label: "Matematika" },
 { value: "english", label: "Ingliz tili" },
 { value: "physics", label: "Fizika" },
 { value: "chemistry", label: "Kimyo" },
 { value: "biology", label: "Biologiya" },
 ];

 const testTypes: { value: TestType; label: string }[] = [
 { value: "subject", label: "Fan Testi" },
 { value: "practice", label: "Mashq" },
 { value: "progress", label: "Baholash" },
 { value: "mock", label: "Namunaviy Imtihon" },
 ];

 useEffect(() => {
 async function loadData() {
 setLoading(true);
 const supabase = createClient();

 // 1. Get Test
 const { data: test, error: testError } = await supabase
 .from('tests')
 .select('*')
 .eq('id', id)
 .single();

 if (testError || !test) {
 toast.error("Test topilmadi");
 router.push("/admin/tests");
 return;
 }

 setTitle(test.title);
 setDescription(test.description || "");
 setSubject(test.subject);
 setTestType(test.test_type);
 setDifficultyLevel(test.difficulty_level);
 setDurationMinutes(test.duration_minutes);
 setIsPublished(test.is_published);

 // 2. Get Questions
 const { data: qs, error: qsError } = await supabase
 .from('questions')
 .select('*')
 .eq('test_id', id)
 .order('order_index', { ascending: true });

 if (qs) {
 setQuestions(qs.map(q => ({ ...q }))); // Clone
 }

 setLoading(false);
 }
 loadData();
 }, [id, router]);


 const addQuestion = () => {
 const newQuestion: UIQuestion = {
 id: crypto.randomUUID(),
 isNew: true,
 question_text: "",
 question_type: "multiple_choice",
 options: { A: "", B: "", C: "", D: "" },
 correct_answer: "",
 explanation: "",
 points: 1,
 order_index: questions.length,
 image_url: null
 };
 setEditingQuestion(newQuestion);
 };

 const saveQuestion = () => {
 if (!editingQuestion) return;

 if (questions.find(q => q.id === editingQuestion.id)) {
 setQuestions(questions.map(q => q.id === editingQuestion.id ? editingQuestion : q));
 } else {
 setQuestions([...questions, editingQuestion]);
 }
 setEditingQuestion(null);
 };

 const deleteQuestion = (qId: string) => {
 setQuestions(questions.filter(q => q.id !== qId));
 };

 const handleSubmit = async () => {
 setSaving(true);
 try {
 await updateTest(id, {
 title,
 description: description || null,
 subject,
 test_type: testType,
 difficulty_level: difficultyLevel,
 duration_minutes: durationMinutes,
 is_published: isPublished,
 questions: questions.map((q, index) => ({
 id: q.isNew ? undefined : q.id, // Only pass ID if it's not new (or pass UUID if we want to force it, but generally undefined for new lets DB handle or use upsert with provided ID) 
 // Wait, my updateTest uses upsert. If I pass a random UUID for a new question, upsert works fine.
 // But if I want to be safe, I can pass the UUID I generated.
 // Let's pass the ID I generated effectively treated as 'new' to ensure I don't collide with existing? 
 // Actually, for UUIDs, collision is rare.
 // However, `updateTest` logic:
 // `const newIds = testData.questions.filter(q => q.id).map(q => q.id as string);`
 // If I pass the generated ID for new questions, it will be in `newIds`.
 // And `idsToDelete` are existing IDs in DB not in `newIds`. 
 // Since the new ID is definitely not in DB yet, it won't affect deletion logic (correct).
 // And upsert will insert it.
 // So passing `q.id` is fine even for new questions!
 // id: q.id, // REMOVE DUPLICATE
 question_text: q.question_text,
 question_type: q.question_type,
 options: q.options || null,
 correct_answer: q.correct_answer,
 explanation: q.explanation || null,
 points: q.points,
 order_index: index,
 image_url: q.image_url || null,
 })),
 });

 router.push("/admin/tests");
 } catch (error) {
 console.error("Error updating test:", error);
 toast.error("Xatolik yuz berdi!");
 } finally {
 setSaving(false);
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-[60vh]">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
 </div>
 );
 }

 return (
 <div className="max-w-6xl mx-auto py-8 px-4">
 {/* Header */}
 <div className="mb-8">
 <button
 onClick={() => router.push("/admin/tests")}
 className="flex items-center gap-2 text-gray-600 dark:text-gray-400 active:text-brand-blue mb-4"
 >
 <ArrowLeft size={20} />
 Orqaga
 </button>
 <h1 className="text-3xl font-medium text-slate-800 dark:text-slate-100">
 Testni Tahrirlash: {title}
 </h1>
 </div>

 {/* Step Indicator */}
 <div className="mb-8 flex items-center justify-center gap-4">
 <div
 className={`px-4 py-2 rounded-full font-medium cursor-pointer transition-colors ${currentStep === "basic" ? "bg-brand-blue text-white" : "bg-gray-100 text-gray-500"
 }`}
 onClick={() => setCurrentStep("basic")}
 >
 1. Asosiy Ma'lumotlar
 </div>
 <div className="w-8 h-px bg-gray-300"></div>
 <div
 className={`px-4 py-2 rounded-full font-medium cursor-pointer transition-colors ${currentStep === "questions" ? "bg-brand-blue text-white" : "bg-gray-100 text-gray-500"
 }`}
 onClick={() => setCurrentStep("questions")}
 >
 2. Savollar ({questions.length})
 </div>
 </div>

 {/* Content */}
 <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm min-h-[500px]">

 {/* STEP 1: BASIC INFO */}
 {currentStep === "basic" && (
 <div className="max-w-2xl mx-auto space-y-6">
 <div>
 <label className="block text-sm font-medium mb-1">Test Nomi</label>
 <input
 type="text"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"
 placeholder="Masalan: Matematika 1-chorak testi"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium mb-1">Fan</label>
 <select
 value={subject}
 onChange={(e) => setSubject(e.target.value as Subject)}
 className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"
 >
 {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Test Turi</label>
 <select
 value={testType}
 onChange={(e) => setTestType(e.target.value as TestType)}
 className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"
 >
 {testTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
 </select>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium mb-1">Qiyinlik Darajasi</label>
 <select
 value={difficultyLevel}
 onChange={(e) => setDifficultyLevel(e.target.value as any)}
 className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"
 >
 <option value="easy">Oson</option>
 <option value="medium">O'rta</option>
 <option value="hard">Qiyin</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium mb-1">Vaqt (Daqiqa)</label>
 <input
 type="number"
 value={durationMinutes || ""}
 onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : null)}
 className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"
 placeholder="Cheklanmagan"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium mb-1">Tavsif (Ixtiyoriy)</label>
 <textarea
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 h-24"
 />
 </div>

 <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
 <input
 type="checkbox"
 id="publish"
 checked={isPublished}
 onChange={(e) => setIsPublished(e.target.checked)}
 className="w-5 h-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
 />
 <label htmlFor="publish" className="font-medium cursor-pointer">
 Testni Hozir Chop Etish (O'quvchilarga ko'rinadi)
 </label>
 </div>

 <div className="flex justify-end pt-4">
 <button
 onClick={() => setCurrentStep("questions")}
 className="px-6 py-3 bg-brand-blue text-white rounded-xl font-medium active:bg-blue-600 transition-colors"
 >
 Keyingi: Savollar
 </button>
 </div>
 </div>
 )}

 {/* STEP 2: QUESTIONS */}
 {currentStep === "questions" && (
 <div>
 {!editingQuestion ? (
 <div className="space-y-4">
 <div className="flex justify-between items-center mb-6">
 <h2 className="text-xl font-medium">Savollar Ro'yxati ({questions.length})</h2>
 <button
 onClick={addQuestion}
 className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-medium active:bg-green-600 transition-colors"
 >
 <Plus size={18} />
 Yangi Savol
 </button>
 </div>

 {questions.length === 0 ? (
 <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-xl">
 <p className="text-gray-500">Hozircha savollar yo'q</p>
 </div>
 ) : (
 <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
 {questions.map((q, i) => (
 <div key={q.id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl flex items-start gap-4">
 <div className="bg-gray-100 dark:bg-slate-800 w-8 h-8 flex items-center justify-center rounded-lg font-medium text-gray-500 shrink-0">
 {i+ 1}
 </div>
 <div className="flex-1">
  <div className="font-medium">
    <MathRenderer content={q.question_text || "(Savol matni yo'q)"} />
  </div>
 <p className="text-sm text-gray-500 mt-1">
 To'g'ri javob: <span className="font-medium text-green-600">{q.correct_answer}</span> | Ball: {q.points}
 </p>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => setEditingQuestion(q)}
 className="p-2 text-blue-500 active:bg-blue-50 dark:active:bg-blue-900/20 rounded-lg"
 >
 Tahrirlash
 </button>
 <button
 onClick={() => deleteQuestion(q.id)}
 className="p-2 text-red-500 active:bg-red-50 dark:active:bg-red-900/20 rounded-lg"
 >
 <Trash2 size={18} />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}

 <div className="flex justify-between pt-8 border-t dark:border-slate-800 mt-8">
 <button
 onClick={() => setCurrentStep("basic")}
 className="text-gray-500 active:text-slate-800 dark:active:text-white"
 >
 Ortga
 </button>
 <button
 onClick={handleSubmit}
 disabled={saving}
 className="flex items-center gap-2 px-8 py-3 bg-brand-blue text-white rounded-xl font-medium active:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
 >
 {saving ? "Saqlanmoqda..." : (
 <>
 <Save size={20} />
 Saqlash
 </>
 )}
 </button>
 </div>
 </div>
 ) : editingQuestion ? (
  <div className="max-w-3xl mx-auto">
 <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
  {editingQuestion && questions.find(q => q.id === editingQuestion.id) ? "Savolni Tahrirlash" : "Yangi Savol Qo'shish"}
 </h3>

  <div className="space-y-6">
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Savol Matni *</label>
        <button
          type="button"
          onClick={() => setActiveMathField(activeMathField === 'question' ? null : 'question')}
          className={`px-2.5 py-1 rounded-lg font-black text-[11px] transition-all flex items-center gap-1 border cursor-pointer ${
            activeMathField === 'question'
              ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
              : 'bg-brand-blue/10 hover:bg-brand-blue hover:text-white text-brand-blue dark:text-blue-300 border-brand-blue/20'
          }`}
        >
          <Calculator size={13} />
          <span>Formula ∑</span>
        </button>
      </div>
      <textarea
        value={editingQuestion.question_text}
        onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 h-32"
        placeholder="Savolni kiriting (masalan: $x^2 + y^2 = z^2$)..."
      />

      {/* Inline Expandable Formula Panel for Question */}
      <InlineMathPanel
        isOpen={activeMathField === 'question'}
        onClose={() => setActiveMathField(null)}
        title="Savol uchun formulalar"
        onInsert={(formulaText) => {
          if (!editingQuestion) return;
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {['A', 'B', 'C', 'D'].map((opt) => {
      const optVal = editingQuestion.options?.[opt] || "";
      return (
        <div key={opt}>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Variant {opt}</label>
          <button
            type="button"
            onClick={() => setActiveMathField(activeMathField === opt ? null : (opt as any))}
            className={`px-2.5 py-1.5 rounded-lg font-black text-[11px] transition-all flex items-center gap-1 border cursor-pointer shrink-0 ${
              activeMathField === opt
                ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                : 'bg-brand-blue/10 hover:bg-brand-blue hover:text-white text-brand-blue dark:text-blue-300 border-brand-blue/20'
            }`}
          >
            <Calculator size={13} />
            <span>∑</span>
          </button>
        </div>
        <div className={`relative rounded-xl border flex items-center pr-2 transition-colors ${editingQuestion.correct_answer === opt ? 'border-brand-blue ring-1 ring-brand-blue' : 'border-gray-200 dark:border-slate-700'}`}>
        <input
        type="text"
        value={optVal}
        onChange={(e) => setEditingQuestion({
        ...editingQuestion,
        options: { ...editingQuestion.options, [opt]: e.target.value } as any
        })}
        className="w-full px-4 py-2 bg-transparent rounded-xl focus:outline-none"
        placeholder={`Javob varianti ${opt}`}
        />
        <label className="flex items-center gap-1 cursor-pointer shrink-0 ml-2">
          <input
            type="radio"
            name="correct_answer"
            checked={editingQuestion.correct_answer === opt}
            onChange={() => setEditingQuestion({ ...editingQuestion, correct_answer: opt })}
            className="w-4 h-4 text-brand-blue focus:ring-brand-blue cursor-pointer"
          />
          <span className="text-[11px] font-bold text-slate-500">To'g'ri</span>
        </label>
        </div>

        {/* Inline Expandable Formula Panel for Options */}
        <InlineMathPanel
          isOpen={activeMathField === opt}
          onClose={() => setActiveMathField(null)}
          title={`Variant ${opt} uchun formulalar`}
          onInsert={(formulaText) => {
            if (!editingQuestion) return;
            const prevVal = editingQuestion.options?.[opt] || "";
            setEditingQuestion({
              ...editingQuestion,
              options: {
                ...editingQuestion.options,
                [opt]: prevVal ? `${prevVal} ${formulaText}` : formulaText
              } as any
            });
          }}
        />
      {/* Live Option Formula Preview */}
      {optVal && (optVal.includes('$') || optVal.includes('\\') || optVal.includes('^') || optVal.includes('_')) && (
        <div className="mt-1 text-xs font-semibold text-slate-500 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 px-3 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
          <span className="text-[10px] text-brand-blue uppercase font-bold">Ko'rinishi:</span>
          <MathRenderer content={optVal} inline />
        </div>
      )}
      </div>
    );
  })}
  </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium mb-1">Ball</label>
 <input
 type="number"
 value={editingQuestion.points}
 onChange={(e) => setEditingQuestion({ ...editingQuestion, points: parseFloat(e.target.value) })}
 className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium mb-1">Tushuntirish (Ixtiyoriy)</label>
 <textarea
 value={editingQuestion.explanation || ""}
 onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
 className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 h-20"
 placeholder="To'g'ri javobga izoh..."
 />
 </div>

 <div className="flex gap-4 pt-4">
 <button
 onClick={() => setEditingQuestion(null)}
 className="flex-1 py-3 text-gray-500 active:bg-gray-100 dark:active:bg-slate-800 rounded-xl font-medium"
 >
 Bekor qilish
 </button>
 <button
 onClick={saveQuestion}
 disabled={!editingQuestion.question_text || !editingQuestion.correct_answer}
 className="flex-1 py-3 bg-brand-blue text-white rounded-xl font-medium active:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Saqlash
  </button>
  </div>
  </div>
  </div>
  ) : null}
 </div>
 )}
 </div>
 </div>
 );
}
