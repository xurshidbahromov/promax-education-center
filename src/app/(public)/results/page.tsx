"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import ResultsStats from "@/components/ResultsStats";
import { Award, Play } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

// Professional Video Facade Component
const VideoCard = ({ video, index }: { video: { id: string, title: string }, index: number }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className="group bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-800 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-brand-blue/10 hover:-translate-y-2 transition-all duration-500 flex flex-col"
        >
            {/* Video Facade / Iframe Container */}
            <div className="relative aspect-video w-full bg-slate-100 dark:bg-black overflow-hidden shrink-0">
                {!isPlaying ? (
                    <div 
                        className="w-full h-full cursor-pointer relative"
                        onClick={() => setIsPlaying(true)}
                    >
                        {/* Fallback to hqdefault which almost always exists for YouTube videos */}
                        <Image
                            src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                            alt={video.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            unoptimized
                        />
                        {/* Dark overlay to make the play button pop */}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                        
                        {/* Custom Premium Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 group-hover:scale-110 group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-300 shadow-xl">
                                <Play className="w-6 h-6 text-white fill-white translate-x-0.5" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0"
                    ></iframe>
                )}
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 flex-grow flex flex-col justify-start bg-white dark:bg-slate-900 relative">
                <div className="inline-flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-extrabold tracking-wider uppercase">
                        YouTube
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-700" />
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
                        Muvaffaqiyat Tarixi
                    </span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-lg md:text-xl line-clamp-3 group-hover:text-brand-blue dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {video.title}
                </h3>
            </div>
        </motion.div>
    );
};

export default function ResultsPage() {
    const { t } = useLanguage();

    const videos = [
        { id: "tizWzSm-N7k", title: "Universitetga kirishimdan asosiy maqsadim... | Kamronbek" },
        { id: "Wm5tVfWyRww", title: "Rossiya oliygohlari talabasi bo'lish!" },
        { id: "z7ren1yoAZ0", title: "Shifokor bo'lishimdan asosiy maqsadim..." },
        { id: "6P9K5f5A1Ts", title: "Harakat qilsa, hamma maqsadga erishish mumkin!" }, 
        { id: "YRHaFfvfRxw", title: "5 ta universitet talabasi bo'ldim..." },
        { id: "LfQEIwzTnng", title: "Maqsadim -- yetuk shifokor bo'lish!" }, 
        { id: "5OfZzxbYN4Q", title: "Endi universitetga imtihonsiz kira olaman!" }, 
        { id: "5U2KAiNEBRQ", title: "AJOU talabasi bo'lishga muvaffaq bo'ldim! | Munira" },
        { id: "AIlOwPHliNA", title: "Grant asosida o'qib, 2 ta universitet talabasi bo'ldim!" }, 
        { id: "3qv0QED_0k8", title: "Yutuqlarimda ustozlarim mehnati katta! | Xusnora" }, 
        { id: "ZiomV95lkLQ", title: "Albatta, barcha maqsadlarimga erishaman! | Shahzoda" }, 
        { id: "YuGpC1Sg11k", title: "IELTS insights with Mrs.Malika" } 
    ];

    return (
        <div className="w-full pt-24 transition-colors duration-300 relative overflow-hidden">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[150px] pointer-events-none -z-10" />

            <div className="px-4 sm:px-6 lg:px-8 pb-12">
                <div className="max-w-7xl mx-auto w-full relative z-10">
                
                {/* Left Aligned Header */}
                <div className="mb-16 relative mt-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-extrabold text-slate-800 dark:text-white mb-6 tracking-tight"
                    >
                        {t('results.header.title')}
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed"
                    >
                        {t('results.header.subtitle')}
                    </motion.p>
                </div>
            </div>
            </div>

            {/* Premium Stats Component (Full width) */}
            <div className="relative z-20">
                <ResultsStats />
            </div>

            {/* Success Stories Grid */}
            <section className="py-24 px-4 relative z-10">
                
                {/* Additional ambient glow for videos section */}
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[180px] pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-16">
                        <div className="w-16 h-1.5 bg-gradient-to-r from-brand-orange to-amber-400 rounded-full" />
                        <motion.h2 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-4"
                        >
                            {t('results.stories.title')}
                            <Award className="text-brand-orange w-8 h-8" />
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {videos.map((video, index) => (
                            <VideoCard key={video.id} video={video} index={index} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
