"use client";

import { motion } from "framer-motion";

export const Background = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            {/* Base Gradient - Vivid Colors */}
            <div
                className="absolute inset-0 opacity-40 dark:opacity-30"
                style={{
                    background: 'linear-gradient(90deg, rgba(235, 124, 14, 1) 0%, rgba(25, 110, 230, 1) 100%, rgba(5, 60, 240, 1) 100%)'
                }}
            />

            {/* Glassy Blur / Diffusion Layer - Mutes the brightness for minimalism */}
            <div className="absolute inset-0 backdrop-blur-[100px] bg-white/30 dark:bg-[#020617]/80" />

            {/* Noise for texture */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
        </div>
    );
};
