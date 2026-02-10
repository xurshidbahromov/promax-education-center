"use client";

import { useState, useMemo } from "react";
import {
    FileText,
    Search,
    Plus,
    Save,
    Calculator,
    BookOpen,
    GraduationCap,
    Calendar
} from "lucide-react";
import directionsData from "@/data/dtm_directions.json";

// Mock Students
const MOCK_STUDENTS = [
    { id: 1, name: "Azizbek Toshpulatov", code: "ST-2023-001" },
    { id: 2, name: "Malika Karimova", code: "ST-2023-002" },
    { id: 3, name: "Jamshid Aliyev", code: "ST-2023-003" },
    { id: 4, name: "Sevara Muminova", code: "ST-2023-004" },
    { id: 5, name: "Bobur Rahimov", code: "ST-2023-005" },
];

export default function ResultsPage() {
    // Form State
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [selectedDirectionCode, setSelectedDirectionCode] = useState(directionsData[0].code);
    const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);

    // Answers State (Number of correct answers)
    const [answers, setAnswers] = useState({
        comp_math: 0,   // Max 10
        comp_history: 0,// Max 10
        comp_lang: 0,   // Max 10
        subject_1: 0,   // Max 30
        subject_2: 0    // Max 30
    });

    // Derived State
    const currentDirection = useMemo(() =>
        directionsData.find(d => d.code === selectedDirectionCode) || directionsData[0],
        [selectedDirectionCode]);

    // Score Calculation (DTM 2025 Standard)
    const scores = useMemo(() => {
        const s = {
            comp_math: answers.comp_math * 1.1,
            comp_history: answers.comp_history * 1.1,
            comp_lang: answers.comp_lang * 1.1,
            subject_1: answers.subject_1 * 3.1,
            subject_2: answers.subject_2 * 2.1
        };
        const total = Object.values(s).reduce((a, b) => a + b, 0);
        return { ...s, total };
    }, [answers]);

    // Handlers
    const handleAnswerChange = (field: keyof typeof answers, value: string, max: number) => {
        let num = parseInt(value) || 0;
        if (num < 0) num = 0;
        if (num > max) num = max;
        setAnswers(prev => ({ ...prev, [field]: num }));
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <FileText className="text-brand-blue" size={32} />
                    DTM Result Entry
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Enter offline mock exam results. Scores are auto-calculated based on DTM 2025 standards.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Entry Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-lg">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Plus size={20} className="text-brand-orange" />
                                New Result Entry
                            </h2>
                            <div className="text-sm font-medium px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800">
                                Max Score: 189.0
                            </div>
                        </div>

                        <form className="space-y-8">
                            {/* Section 1: Student & Meta */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Student</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                    >
                                        <option value="">Select Student...</option>
                                        {MOCK_STUDENTS.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Exam Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="date"
                                            value={examDate}
                                            onChange={(e) => setExamDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Direction Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Direction (Yo'nalish)</label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <select
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                                        value={selectedDirectionCode}
                                        onChange={(e) => setSelectedDirectionCode(e.target.value)}
                                    >
                                        {directionsData.map(d => (
                                            <option key={d.code} value={d.code}>
                                                {d.name} ({d.subject_1} & {d.subject_2})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <hr className="border-dashed border-gray-200 dark:border-slate-800" />

                            {/* Section 3: Scores Entry */}
                            <div className="space-y-6">
                                {/* Compulsory Block */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <BookOpen size={16} /> Compulsory Subjects (Majburiy)
                                        <span className="text-xs normal-case font-normal text-gray-400">(10 questions × 1.1 points)</span>
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* Math */}
                                        <ScoreInput
                                            label="Matematika"
                                            value={answers.comp_math}
                                            onChange={(v) => handleAnswerChange('comp_math', v, 10)}
                                            score={scores.comp_math}
                                        />
                                        {/* History */}
                                        <ScoreInput
                                            label="Ozbekiston Tarixi"
                                            value={answers.comp_history}
                                            onChange={(v) => handleAnswerChange('comp_history', v, 10)}
                                            score={scores.comp_history}
                                        />
                                        {/* Native Lang */}
                                        <ScoreInput
                                            label="Ona Tili"
                                            value={answers.comp_lang}
                                            onChange={(v) => handleAnswerChange('comp_lang', v, 10)}
                                            score={scores.comp_lang}
                                        />
                                    </div>
                                </div>

                                {/* Specialty Block */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2 text-brand-blue">
                                        <GraduationCap size={16} /> Specialty Subjects (Mutaxassislik)
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Subject 1 */}
                                        <ScoreInput
                                            label={`1-Fan: ${currentDirection.subject_1}`}
                                            subtitle="(30 questions × 3.1 points)"
                                            value={answers.subject_1}
                                            onChange={(v) => handleAnswerChange('subject_1', v, 30)}
                                            score={scores.subject_1}
                                            max={30}
                                            isMain={true}
                                        />
                                        {/* Subject 2 */}
                                        <ScoreInput
                                            label={`2-Fan: ${currentDirection.subject_2}`}
                                            subtitle="(30 questions × 2.1 points)"
                                            value={answers.subject_2}
                                            onChange={(v) => handleAnswerChange('subject_2', v, 30)}
                                            score={scores.subject_2}
                                            max={30}
                                            isMain={true}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <button type="button" className="w-full py-4 bg-brand-blue text-white rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 text-lg active:scale-[0.98]">
                                <Save size={20} />
                                Save Result
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: Live Summary */}
                <div className="lg:col-span-1 space-y-6 sticky top-24 h-fit">
                    {/* Score Card */}
                    <div className="bg-brand-blue text-white rounded-3xl p-8 shadow-xl shadow-blue-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 p-32 bg-brand-orange/20 rounded-full blur-3xl -ml-16 -mb-16"></div>

                        <div className="relative z-10 text-center">
                            <h3 className="text-blue-100 font-medium mb-2">Total Score</h3>
                            <div className="text-6xl font-bold mb-2 tracking-tight">
                                {scores.total.toFixed(1)}
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sm font-medium backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                {((scores.total / 189) * 100).toFixed(0)}% of Max
                            </div>
                        </div>

                        <div className="mt-8 space-y-3 relative z-10">
                            <SummaryRow label="Majburiy Fanlar" value={(scores.comp_math + scores.comp_history + scores.comp_lang).toFixed(1)} />
                            <SummaryRow label={`1-Fan (${currentDirection.subject_1})`} value={scores.subject_1.toFixed(1)} />
                            <SummaryRow label={`2-Fan (${currentDirection.subject_2})`} value={scores.subject_2.toFixed(1)} />
                        </div>
                    </div>

                    {/* Quick Stats or Tips */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Calculator size={18} className="text-gray-400" />
                            Calculation Rules
                        </h4>
                        <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                            <li className="flex justify-between">
                                <span>Majburiy (x3)</span>
                                <span className="font-mono font-medium">10 × 1.1 = 33</span>
                            </li>
                            <li className="flex justify-between">
                                <span>1-Fan (Main)</span>
                                <span className="font-mono font-medium">30 × 3.1 = 93</span>
                            </li>
                            <li className="flex justify-between">
                                <span>2-Fan (Secondary)</span>
                                <span className="font-mono font-medium">30 × 2.1 = 63</span>
                            </li>
                            <li className="pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-between font-bold text-gray-700 dark:text-gray-200">
                                <span>MAX TOTAL</span>
                                <span>189.0</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ScoreInput({ label, subtitle, value, onChange, score, max = 10, isMain = false }: any) {
    return (
        <div className={`p-4 rounded-xl border transition-all ${isMain
            ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
            : 'bg-gray-50 dark:bg-slate-800 border-transparent'
            }`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 truncate pr-2 max-w-[120px] sm:max-w-none" title={label}>
                        {label}
                    </label>
                    {subtitle && <p className="text-[10px] text-gray-400">{subtitle}</p>}
                </div>
                <span className="text-xs font-mono text-brand-blue bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-blue-100 dark:border-slate-700">
                    {score.toFixed(1)}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    min="0"
                    max={max}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-blue/50 outline-none font-mono text-lg text-center"
                />
                <span className="text-gray-400 text-sm font-medium">/{max}</span>
            </div>
        </div>
    );
}

function SummaryRow({ label, value }: any) {
    return (
        <div className="flex justify-between items-center text-sm border-b border-white/10 last:border-0 pb-2 last:pb-0">
            <span className="text-blue-100 truncate max-w-[180px]">{label}</span>
            <span className="font-mono font-bold">{value}</span>
        </div>
    );
}
