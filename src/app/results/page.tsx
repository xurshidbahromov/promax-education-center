"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import ResultsStats from "@/components/ResultsStats";

export default function ResultsPage() {
    const { t } = useLanguage();

    const videos = [
        { id: "tizWzSm-N7k", title: "Universitetga kirishimdan asosiy maqsadim... | Kamronbek" },
        { id: "Wm5tVfWyRww", title: "Rossiya oliygohlari talabasi bo'lish!" },
        { id: "z7ren1yoAZ0", title: "Shifokor bo'lishimdan asosiy maqsadim..." },
        { id: "6P9K5f5A1Ts", title: "Harakat qilsa, hamma maqsadga erishish mumkin!" }, // Fixed ID from user list
        { id: "YRHaFfvfRxw", title: "5 ta universitet talabasi bo'ldim..." },
        { id: "LfQEIwzTnng", title: "Maqsadim -- yetuk shifokor bo'lish!" }, // Fixed ID from user list
        { id: "5OfZzxbYN4Q", title: "Endi universitetga imtihonsiz kira olaman!" }, // Fixed ID from user list
        { id: "5U2KAiNEBRQ", title: "AJOU talabasi bo'lishga muvaffaq bo'ldim! | Munira" },
        { id: "AIlOwPHliNA", title: "Grant asosida o'qib, 2 ta universitet talabasi bo'ldim!" }, // Fixed ID
        { id: "3qv0QED_0k8", title: "Yutuqlarimda ustozlarim mehnati katta! | Xusnora" }, // Fixed ID
        { id: "ZiomV95lkLQ", title: "Albatta, barcha maqsadlarimga erishaman! | Shahzoda" }, // Fixed ID
        { id: "YuGpC1Sg11k", title: "IELTS insights with Mrs.Malika" } // Fixed ID
    ];

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

            {/* Success Stories Grid */}
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
                        {videos.map((video, index) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-white/10 group hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="relative aspect-video bg-black">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${video.id}`}
                                        title={video.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        className="absolute inset-0"
                                    ></iframe>
                                </div>

                                <div className="p-6">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2group-hover:text-brand-blue transition-colors">
                                        {video.title}
                                    </h3>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
