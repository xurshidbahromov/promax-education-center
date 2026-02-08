"use client";

import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { Users, GraduationCap, Briefcase, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

// Animated Counter Component
const Counter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) => Math.round(current));

    useEffect(() => {
        if (inView) {
            spring.set(value);
        }
    }, [inView, value, spring]);

    const [currentValue, setCurrentValue] = useState(0);

    useEffect(() => {
        const unsubscribe = display.on("change", (v) => setCurrentValue(v));
        return unsubscribe;
    }, [display]);

    return <span ref={ref}>{currentValue}{suffix}</span>;
};

const ResultsStats = () => {
    const { t } = useLanguage();

    const stats = [
        {
            id: "students",
            icon: Users,
            value: 5000,
            suffix: "+",
            color: "text-blue-500",
            bg: "bg-blue-100/10",
            gradient: "from-blue-400 to-blue-600"
        },
        {
            id: "experience",
            icon: Briefcase,
            value: 10,
            suffix: "+",
            color: "text-orange-500",
            bg: "bg-orange-100/10",
            gradient: "from-orange-400 to-orange-600"
        },
        {
            id: "teachers",
            icon: GraduationCap,
            value: 30,
            suffix: "+",
            color: "text-purple-500",
            bg: "bg-purple-100/10",
            gradient: "from-purple-400 to-purple-600"
        },
        {
            id: "acceptance",
            icon: Trophy,
            value: 98,
            suffix: "%",
            color: "text-green-500",
            bg: "bg-green-100/10",
            gradient: "from-green-400 to-green-600"
        }
    ];

    return (
        <section className="py-24 relative overflow-hidden bg-transparent">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-brand-blue/20 blur-[120px] rounded-full opacity-30 mix-blend-screen" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="relative group p-6 md:p-8 rounded-3xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/5 backdrop-blur-md overflow-hidden hover:border-brand-blue/30 dark:hover:border-white/20 transition-all duration-300 shadow-sm hover:shadow-xl"
                        >
                            {/* Subtle Gradient Glow */}
                            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${stat.gradient} opacity-10 dark:opacity-20 blur-3xl group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity duration-500 rounded-full pointer-events-none`} />

                            <div className="relative z-10 flex flex-col items-center text-center">
                                {/* Icon with Colored Background */}
                                <div className={`mb-5 p-4 rounded-2xl ${stat.bg} ${stat.color} ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon size={28} strokeWidth={2} />
                                </div>

                                {/* Number */}
                                <h3 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                                    <Counter value={stat.value} suffix={stat.suffix} />
                                </h3>

                                {/* Label */}
                                <p className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm uppercase tracking-wider">
                                    {t(`home.stats.${stat.id}`)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default ResultsStats;
