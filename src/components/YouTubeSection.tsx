"use client";

import { motion } from 'framer-motion';
import { Play, ArrowRight, Youtube, ListVideo } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';

const YouTubeSection = () => {
 const { t } = useLanguage();

 const playlists = [
 {
 id: 1,
 titleKey: 'youtube.playlist.1',
 image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
 url: 'https://youtube.com/playlist?list=PLZkj58ihUphQdqPRS2N9ThZQ-wczfAENn&si=uRzBdbXXT--hVK7u',
 count: '20+'
 },
 {
 id: 2,
 titleKey: 'youtube.playlist.2',
 image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
 url: 'https://youtube.com/playlist?list=PLZkj58ihUphTUtF59RLxhDSdHjEj0gYpa&si=-vrQS9W7rhKWEeR9',
 count: '10+'
 },
 {
 id: 3,
 titleKey: 'youtube.playlist.3',
 image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800&auto=format&fit=crop',
 url: 'https://youtube.com/playlist?list=PLZkj58ihUphRGyEIpjzV9b8bHrMASourQ&si=WpFuG4iGbhsPX_ms',
 count: '25+'
 }
 ];

 return (
 <section className="pt-32 pb-16 relative px-4 sm:px-6 lg:px-8">
 {/* Background Accents */}
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/20 rounded-full blur-[120px] pointer-events-none" />
 <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none" />

 <div className="max-w-7xl mx-auto w-full relative z-10">

 {/* Header */}
 <div className="flex flex-col md:flex-row items-center text-center md:items-end md:text-left justify-between mb-16 gap-8">
 <div className="max-w-2xl flex flex-col items-center md:items-start">
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 className="flex items-center gap-3 mb-4"
 >
 <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
 <Youtube className="w-6 h-6 text-white" />
 </div>
 <span className="text-red-500 font-medium uppercase tracking-widest">YouTube Channel</span>
 </motion.div>
 <motion.h2
 initial={{ opacity: 0, x: -20 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 transition={{ delay: 0.1 }}
 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-tighter leading-none font-fredoka"
 >
 {t('home.youtube.title')}
 </motion.h2>
 </div>

 <motion.a
 href="https://youtube.com/@promaxeducation"
 target="_blank"
 rel="noopener noreferrer"
 initial={{ opacity: 0, x: 20 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 className="inline-flex items-center gap-2 font-medium uppercase tracking-wider text-red-600 dark:text-red-500 hover:text-red-700 active:text-red-700 dark:hover:text-red-400 active:text-red-400 transition-colors group"
 >
 {t('home.youtube.view_channel')}
 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 active:scale-95 transition-transform duration-300 ease-out" />
 </motion.a>
 </div>

 {/* Playlist Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
 {playlists.map((playlist, index) => (
          <motion.a
            key={playlist.id}
            href={playlist.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            className="group block w-full mt-8 relative"
          >
            {/* Stack Layers (Behind the entire card) */}
            <div className="absolute -top-3.5 left-6 right-6 bottom-0 bg-slate-200/70 dark:bg-slate-800/70 rounded-[2rem] transition-all duration-300 group-hover:-top-5 opacity-40 z-0 border border-slate-300/40 dark:border-slate-700/40" />
            <div className="absolute -top-1.5 left-3 right-3 bottom-0 bg-slate-300/70 dark:bg-slate-750/70 rounded-[2rem] transition-all duration-300 group-hover:-top-2.5 opacity-60 z-0 border border-slate-300/60 dark:border-slate-700/60" />

            {/* Main Card (Integrates both thumbnail and text) */}
            <div className="relative w-full rounded-[2rem] overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/70 dark:border-white/10">
              {/* Thumbnail area */}
              <div className="relative w-full aspect-[16/10] sm:aspect-video overflow-hidden bg-slate-900">
                <Image
                  src={playlist.image}
                  alt="Playlist Thumbnail"
                  fill
                  className="object-cover"
                />
                
                {/* Right Side Overlay (YouTube Style) */}
                <div className="absolute top-0 right-0 bottom-0 w-[35%] sm:w-[30%] bg-black/65 backdrop-blur-md flex flex-col items-center justify-center text-white transition-all duration-300 border-l border-white/10">
                  <ListVideo className="w-7 h-7 sm:w-9 sm:h-9 mb-1.5 opacity-90" />
                  <span className="font-bold text-lg sm:text-xl font-fredoka">{playlist.count}</span>
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest opacity-80 mt-0.5">Videolar</span>
                </div>

                {/* Hover Play All Overlay */}
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                  <div className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full font-bold text-xs tracking-wider shadow-lg">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>PLAY ALL</span>
                  </div>
                </div>
              </div>

              {/* Integrated Text Information */}
              <div className="p-6 bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm border-t border-white/60 dark:border-white/10">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 leading-snug font-fredoka line-clamp-2">
                  {t(playlist.titleKey)}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
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
