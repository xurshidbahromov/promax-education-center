"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import {
    FileText,
    Clock,
    Zap,
    BookOpen,
    CheckCircle2,
    BarChart,
    Search,
    Filter
} from "lucide-react";

export default function OnlineTestsPage() {
    const { t } = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState("all");

    const categories = [
        { id: "all", label: "All Tests" },
        { id: "ielts", label: "IELTS Mock" },
        { id: "math", label: "Mathematics" },
        { id: "english", label: "General English" },
        { id: "logic", label: "Logic / IQ" },
    ];

    const tests = [
        {
            id: 1,
            title: "IELTS Listening Full Mock",
            category: "ielts",
            duration: "40 mins",
            questions: 40,
            difficulty: "Hard",
            color: "text-red-500",
            bg: "bg-red-50 dark:bg-red-900/20",
            status: "New"
        },
        {
            id: 2,
            title: "Algebra Basics Quiz",
            category: "math",
            duration: "20 mins",
            questions: 15,
            difficulty: "Medium",
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            status: "Popular"
        },
        {
            id: 3,
            title: "English Grammar: Tenses",
            category: "english",
            duration: "25 mins",
            questions: 30,
            difficulty: "Easy",
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-900/20",
            status: ""
        },
        {
            id: 4,
            title: "Logic & Patterns Vol. 1",
            category: "logic",
            duration: "15 mins",
            questions: 10,
            difficulty: "Medium",
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            status: ""
        },
        {
            id: 5,
            title: "IELTS Reading: Academic",
            category: "ielts",
            duration: "60 mins",
            questions: 40,
            difficulty: "Hard",
            color: "text-red-500",
            bg: "bg-red-50 dark:bg-red-900/20",
            status: "New"
        }
    ];

    const filteredTests = selectedCategory === "all"
        ? tests
        : tests.filter(test => test.category === selectedCategory);

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Zap className="text-brand-blue" size={32} />
                        {t('tests.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {t('tests.subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                    <Search className="text-gray-400 ml-2" size={20} />
                    <input
                        type="text"
                        placeholder="Search tests..."
                        className="bg-transparent border-none focus:ring-0 text-sm w-48"
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`
                            px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all
                            ${selectedCategory === cat.id
                                ? "bg-brand-blue text-white shadow-md shadow-blue-500/20"
                                : "bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
                            }
                        `}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Tests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test) => (
                    <div key={test.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${test.bg} ${test.color}`}>
                                <FileText size={24} />
                            </div>
                            {test.status && (
                                <span className="px-3 py-1 bg-brand-orange/10 text-brand-orange text-xs font-bold rounded-full uppercase tracking-wider">
                                    {test.status}
                                </span>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-blue transition-colors">
                            {test.title}
                        </h3>

                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                            <div className="flex items-center gap-1">
                                <Clock size={16} />
                                {test.duration}
                            </div>
                            <div className="flex items-center gap-1">
                                <BookOpen size={16} />
                                {test.questions} Qs
                            </div>
                            <div className="flex items-center gap-1">
                                <BarChart size={16} />
                                {test.difficulty}
                            </div>
                        </div>

                        <button className="w-full py-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold group-hover:bg-brand-blue group-hover:text-white transition-all flex items-center justify-center gap-2">
                            Start Test <CheckCircle2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
