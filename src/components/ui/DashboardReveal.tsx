"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

const DashboardReveal = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2200);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex pointer-events-none">

                {/* Left Glass Panel */}
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-100%" }}
                    transition={{
                        duration: 1.0,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 1.2
                    }}
                    className="w-1/2 h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-r border-white/20 dark:border-white/10 relative"
                >
                </motion.div>

                {/* Right Glass Panel */}
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "100%" }}
                    transition={{
                        duration: 1.0,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 1.2
                    }}
                    className="w-1/2 h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-l border-white/20 dark:border-white/10 relative"
                >
                </motion.div>

                {/* Center Content (Logo) */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center z-50 mix-blend-normal"
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                >
                    <div className="relative flex flex-col items-center gap-6">
                        {/* Logo Container */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center"
                        >
                            {/* Subtle Glow */}
                            <div className="absolute inset-0 bg-brand-blue/20 dark:bg-brand-blue/10 rounded-full blur-2xl animate-pulse"></div>

                            {/* Logo */}
                            <div className="relative w-full h-full drop-shadow-2xl">
                                <Image
                                    src="/Logo_without_sentence.png"
                                    alt="Promax Education Center Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </motion.div>

                        {/* Text */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-center"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-[0.2em] uppercase">
                                Promax
                            </h2>
                            <p className="text-brand-blue text-xs font-medium tracking-[0.4em] mt-2 uppercase">
                                Education
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DashboardReveal;
