"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import ResultsStats from "@/components/ResultsStats";

export default function ResultsPage() {
    const { t } = useLanguage();

    return (
        <div className="pt-24 min-h-screen">
            {/* Header */}
            <section className="text-center py-16 px-4">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6"
                >
                    {t('results.header.title')}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                >
                    {t('results.header.subtitle')}
                </motion.p>
            </section>

            {/* Reusing the Minimal Stats Component */}
            <ResultsStats />

            {/* Success Stories Grid (Skeleton Loading State) */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            {t('results.stories.title')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            {t('results.stories.subtitle')}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Skeleton Loaders */}
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <motion.div
                                key={item}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: item * 0.05 }}
                                className="bg-white dark:bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-gray-100 dark:border-white/10 shadow-sm"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-slate-700/50 animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700/50 rounded animate-pulse" />
                                        <div className="h-3 w-20 bg-gray-200 dark:bg-slate-700/50 rounded animate-pulse" />
                                    </div>
                                </div>

                                <div className="mb-4 space-y-3">
                                    <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700/50 rounded-full animate-pulse" />
                                    <div className="h-8 w-24 bg-gray-200 dark:bg-slate-700/50 rounded animate-pulse" />
                                </div>

                                <div className="h-1 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mt-6">
                                    <div className="h-full bg-gray-200 dark:bg-slate-700/50 w-2/3 animate-pulse" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
