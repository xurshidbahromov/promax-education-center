"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import ResultsStats from "@/components/ResultsStats";
import { Play } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const VideoCard = ({
  video,
  index,
}: {
  video: { id: string; title: string };
  index: number;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.04, 0.2), duration: 0.35 }}
      className="group bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/45 transition-all duration-200 flex flex-col"
    >
      {/* Video Facade / Iframe */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden shrink-0">
        {!isPlaying ? (
          <button
            type="button"
            className="w-full h-full cursor-pointer relative block text-left"
            onClick={() => setIsPlaying(true)}
            aria-label={video.title}
          >
            <Image
              src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
            <div className="absolute inset-0 bg-slate-950/25 group-hover:bg-slate-950/15 transition-colors duration-200" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-13 h-13 rounded-full bg-slate-900/75 backdrop-blur-md flex items-center justify-center border border-white/25 group-hover:bg-red-600 group-hover:border-red-600 active:scale-95 transition-all duration-200 shadow-lg">
                <Play className="w-5 h-5 text-white fill-white translate-x-0.5" />
              </div>
            </div>
          </button>
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
          />
        )}
      </div>

      {/* Clean Solid Body */}
      <div className="p-5 flex-grow flex flex-col justify-start">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-red-600" />
          <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
            YouTube • Muvaffaqiyat tarixi
          </span>
        </div>
        <h3 className="font-semibold font-sans tracking-tight text-slate-900 dark:text-white text-base leading-snug line-clamp-2">
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
    { id: "LfQEIwzTnng", title: "Maqsadim — yetuk shifokor bo'lish!" },
    { id: "5OfZzxbYN4Q", title: "Endi universitetga imtihonsiz kira olaman!" },
    { id: "5U2KAiNEBRQ", title: "AJOU talabasi bo'lishga muvaffaq bo'ldim! | Munira" },
    { id: "AIlOwPHliNA", title: "Grant asosida o'qib, 2 ta universitet talabasi bo'ldim!" },
    { id: "3qv0QED_0k8", title: "Yutuqlarimda ustozlarim mehnati katta! | Xusnora" },
    { id: "ZiomV95lkLQ", title: "Albatta, barcha maqsadlarimga erishaman! | Shahzoda" },
    { id: "YuGpC1Sg11k", title: "IELTS insights with Mrs.Malika" },
  ];

  return (
    <div className="w-full pt-10 sm:pt-14">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-3.5">
              {t("results.header.title")}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {t("results.header.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Full-width Stats Band */}
      <ResultsStats />

      {/* Success Stories Grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white">
              {t("results.stories.title")}
            </h2>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
              {videos.length} ta video
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
