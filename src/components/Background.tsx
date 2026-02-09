"use client";

import { motion } from "framer-motion";

export const Background = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            {/* Base Gradient - Vivid Colors */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(100deg, rgba(235, 124, 14, 0.7) 0%, rgba(219, 222, 255, 0.7) 50%, rgba(3, 44, 128, 0.7) 100%)'
                }}
            />

            {/* Glassy Blur / Diffusion Layer - Mutes the brightness for minimalism */}
            <div className="absolute inset-0 backdrop-blur-[100px] bg-white/30 dark:bg-[#020617]/80" />

            {/* Noise for texture */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
        </div>
    );
};
