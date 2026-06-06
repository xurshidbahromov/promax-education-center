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
                            <span className="text-red-500 font-bold uppercase tracking-widest">YouTube Channel</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none"
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
                        className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors group"
                    >
                        {t('home.youtube.view_channel')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
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
                            className="group relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden block transition-all duration-300 hover:-translate-y-1 shadow-md"
                        >
                            <Image
                                src={playlist.image}
                                alt="Playlist Thumbnail"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            />
                            
                            {/* Gradients */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/60 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Content */}
                            <div className="absolute inset-0 p-8 flex flex-col">
                                {/* Top Badge */}
                                <div className="self-end bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <ListVideo className="w-4 h-4 text-white" />
                                    <span className="text-white font-bold text-sm">{playlist.count} Videos</span>
                                </div>

                                {/* Bottom Info */}
                                <div className="mt-auto">
                                    <div className="w-16 h-16 bg-brand-blue text-white rounded-full flex items-center justify-center shadow-sm transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 mb-6 group-hover:bg-brand-blue/90">
                                        <Play className="w-6 h-6 ml-1" fill="currentColor" />
                                    </div>

                                    <h3 className="text-2xl font-black text-white uppercase tracking-wide leading-tight transition-colors duration-300">
                                        {t(playlist.titleKey)}
                                    </h3>
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
