"use client";

import { motion } from "framer-motion";
import { Users, GraduationCap, Briefcase, Trophy, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ResultsStats = () => {
    const { t } = useLanguage();

    const stats = [
        {
            id: "students",
            icon: Users,
            value: "5000+",
        },
        {
            id: "experience",
            icon: Briefcase,
            value: "10+",
        },
        {
            id: "teachers",
            icon: GraduationCap,
            value: "30+",
        },
        {
            id: "acceptance",
            icon: Trophy,
            value: "98%",
        }
    ];

    // Double the stats array to create a seamless infinite loop
    const marqueeItems = [...stats, ...stats, ...stats, ...stats];

    return (
        <section className="py-32 relative overflow-hidden bg-brand-blue flex flex-col justify-center">
            
            {/* Background Texture / Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="relative z-10 mb-12 px-4 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white uppercase tracking-tighter font-fredoka"
                >
                    PROMAX <span className="text-brand-orange">NUMBERS</span>
                </motion.h2>
            </div>

            {/* Infinite Marquee Container */}
            <div className="relative z-10 flex overflow-hidden whitespace-nowrap w-full py-10 rotate-[-2deg] bg-brand-orange shadow-2xl">
                
                {/* Framer Motion Infinite Scroll */}
                <motion.div
                    className="flex items-center gap-16 md:gap-24 px-8"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        duration: 30,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                >
                    {marqueeItems.map((stat, index) => (
                        <div key={`${stat.id}-${index}`} className="flex items-center gap-6">
                            <h3 className="text-6xl md:text-8xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
                                {stat.value}
                            </h3>
                            <div className="flex flex-col items-start justify-center gap-1">
                                <span className="text-white/90 font-bold text-xl md:text-2xl uppercase tracking-widest">
                                    {t(`home.stats.${stat.id}`)}
                                </span>
                                <stat.icon className="w-8 h-8 md:w-10 md:h-10 text-white/80" strokeWidth={2.5} />
                            </div>
                            <Star className="w-8 h-8 text-brand-blue/50 mx-8 fill-current" />
                        </div>
                    ))}
                </motion.div>

            </div>
            
            {/* Secondary Marquee (Reverse Direction) for extra vibe */}
            <div className="relative z-0 flex overflow-hidden whitespace-nowrap w-full py-6 mt-12 opacity-40">
                <motion.div
                    className="flex items-center gap-12 px-8"
                    animate={{ x: ["-50%", "0%"] }}
                    transition={{
                        duration: 40,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                >
                    {marqueeItems.map((stat, index) => (
                        <h3 key={`secondary-${stat.id}-${index}`} className="text-7xl md:text-[10rem] font-black text-transparent bg-clip-text tracking-tighter" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.2)' }}>
                            {t(`home.stats.${stat.id}`)} {stat.value}
                        </h3>
                    ))}
                </motion.div>
            </div>

        </section>
    );
};

export default ResultsStats;
