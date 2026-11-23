"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const INK_PATH = "M 10 35 Q 45 11, 80 35 T 150 35 T 220 35 Q 232 25, 240 35";

export default function DashboardReveal({ isLoading = false }: { isLoading?: boolean }) {
  const [isFinished, setIsFinished] = useState(false);
  const pathRef = useRef<SVGPathElement | null>(null);
  const penRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsFinished(true);
      }, 680);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // 100% pixel-perfect sync between ink stroke tip and pen nib via SVG getPointAtLength
  useEffect(() => {
    if (isFinished) return;
    let rafId = 0;
    let startTs: number | null = null;
    const CYCLE_MS = 2400; // 0..0.78 draw, 0.78..0.90 hold, 0.90..1.00 fade & reset
    let cachedLength = 0;
    let endPt: DOMPoint | null = null;

    const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

    const tick = (now: number) => {
      if (startTs === null) startTs = now;
      const elapsed = (now - startTs) % CYCLE_MS;
      const norm = elapsed / CYCLE_MS;

      const pathEl = pathRef.current;
      const penEl = penRef.current;

      if (pathEl && penEl) {
        if (cachedLength === 0) {
          cachedLength = pathEl.getTotalLength();
          pathEl.style.strokeDasharray = `${cachedLength}`;
          endPt = pathEl.getPointAtLength(cachedLength);
        }

        if (norm < 0.78) {
          // Drawing phase: pen nib stays locked 1:1 to exact leading point of the ink path
          const drawT = easeInOutSine(norm / 0.78);
          const dist = drawT * cachedLength;
          const pt = pathEl.getPointAtLength(dist);
          const fadeIn = Math.min(1, norm / 0.08);

          pathEl.style.strokeDashoffset = `${(cachedLength - dist).toFixed(1)}`;
          pathEl.style.opacity = "1";
          penEl.setAttribute("transform", `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`);
          penEl.style.opacity = `${fadeIn.toFixed(2)}`;
        } else if (norm < 0.9 && endPt) {
          // Hold completed line briefly, lift pen gently
          const holdT = (norm - 0.78) / 0.12;
          pathEl.style.strokeDashoffset = "0";
          pathEl.style.opacity = "1";
          penEl.setAttribute(
            "transform",
            `translate(${endPt.x.toFixed(2)}, ${(endPt.y - holdT * 6).toFixed(2)})`
          );
          penEl.style.opacity = `${Math.max(0, 1 - holdT * 1.4).toFixed(2)}`;
        } else {
          // Smoothly fade out ink before next cycle
          const fadeOut = 1 - (norm - 0.9) / 0.1;
          pathEl.style.strokeDashoffset = "0";
          pathEl.style.opacity = `${Math.max(0, fadeOut).toFixed(2)}`;
          penEl.style.opacity = "0";
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isFinished]);

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
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none select-none overflow-hidden bg-slate-50 dark:bg-[#060b16]"
        >
          {/* Lightweight CSS radial aura (zero GPU blur filter) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(0,86,210,0.10) 0%, rgba(249,115,22,0.06) 35%, transparent 70%)",
            }}
          />

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
            <div className="relative w-full max-w-[340px] bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
              
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

                  {/* The Drawn Ink Line — Driven 1:1 with Pen Nib via getPointAtLength */}
                  <path
                    ref={pathRef}
                    d={INK_PATH}
                    fill="none"
                    stroke="url(#promaxPenInk)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ strokeDasharray: 400, strokeDashoffset: 400 }}
                  />

                  {/* ── The Stylus / Fountain Pen (Exact Nib Tip (0,0) locked to Path) ── */}
                  <g ref={penRef} transform="translate(10, 35)" style={{ opacity: 0 }}>
                    {/* Pen Graphics: Origin (0,0) is EXACTLY the Nib Tip Point, slanted to the right */}
                    <g transform="rotate(38)">
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
                  </g>

                </svg>

              </div>
            </div>

            {/* ── Brand Typography ── */}
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-brand tracking-[0.16em] uppercase leading-none">
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
