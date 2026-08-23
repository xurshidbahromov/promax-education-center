"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function AdminReveal({ 
  isLoading = false,
  role = "admin"
}: { 
  isLoading?: boolean;
  role?: string;
}) {
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Only start the exit animation timer when loading has finished
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsFinished(true);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isFinished) return null;

  const roleLabel = role === 'teacher' ? "Ustoz Kabineti" : role === 'staff' ? "Xodim Portali" : "Boshqaruv Paneli";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex pointer-events-none overflow-hidden select-none">
        
        {/* Left Theme-Adaptive Glass Panel */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: isLoading ? 0 : "-100%" }}
          transition={{
            duration: 1.0,
            ease: [0.22, 1, 0.36, 1],
            delay: isLoading ? 0 : 0.8
          }}
          className="w-[calc(50%+1px)] h-full bg-slate-50/95 dark:bg-slate-950/98 backdrop-blur-2xl relative"
        />

        {/* Right Theme-Adaptive Glass Panel */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: isLoading ? 0 : "100%" }}
          transition={{
            duration: 1.0,
            ease: [0.22, 1, 0.36, 1],
            delay: isLoading ? 0 : 0.8
          }}
          className="w-[calc(50%+1px)] -ml-[1px] h-full bg-slate-50/95 dark:bg-slate-950/98 backdrop-blur-2xl relative"
        />

        {/* Center Content (Logo & Text - 1:1 Minimalist Match) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-50 mix-blend-normal"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ 
            opacity: isLoading ? 1 : 0, 
            scale: isLoading ? 1 : 1.1, 
            filter: isLoading ? "blur(0px)" : "blur(10px)" 
          }}
          transition={{ duration: 0.5, delay: isLoading ? 0 : 0.5 }}
        >
          <div className="relative flex flex-col items-center gap-6">
            {/* Logo Container - Minimalist without ugly borders */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center"
            >
              {/* Subtle Glow */}
              <div className="absolute inset-0 bg-brand-blue/20 dark:bg-brand-blue/15 rounded-full blur-2xl animate-pulse" />

              {/* Logo */}
              <div className="relative w-full h-full">
                <Image
                  src="/Logo_without_sentence.png"
                  alt="Promax Admin Logo"
                  fill
                  className="object-contain drop-shadow-[0_0_20px_rgba(0,86,210,0.3)]"
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
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-[0.2em] uppercase font-sans-pro">
                Promax
              </h2>
              <p className="text-brand-blue dark:text-blue-400 text-xs font-bold tracking-[0.4em] mt-2 uppercase animate-pulse">
                {isLoading ? "Yuklanmoqda..." : roleLabel}
              </p>
            </motion.div>

            {/* Bottom Loading Bar */}
            {isLoading && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 140, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"
              >
                <motion.div 
                  className="h-full bg-gradient-to-r from-brand-blue to-cyan-400 rounded-full"
                  animate={{ 
                    x: ["-100%", "100%"] 
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.2, 
                    ease: "easeInOut" 
                  }}
                  style={{ width: "60%" }}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
