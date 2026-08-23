"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

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
        {/* Left Dark Glass Panel */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: isLoading ? 0 : "-100%" }}
          transition={{
            duration: 1.0,
            ease: [0.22, 1, 0.36, 1],
            delay: isLoading ? 0 : 0.8
          }}
          className="w-[calc(50%+1px)] h-full bg-slate-950/95 dark:bg-slate-950/98 backdrop-blur-2xl relative"
        >
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
        </motion.div>

        {/* Right Dark Glass Panel */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: isLoading ? 0 : "100%" }}
          transition={{
            duration: 1.0,
            ease: [0.22, 1, 0.36, 1],
            delay: isLoading ? 0 : 0.8
          }}
          className="w-[calc(50%+1px)] -ml-[1px] h-full bg-slate-950/95 dark:bg-slate-950/98 backdrop-blur-2xl relative"
        >
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
        </motion.div>

        {/* Center Content (Admin Branding & Logo) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-50 mix-blend-normal"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ 
            opacity: isLoading ? 1 : 0, 
            scale: isLoading ? 1 : 1.08, 
            filter: isLoading ? "blur(0px)" : "blur(10px)" 
          }}
          transition={{ duration: 0.5, delay: isLoading ? 0 : 0.5 }}
        >
          <div className="relative flex flex-col items-center gap-6 px-4">
            {/* Ambient Backlight */}
            <div className="absolute -top-10 w-48 h-48 bg-brand-blue/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Logo Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center"
            >
              {/* Outer Pulsing Ring */}
              <div className="absolute inset-0 rounded-3xl border border-brand-blue/30 bg-brand-blue/5 animate-pulse" />
              <div className="absolute -inset-2 rounded-[2rem] border border-blue-500/20 blur-sm animate-pulse" />

              {/* Logo */}
              <div className="relative w-20 h-20 md:w-24 md:h-24">
                <Image
                  src="/Logo_without_sentence.png"
                  alt="Promax Admin Logo"
                  fill
                  className="object-contain drop-shadow-[0_0_20px_rgba(0,86,210,0.4)]"
                  priority
                />
              </div>
            </motion.div>

            {/* Typography & Status */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-center space-y-2.5"
            >
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-[0.2em] uppercase font-sans-pro">
                  Promax
                </h2>
                <span className="px-2 py-0.5 rounded-lg bg-brand-blue/20 border border-brand-blue/40 text-[10px] md:text-xs font-black uppercase text-brand-blue tracking-wider">
                  Admin
                </span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400 animate-pulse" />
                <p className="text-slate-400 text-xs md:text-[13px] font-semibold tracking-[0.25em] uppercase">
                  {isLoading ? "Tizim yuklanmoqda..." : roleLabel}
                </p>
              </div>
            </motion.div>

            {/* Bottom Subtle Loading Bar */}
            {isLoading && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 140, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-1 bg-slate-800 rounded-full overflow-hidden"
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
