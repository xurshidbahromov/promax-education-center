"use client";

import { motion } from "framer-motion";
import { Play, ArrowRight, Youtube, ListVideo } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";

const YouTubeSection = () => {
  const { t } = useLanguage();

  const playlists = [
    {
      id: 1,
      titleKey: "youtube.playlist.1",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
      url: "https://youtube.com/playlist?list=PLZkj58ihUphQdqPRS2N9ThZQ-wczfAENn&si=uRzBdbXXT--hVK7u",
      count: "20+",
    },
    {
      id: 2,
      titleKey: "youtube.playlist.2",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
      url: "https://youtube.com/playlist?list=PLZkj58ihUphTUtF59RLxhDSdHjEj0gYpa&si=-vrQS9W7rhKWEeR9",
      count: "10+",
    },
    {
      id: 3,
      titleKey: "youtube.playlist.3",
      image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800&auto=format&fit=crop",
      url: "https://youtube.com/playlist?list=PLZkj58ihUphRGyEIpjzV9b8bHrMASourQ&si=WpFuG4iGbhsPX_ms",
      count: "25+",
    },
  ];

  return (
    <section className="pt-20 md:pt-28 pb-16 relative px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center text-center md:items-end md:text-left justify-between mb-14 gap-6">
          <div className="max-w-2xl flex flex-col items-center md:items-start">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold uppercase tracking-wider mb-4"
            >
              <Youtube className="w-4 h-4" />
              <span>YouTube Channel</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-3xl sm:text-4xl md:text-5xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-[1.1]"
            >
              {t("home.youtube.title")}
            </motion.h2>
          </div>

          <motion.a
            href="https://youtube.com/@promaxeducation"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 font-semibold text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors group shrink-0"
          >
            <span>{t("home.youtube.view_channel")}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </motion.a>
        </div>

        {/* Playlist Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-7">
          {playlists.map((playlist, index) => (
            <motion.a
              key={playlist.id}
              href={playlist.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group block w-full mt-5 relative"
            >
              {/* Clean Stack Layers */}
              <div className="absolute -top-3 left-6 right-6 bottom-0 bg-slate-200/80 dark:bg-slate-800/70 rounded-[26px] transition-all duration-300 group-hover:-top-4 opacity-50 z-0 border border-slate-300/50 dark:border-slate-700/50" />
              <div className="absolute -top-1.5 left-3 right-3 bottom-0 bg-slate-300/70 dark:bg-slate-800/90 rounded-[26px] transition-all duration-300 group-hover:-top-2 opacity-70 z-0 border border-slate-300/60 dark:border-slate-700/60" />

              {/* Main Solid Card */}
              <div className="relative w-full rounded-[26px] overflow-hidden z-10 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 group-hover:border-red-500/40 transition-all duration-200">
                {/* Thumbnail */}
                <div className="relative w-full aspect-[16/10] sm:aspect-video overflow-hidden bg-slate-900">
                  <Image
                    src={playlist.image}
                    alt={t(playlist.titleKey)}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Right Side Overlay */}
                  <div className="absolute top-0 right-0 bottom-0 w-[34%] sm:w-[30%] bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center text-white border-l border-white/10 tabular-nums">
                    <ListVideo className="w-6 h-6 sm:w-7 sm:h-7 mb-1 opacity-90" />
                    <span className="font-bold text-lg sm:text-xl font-sans">{playlist.count}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest opacity-80 mt-0.5">
                      Videolar
                    </span>
                  </div>

                  {/* Hover Play All Overlay */}
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-semibold text-xs tracking-wider shadow-lg">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>PLAY ALL</span>
                    </div>
                  </div>
                </div>

                {/* Text Info */}
                <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-base sm:text-lg font-semibold font-sans tracking-tight text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {t(playlist.titleKey)}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span>YouTube Playlist</span>
                  </p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;
