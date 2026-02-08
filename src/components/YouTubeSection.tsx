"use client";

import { motion } from 'framer-motion';
import { Play, ArrowRight, ExternalLink, ListVideo } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const YouTubeSection = () => {
    const { t } = useLanguage();

    const playlists = [
        {
            id: 1,
            titleKey: 'youtube.playlist.1',
            thumbnail: 'bg-blue-100 dark:bg-blue-900',
            url: 'https://youtube.com/playlist?list=PLZkj58ihUphQdqPRS2N9ThZQ-wczfAENn&si=uRzBdbXXT--hVK7u',
            count: '20+'
        },
        {
            id: 2,
            titleKey: 'youtube.playlist.2',
            thumbnail: 'bg-orange-100 dark:bg-orange-900',
            url: 'https://youtube.com/playlist?list=PLZkj58ihUphTUtF59RLxhDSdHjEj0gYpa&si=-vrQS9W7rhKWEeR9',
            count: '50+'
        },
        {
            id: 3,
            titleKey: 'youtube.playlist.3',
            thumbnail: 'bg-purple-100 dark:bg-purple-900',
            url: 'https://youtube.com/playlist?list=PLZkj58ihUphRGyEIpjzV9b8bHrMASourQ&si=WpFuG4iGbhsPX_ms',
            count: '15+'
        }
    ];

    return (
        <section className="py-20 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4"
                    >
                        {t('home.youtube.title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                    >
                        {t('home.youtube.subtitle')}
                    </motion.p>
                </div>

                {/* Playlist Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {playlists.map((playlist, index) => (
                        <motion.a
                            key={playlist.id}
                            href={playlist.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group block relative"
                        >
                            {/* Playlist Stack Effect */}
                            <div className="absolute top-0 inset-x-4 -mt-2 h-4 bg-gray-200 dark:bg-slate-700 rounded-t-xl opacity-50 transform scale-90 group-hover:scale-95 group-hover:-mt-5 transition-all duration-500 ease-out" />
                            <div className="absolute top-0 inset-x-2 -mt-1 h-4 bg-gray-300 dark:bg-slate-600 rounded-t-xl opacity-70 transform scale-95 group-hover:scale-100 group-hover:-mt-3 transition-all duration-500 ease-out" />

                            {/* Main Card */}
                            <div className="relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 ease-out transform group-hover:-translate-y-2">
                                {/* Thumbnail Container */}
                                <div className={`relative aspect-video bg-gray-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden`}>
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-500" />

                                    {/* Playlist Overlay (Right Side) */}
                                    <div className="absolute inset-y-0 right-0 w-1/3 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-1 group-hover:w-2/5 transition-all duration-500">
                                        <ListVideo className="w-8 h-8 mb-1" />
                                        <span className="text-sm font-bold">{playlist.count}</span>
                                        <span className="text-xs uppercase tracking-wider opacity-80">Videos</span>
                                    </div>

                                    {/* Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-all duration-500">
                                            <Play className="w-6 h-6 text-brand-blue ml-1" fill="currentColor" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors mb-2 line-clamp-2 uppercase">
                                        {t(playlist.titleKey)}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        <span className="flex items-center group-hover:text-brand-orange transition-colors">
                                            View Playlist <ExternalLink className="w-3 h-3 ml-1" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </div>

                {/* View Channel Button */}
                <div className="text-center">
                    <motion.a
                        href="https://www.youtube.com/@PROMAXEDUCATION/playlists"
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="group inline-flex items-center gap-2 bg-red-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-100 dark:shadow-none hover:shadow-2xl hover:shadow-red-200 active:scale-95"
                    >
                        {t('home.youtube.view_channel')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                </div>

            </div>
        </section>
    );
};

export default YouTubeSection;
