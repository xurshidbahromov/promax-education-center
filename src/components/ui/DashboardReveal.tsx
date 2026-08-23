"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function DashboardReveal({ isLoading = false }: { isLoading?: boolean }) {
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex pointer-events-none overflow-hidden select-none">

        {/* Left Glass Panel - Seamless No Seam/Border */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: isLoading ? 0 : "-100%" }}
          transition={{
            duration: 1.0,
            ease: [0.22, 1, 0.36, 1],
            delay: isLoading ? 0 : 0.8
          }}
          className="w-[calc(50%+1px)] h-full bg-slate-900/95 dark:bg-slate-950/98 backdrop-blur-2xl relative"
        />

        {/* Right Glass Panel - Seamless No Seam/Border */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: isLoading ? 0 : "100%" }}
          transition={{
            duration: 1.0,
            ease: [0.22, 1, 0.36, 1],
            delay: isLoading ? 0 : 0.8
          }}
          className="w-[calc(50%+1px)] -ml-[1px] h-full bg-slate-900/95 dark:bg-slate-950/98 backdrop-blur-2xl relative"
        />

        {/* Center Content (Logo) */}
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
            {/* Logo Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center"
            >
              {/* Subtle Glow */}
              <div className="absolute inset-0 bg-brand-blue/20 dark:bg-brand-blue/10 rounded-full blur-2xl animate-pulse" />

              {/* Logo */}
              <div className="relative w-full h-full">
                <Image
                  src="/Logo_without_sentence.png"
                  alt="Promax Education Center Logo"
                  fill
                  className="object-contain drop-shadow-[0_0_20px_rgba(0,86,210,0.35)]"
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
              <h2 className="text-2xl font-black text-white tracking-[0.2em] uppercase font-sans-pro">
                Promax
              </h2>
              <p className="text-brand-blue text-xs font-bold tracking-[0.4em] mt-2 uppercase animate-pulse">
                {isLoading ? "Yuklanmoqda..." : "O'quvchi Kabineti"}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
