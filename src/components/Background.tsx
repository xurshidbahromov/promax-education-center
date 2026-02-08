"use client";

import { motion } from "framer-motion";

export const Background = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Educational Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            {/* Floating Orbs - Blue & White Theme */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">

                {/* Top Left - Blue Primary */}
                <motion.div
                    initial={{ opacity: 0.5, scale: 0.8 }}
                    animate={{
                        opacity: [0.4, 0.6, 0.4],
                        scale: [1, 1.2, 1],
                        x: [-20, 20, -20],
                        y: [-20, 20, -20]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-brand-blue/10 dark:bg-brand-blue/20 rounded-full blur-[100px]"
                />

                {/* Bottom Right - Orange Accent (Subtle) */}
                <motion.div
                    initial={{ opacity: 0.3, scale: 0.8 }}
                    animate={{
                        opacity: [0.3, 0.5, 0.3],
                        scale: [1, 1.1, 1],
                        x: [20, -20, 20],
                        y: [20, -20, 20]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute top-[20%] -right-[10%] w-[500px] h-[500px] bg-brand-orange/5 dark:bg-brand-orange/10 rounded-full blur-[120px]"
                />

                {/* Center - White/Light for "Behind Mirror" Effect in Dark Mode */}
                <motion.div
                    animate={{
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[90px]"
                />
            </div>

            {/* Radial Gradient Overlay to soften edges */}
            <div className="absolute inset-0 bg-white/30 dark:bg-slate-950/30 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        </div>
    );
};
