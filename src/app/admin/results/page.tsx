"use client";

import { useState } from "react";
import {
    FileText,
    Search,
    Plus,
    Award,
    Calendar,
    Save
} from "lucide-react";

export default function ResultsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <FileText className="text-brand-blue" size={32} />
                    Results Management
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Input and manage student mock exam scores.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-lg sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Plus size={20} className="text-brand-orange" />
                            New Result
                        </h2>

                        <form className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Student</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search student name..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Exam Type</label>
                                <select className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all">
                                    <option>IELTS Full Mock</option>
                                    <option>IELTS Listening</option>
                                    <option>IELTS Reading</option>
                                    <option>Mathematics</option>
                                    <option>Logic Mock</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Score</label>
                                <div className="relative">
                                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="e.g. 7.5 or 86"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                                    />
                                </div>
                            </div>

                            <button className="w-full py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 mt-4">
                                <Save size={18} />
                                Save Result
                            </button>
                        </form>
                    </div>
                </div>

                {/* Recent Results List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Entries</h2>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-slate-800">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 font-bold">
                                            ST
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">Student Name {i}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">IELTS Full Mock • Yesterday</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-brand-blue">7.5</div>
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">Passed</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
