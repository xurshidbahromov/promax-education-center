"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileText,
    Clock,
    Zap,
    BookOpen,
    CheckCircle2,
    BarChart,
    Search,
    Filter,
    TrendingUp,
    Award,
    Target
} from "lucide-react";
import { getPublishedTests, type Test, type TestFilters, Subject, TestType } from "@/lib/tests";

export default function OnlineTestsPage() {
    const { t } = useLanguage();
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSubject, setSelectedSubject] = useState<Subject | "all">("all");
    const [selectedType, setSelectedType] = useState<TestType | "all">("all");

    useEffect(() => {
        async function fetchTests() {
            const filters: TestFilters = {};

            if (selectedSubject !== "all") {
                filters.subject = selectedSubject;
            }

            if (selectedType !== "all") {
                filters.test_type = selectedType;
            }

            if (searchQuery.trim()) {
                filters.search = searchQuery;
            }

            const data = await getPublishedTests(filters);
            setTests(data);
            setLoading(false);
        }

        fetchTests();
    }, [selectedSubject, selectedType, searchQuery]);

    const subjects = [
        { id: "all", label: t('tests.subjects.all') || "All Subjects", color: "bg-gray-500" },
        { id: "math", label: t('tests.subjects.math') || "Mathematics", color: "bg-blue-500" },
        { id: "english", label: t('tests.subjects.english') || "English", color: "bg-green-500" },
        { id: "physics", label: t('tests.subjects.physics') || "Physics", color: "bg-purple-500" },
        { id: "chemistry", label: t('tests.subjects.chemistry') || "Chemistry", color: "bg-orange-500" },
        { id: "biology", label: t('tests.subjects.biology') || "Biology", color: "bg-teal-500" },
    ];

    const types = [
        { id: "all", label: t('tests.types.all') || "All Types", icon: Filter },
        { id: "subject", label: t('tests.types.subject') || "Subject Test", icon: BookOpen },
        { id: "practice", label: t('tests.types.practice') || "Practice", icon: Target },
        { id: "progress", label: t('tests.types.progress') || "Progress", icon: TrendingUp },
        { id: "mock", label: t('tests.types.mock') || "Mock Exam", icon: Award },
    ];

    const getSubjectColor = (subject: Subject) => {
        const subjectConfig: Record<Subject, { gradient: string; light: string }> = {
            math: { gradient: "from-blue-500 to-cyan-500", light: "bg-blue-50 dark:bg-blue-900/20" },
            english: { gradient: "from-green-500 to-emerald-500", light: "bg-green-50 dark:bg-green-900/20" },
            physics: { gradient: "from-purple-500 to-pink-500", light: "bg-purple-50 dark:bg-purple-900/20" },
            chemistry: { gradient: "from-orange-500 to-red-500", light: "bg-orange-50 dark:bg-orange-900/20" },
            biology: { gradient: "from-teal-500 to-green-500", light: "bg-teal-50 dark:bg-teal-900/20" },
            general: { gradient: "from-gray-500 to-slate-500", light: "bg-gray-50 dark:bg-gray-900/20" },
        };
        return subjectConfig[subject] || subjectConfig.general;
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Zap className="text-brand-blue" size={32} />
                        {t('tests.title') || 'Online Tests'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {t('tests.subtitle') || 'Practice and improve your skills'}
                    </p>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                    <Search className="text-gray-400 ml-2" size={20} />
                    <input
                        type="text"
                        placeholder={t('tests.search_placeholder') || "Search tests..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm w-48 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Subject Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                {subjects.map((subject) => (
                    <button
                        key={subject.id}
                        onClick={() => setSelectedSubject(subject.id as any)}
                        className={`
                            px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all
                            ${selectedSubject === subject.id
                                ? "bg-brand-blue text-white shadow-md shadow-blue-500/20"
                                : "bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
                            }
                        `}
                    >
                        {subject.label}
                    </button>
                ))}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {types.map((type) => {
                    const Icon = type.icon;
                    return (
                        <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id as any)}
                            className={`
                                px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-all
                                ${selectedType === type.id
                                    ? "bg-gradient-to-r from-brand-blue to-cyan-500 text-white shadow-lg"
                                    : "bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-800 hover:border-brand-blue hover:text-brand-blue"
                                }
                            `}
                        >
                            <Icon size={16} />
                            {type.label}
                        </button>
                    );
                })}
            </div>

            {/* Tests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                        <p className="text-gray-400 mt-4">Loading tests...</p>
                    </div>
                ) : tests.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <FileText className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
                        <p className="text-gray-400">{t('dashboard.no_results') || 'No tests found'}</p>
                    </div>
                ) : (
                    tests.map((test) => {
                        const colors = getSubjectColor(test.subject);

                        return (
                            <Link
                                key={test.id}
                                href={`/dashboard/tests/${test.id}`}
                                className={`${colors.light} rounded-3xl p-6 border border-gray-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all group block`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <FileText className="text-white" size={24} />
                                    </div>

                                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${colors.gradient}`}>
                                        {test.test_type.toUpperCase()}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-blue transition-colors">
                                    {test.title}
                                </h3>

                                {/* Description */}
                                {test.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {test.description}
                                    </p>
                                )}

                                {/* Metadata */}
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={16} className="text-brand-blue" />
                                        <span>{test.total_questions} {t('tests.questions') || 'questions'}</span>
                                    </div>

                                    {test.duration_minutes && (
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-orange-500" />
                                            <span>{test.duration_minutes} {t('tests.minutes') || 'min'}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <BarChart size={16} className="text-green-500" />
                                        <span className="capitalize">{test.difficulty_level}</span>
                                    </div>
                                </div>

                                {/* Start Button */}
                                <button className="w-full py-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-bold group-hover:bg-gradient-to-r group-hover:from-brand-blue group-hover:to-cyan-500 group-hover:text-white transition-all flex items-center justify-center gap-2">
                                    {t('tests.start_test') || 'Start Test'}
                                    <CheckCircle2 size={18} />
                                </button>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
