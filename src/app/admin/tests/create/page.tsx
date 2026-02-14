"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import {
    ArrowLeft,
    ArrowRight,
    Plus,
    Trash2,
    Save,
    Eye,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import { createTest, type Subject, type TestType } from "@/lib/tests";

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
    const { t } = useLanguage();
    const { showToast } = useToast();
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

    const handleSubmit = async (publish: boolean) => {
        setSaving(true);
        try {
            await createTest({
                title,
                description: description || null,
                subject,
                test_type: testType,
                difficulty_level: difficultyLevel,
                duration_minutes: durationMinutes,
                is_published: publish,
                questions: questions.map((q, index) => ({
                    question_text: q.question_text,
                    question_type: q.question_type,
                    options: q.options || null,
                    correct_answer: q.correct_answer,
                    explanation: q.explanation || null,
                    points: q.points,
                    order_index: index,
                    image_url: null,
                })),
            });

            router.push("/admin/tests");
        } catch (error) {
            console.error("Error creating test:", error);
            showToast("Xatolik yuz berdi!", "error");
        } finally {
            setSaving(false);
        }
    };

    const canProceed = () => {
        if (currentStep === "basic") {
            return title.trim() && subject && testType;
        }
        if (currentStep === "questions") {
            return questions.length > 0;
        }
        return true;
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.push("/admin/tests")}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-blue mb-4"
                >
                    <ArrowLeft size={20} />
                    Orqaga
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Yangi Test Yaratish
                </h1>
            </div>

            {/* Step Indicator */}
            <div className="mb-8 flex items-center justify-center gap-4">
                {[
                    { key: "basic", label: "Asosiy Ma'lumot", number: 1 },
                    { key: "questions", label: "Savollar", number: 2 },
                    { key: "preview", label: "Ko'rib Chiqish", number: 3 },
                ].map((step, index) => (
                    <div key={step.key} className="flex items-center">
                        <div
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg ${currentStep === step.key
                                ? "bg-brand-blue text-white"
                                : index < ["basic", "questions", "preview"].indexOf(currentStep)
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400"
                                }`}
                        >
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">
                                {step.number}
                            </div>
                            <span className="font-medium hidden md:inline">{step.label}</span>
                        </div>
                        {index < 2 && (
                            <div className="w-8 h-0.5 bg-gray-300 dark:bg-slate-700 mx-2"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
                {/* Step 1: Basic Info */}
                {currentStep === "basic" && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Test Nomi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Masalan: Algebra Asoslari"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tavsif
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Test haqida qisqacha ma'lumot..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Fan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value as Subject)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue"
                                >
                                    {subjects.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Test Turi <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={testType}
                                    onChange={(e) => setTestType(e.target.value as TestType)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue"
                                >
                                    {testTypes.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Qiyinlik Darajasi
                                </label>
                                <select
                                    value={difficultyLevel}
                                    onChange={(e) => setDifficultyLevel(e.target.value as any)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue"
                                >
                                    <option value="easy">Oson</option>
                                    <option value="medium">O'rtacha</option>
                                    <option value="hard">Qiyin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Vaqt (daqiqa) <span className="text-gray-400 text-xs">(ixtiyoriy)</span>
                                </label>
                                <input
                                    type="number"
                                    value={durationMinutes || ""}
                                    onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : null)}
                                    placeholder="30"
                                    min="1"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-blue"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Questions - CONTINUES IN NEXT MESSAGE DUE TO LENGTH */}
                {currentStep === "questions" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Savollar ({questions.length})
                            </h2>
                            <button
                                onClick={addQuestion}
                                className="px-4 py-2 bg-brand-blue text-white rounded-xl flex items-center gap-2 hover:shadow-lg transition-all"
                            >
                                <Plus size={20} />
                                Savol Qo'shish
                            </button>
                        </div>

                        {questions.length === 0 && !editingQuestion && (
                            <div className="text-center py-12">
                                <AlertCircle className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    Hali savollar yo'q. Birinchi savolni qo'shing.
                                </p>
                            </div>
                        )}

                        {/* Question List */}
                        {questions.map((q, index) => (
                            <div
                                key={q.id}
                                className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800/50"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 bg-brand-blue text-white text-xs font-bold rounded">
                                                {index + 1}
                                            </span>
                                            <span className="px-2 py-1 bg-gray-200 dark:bg-slate-700 text-xs font-medium rounded">
                                                {q.question_type === "multiple_choice" ? "Ko'p tanlov" : q.question_type === "true_false" ? "To'g'ri/Noto'g'ri" : "Qisqa javob"}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {q.points} ball
                                            </span>
                                        </div>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {q.question_text}
                                        </p>
                                        {q.question_type === "multiple_choice" && q.options && (
                                            <div className="mt-2 space-y-1">
                                                {Object.entries(q.options).map(([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className={`text-sm ${key === q.correct_answer
                                                            ? "text-green-600 dark:text-green-400 font-medium"
                                                            : "text-gray-600 dark:text-gray-400"
                                                            }`}
                                                    >
                                                        {key}. {value} {key === q.correct_answer && "✓"}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setEditingQuestion(q)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => deleteQuestion(q.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Question Editor Modal */}
                        {editingQuestion && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        {questions.find(q => q.id === editingQuestion.id) ? "Savolni Tahrirlash" : "Yangi Savol"}
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Savol Matni
                                            </label>
                                            <textarea
                                                value={editingQuestion.question_text}
                                                onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                                                placeholder="Savolni kiriting..."
                                                rows={3}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Savol Turi
                                            </label>
                                            <select
                                                value={editingQuestion.question_type}
                                                onChange={(e) => setEditingQuestion({
                                                    ...editingQuestion,
                                                    question_type: e.target.value as any,
                                                    options: e.target.value === "multiple_choice" ? { A: "", B: "", C: "", D: "" } : undefined
                                                })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                            >
                                                <option value="multiple_choice">Ko'p Tanlov</option>
                                                <option value="true_false">To'g'ri/Noto'g'ri</option>
                                                <option value="short_answer">Qisqa Javob</option>
                                            </select>
                                        </div>

                                        {editingQuestion.question_type === "multiple_choice" && editingQuestion.options && (
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Variantlar
                                                </label>
                                                {["A", "B", "C", "D"].map((key) => (
                                                    <input
                                                        key={key}
                                                        value={editingQuestion.options![key]}
                                                        onChange={(e) => setEditingQuestion({
                                                            ...editingQuestion,
                                                            options: { ...editingQuestion.options, [key]: e.target.value }
                                                        })}
                                                        placeholder={`Variant ${key}`}
                                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                To'g'ri Javob
                                            </label>
                                            {editingQuestion.question_type === "multiple_choice" ? (
                                                <select
                                                    value={editingQuestion.correct_answer}
                                                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correct_answer: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                                >
                                                    <option value="">Tanlang</option>
                                                    <option value="A">A</option>
                                                    <option value="B">B</option>
                                                    <option value="C">C</option>
                                                    <option value="D">D</option>
                                                </select>
                                            ) : editingQuestion.question_type === "true_false" ? (
                                                <select
                                                    value={editingQuestion.correct_answer}
                                                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correct_answer: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                                >
                                                    <option value="">Tanlang</option>
                                                    <option value="true">To'g'ri</option>
                                                    <option value="false">Noto'g'ri</option>
                                                </select>
                                            ) : (
                                                <input
                                                    value={editingQuestion.correct_answer}
                                                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correct_answer: e.target.value })}
                                                    placeholder="To'g'ri javobni kiriting"
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                                />
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Tushuntirish (ixtiyoriy)
                                            </label>
                                            <textarea
                                                value={editingQuestion.explanation || ""}
                                                onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                                                placeholder="Nima uchun bu javob to'g'ri?"
                                                rows={2}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Ball
                                            </label>
                                            <input
                                                type="number"
                                                value={editingQuestion.points}
                                                onChange={(e) => setEditingQuestion({ ...editingQuestion, points: parseInt(e.target.value) || 1 })}
                                                min="1"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-6">
                                        <button
                                            onClick={saveQuestion}
                                            disabled={!editingQuestion.question_text || !editingQuestion.correct_answer}
                                            className="flex-1 px-4 py-3 bg-brand-blue text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Saqlash
                                        </button>
                                        <button
                                            onClick={() => setEditingQuestion(null)}
                                            className="px-4 py-3 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-slate-700"
                                        >
                                            Bekor Qilish
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Preview */}
                {currentStep === "preview" && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                                        Test tayyor!
                                    </h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-400">
                                        Barcha ma'lumotlarni tekshiring va testni chop eting yoki qoralama sifatida saqlang.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Nomi:</div>
                                <div className="font-semibold text-gray-900 dark:text-white">{title}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Fan:</div>
                                <div className="font-semibold text-gray-900 dark:text-white capitalize">{subject}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Turi:</div>
                                <div className="font-semibold text-gray-900 dark:text-white capitalize">{testType}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Qiyinlik:</div>
                                <div className="font-semibold text-gray-900 dark:text-white capitalize">{difficultyLevel}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Savollar:</div>
                                <div className="font-semibold text-gray-900 dark:text-white">{questions.length} ta</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Vaqt:</div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                    {durationMinutes ? `${durationMinutes} daqiqa` : "Cheklanmagan"}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Savollar ko'rinishi:
                            </h3>
                            <div className="space-y-4">
                                {questions.slice(0, 3).map((q, index) => (
                                    <div key={q.id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <span className="px-2 py-1 bg-brand-blue text-white text-sm font-bold rounded">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-gray-900 dark:text-white mb-2">{q.question_text}</p>
                                                {q.question_type === "multiple_choice" && q.options && (
                                                    <div className="space-y-1">
                                                        {Object.entries(q.options).map(([key, value]) => (
                                                            <div key={key} className="text-sm text-gray-600 dark:text-gray-400">
                                                                {key}. {value}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {questions.length > 3 && (
                                    <p className="text-sm text-gray-500 text-center">
                                        ... va yana {questions.length - 3} ta savol
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
                <button
                    onClick={() => {
                        if (currentStep === "questions") setCurrentStep("basic");
                        else if (currentStep === "preview") setCurrentStep("questions");
                    }}
                    disabled={currentStep === "basic"}
                    className="px-6 py-3 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeft size={20} />
                    Orqaga
                </button>

                <div className="flex items-center gap-3">
                    {currentStep === "preview" ? (
                        <>
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={saving}
                                className="px-6 py-3 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-slate-700 disabled:opacity-50"
                            >
                                <Save size={20} />
                                Qoralama
                            </button>
                            <button
                                onClick={() => handleSubmit(true)}
                                disabled={saving}
                                className="px-6 py-3 bg-gradient-to-r from-brand-blue to-cyan-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg disabled:opacity-50"
                            >
                                <CheckCircle size={20} />
                                Chop Etish
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                if (currentStep === "basic") setCurrentStep("questions");
                                else if (currentStep === "questions") setCurrentStep("preview");
                            }}
                            disabled={!canProceed()}
                            className="px-6 py-3 bg-brand-blue text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Keyingi
                            <ArrowRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
