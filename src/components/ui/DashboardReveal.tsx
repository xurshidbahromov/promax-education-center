"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function DashboardReveal({ isLoading = false }: { isLoading?: boolean }) {
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsFinished(true);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isFinished) return null;

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="dashboard-notebook-pen-reveal"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoading ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.65,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none select-none overflow-hidden bg-slate-50/95 dark:bg-[#060b16]/98 backdrop-blur-3xl"
        >
          {/* Subtle Ambient Radial Light Aura */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.35, 0.55, 0.35],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-[32rem] h-[32rem] rounded-full bg-gradient-to-tr from-brand-blue/20 via-sky-400/15 to-brand-orange/20 blur-[110px]"
            />
          </div>

          {/* ── Main Creative Core ── */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ 
              scale: isLoading ? 1 : 1.04, 
              opacity: isLoading ? 1 : 0,
              y: isLoading ? 0 : -8
            }}
            transition={{
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="relative flex flex-col items-center gap-5 z-10 max-w-sm w-full px-4"
          >
            
            {/* ── Promax Logo Emblem ── */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center drop-shadow-[0_8px_20px_rgba(0,86,210,0.3)]"
            >
              <Image
                src="/Logo_without_sentence.png"
                alt="Promax Education"
                fill
                priority
                className="object-contain"
              />
            </motion.div>

            {/* ── Realistic Spiral Education Notebook (Daftar) ── */}
            <div className="relative w-full max-w-[340px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 border border-white/90 dark:border-slate-800/90 shadow-[0_20px_50px_rgba(0,86,210,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
              
              {/* Left Spiral Binder Rings (Daftar Spirallari) */}
              <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around py-3 z-20 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 shadow-inner" />
                    <div className="w-4 h-1 bg-gradient-to-r from-slate-400 to-slate-200 dark:from-slate-600 dark:to-slate-400 rounded-full -ml-1 shadow-sm" />
                  </div>
                ))}
              </div>

              {/* Vertical Notebook Red Margin Line (Daftar qizil hoshiyasi) */}
              <div className="absolute left-10 top-0 bottom-0 w-px bg-rose-400/40 dark:bg-rose-500/30 z-10" />

              {/* Notebook Header Line */}
              <div className="pl-8 pb-3 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60">
                <span className="text-[10px] font-extrabold tracking-widest text-brand-blue uppercase">
                  PROMAX DAFTARI
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  DARS § 1
                </span>
              </div>

              {/* Notebook Writing Area — 100% Unified SVG Coordinate System */}
              <div className="relative pl-8 pt-2 pb-1 h-28 flex items-center">
                
                <svg
                  viewBox="0 0 250 70"
                  className="w-full h-full overflow-visible"
                >
                  <defs>
                    <linearGradient id="promaxPenInk" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0056D2" />
                      <stop offset="60%" stopColor="#0284C7" />
                      <stop offset="100%" stopColor="#F97316" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Notebook Ruled Lines */}
                  <line x1="0" y1="12" x2="250" y2="12" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  <line x1="0" y1="35" x2="250" y2="35" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  <line x1="0" y1="58" x2="250" y2="58" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />

                  {/* The Drawn Ink Line — Smooth Flowing Wave */}
                  <motion.path
                    d="M 10 35 Q 45 15, 80 35 T 150 35 T 210 35 Q 228 20, 238 35"
                    fill="none"
                    stroke="url(#promaxPenInk)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: [0, 0.2, 0.5, 0.8, 1, 1, 0] }}
                    transition={{
                      duration: 2.6,
                      times: [0, 0.2, 0.5, 0.75, 0.9, 0.97, 1],
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* ── The Stylus / Fountain Pen (Exact Nib Tip (0,0) on Path) ── */}
                  <motion.g
                    initial={{ x: 10, y: 35, opacity: 0 }}
                    animate={{
                      x: [10, 45, 80, 115, 150, 180, 210, 238, 10],
                      y: [35, 15, 35, 15, 35, 15, 35, 35, 35],
                      opacity: [0, 1, 1, 1, 1, 1, 1, 0, 0]
                    }}
                    transition={{
                      duration: 2.6,
                      times: [0, 0.15, 0.35, 0.5, 0.65, 0.78, 0.88, 0.95, 1],
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {/* Pen Graphics: Origin (0,0) is EXACTLY the Nib Tip Point, slanted to the right */}
                    <g transform="rotate(40)">
                      {/* Golden Nib Body */}
                      <polygon points="0,0 -4,-12 4,-12" fill="#F59E0B" />
                      {/* Nib Slit & Breather Hole */}
                      <line x1="0" y1="0" x2="0" y2="-7" stroke="#78350F" strokeWidth="0.8" />
                      <circle cx="0" cy="-7" r="0.9" fill="#0056D2" />

                      {/* Pen Neck Collar */}
                      <rect x="-4.5" y="-15" width="9" height="3" fill="#0F172A" rx="0.5" />

                      {/* Pen Body (Promax Blue Gloss Metallic Barrel) */}
                      <polygon points="-4.5,-15 4.5,-15 5.5,-45 -5.5,-45" fill="#0056D2" />
                      
                      {/* Chrome Ring Trim */}
                      <rect x="-5" y="-30" width="10" height="2.5" fill="#E2E8F0" />
                      
                      {/* Brand Orange Accent Band */}
                      <rect x="-5.5" y="-42" width="11" height="3.5" fill="#F97316" rx="0.5" />
                    </g>
                  </motion.g>

                </svg>

              </div>
            </div>

            {/* ── Brand Typography ── */}
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 font-sans-pro tracking-[0.25em] uppercase leading-none">
                Promax
              </h1>
              
              <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-slate-500 dark:text-slate-400 mt-0.5">
                {isLoading ? "O'quvchi Kabineti" : "Tayyor"}
              </p>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
