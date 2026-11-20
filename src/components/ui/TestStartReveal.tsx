"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { soundFx } from "@/lib/sound-effects";

interface TestStartRevealProps {
  isLoading?: boolean;
  title?: string;
  modeLabel?: string;
}

// 3 rows of OMR answer sheet bubbles inside a unified 250x104 SVG coordinate system
const ROWS = [
  { num: "01", y: 20, targetIndex: 1 }, // B
  { num: "02", y: 52, targetIndex: 3 }, // D
  { num: "03", y: 84, targetIndex: 0 }, // A
];
const LETTERS = ["A", "B", "C", "D"];
const COL_X = [64, 114, 164, 214];

export default function TestStartReveal({
  isLoading = false,
  title,
  modeLabel = "TITUL VARAQASI",
}: TestStartRevealProps) {
  const [isFinished, setIsFinished] = useState(false);
  const penRef = useRef<SVGGElement | null>(null);
  const fillRefs = useRef<(SVGCircleElement | null)[]>([null, null, null]);
  const playedReadySoundRef = useRef(false);

  useEffect(() => {
    if (!isLoading) {
      if (!playedReadySoundRef.current) {
        playedReadySoundRef.current = true;
        soundFx.playModalOpen();
      }
      const timer = setTimeout(() => {
        setIsFinished(true);
      }, 1150);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // 100% mathematically locked OMR bubble-filling pen animation
  useEffect(() => {
    if (isFinished) return;
    let rafId = 0;
    let startTs: number | null = null;
    const CYCLE_MS = 2400; // 3 bubbles × ~660ms + hold/reset

    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const targets = ROWS.map((r) => ({
      x: COL_X[r.targetIndex],
      y: r.y,
    }));

    const tick = (now: number) => {
      if (startTs === null) startTs = now;
      const norm = ((now - startTs) % CYCLE_MS) / CYCLE_MS;
      const penEl = penRef.current;

      if (penEl) {
        // Phase map:
        // [0.00 - 0.28] Row 1 fill
        // [0.28 - 0.56] Glide to Row 2 & fill
        // [0.56 - 0.84] Glide to Row 3 & fill
        // [0.84 - 1.00] Hold & smooth reset
        let px = targets[0].x;
        let py = targets[0].y;
        let penOpacity = 1;

        const fills = [0, 0, 0];

        if (norm < 0.28) {
          const local = norm / 0.28;
          const angle = local * Math.PI * 2;
          const radius = local < 0.85 ? 2.8 * (1 - local * 0.4) : 0;
          px = targets[0].x + Math.cos(angle) * radius;
          py = targets[0].y + Math.sin(angle) * radius;
          fills[0] = Math.min(1, local / 0.8);
          penOpacity = Math.min(1, local / 0.15);
        } else if (norm < 0.56) {
          fills[0] = 1;
          const local = (norm - 0.28) / 0.28;
          if (local < 0.35) {
            const g = easeInOut(local / 0.35);
            px = targets[0].x + (targets[1].x - targets[0].x) * g;
            py = targets[0].y + (targets[1].y - targets[0].y) * g - Math.sin(g * Math.PI) * 7;
          } else {
            const f = (local - 0.35) / 0.65;
            const angle = f * Math.PI * 2;
            const radius = f < 0.85 ? 2.8 * (1 - f * 0.4) : 0;
            px = targets[1].x + Math.cos(angle) * radius;
            py = targets[1].y + Math.sin(angle) * radius;
            fills[1] = Math.min(1, f / 0.8);
          }
        } else if (norm < 0.84) {
          fills[0] = 1;
          fills[1] = 1;
          const local = (norm - 0.56) / 0.28;
          if (local < 0.35) {
            const g = easeInOut(local / 0.35);
            px = targets[1].x + (targets[2].x - targets[1].x) * g;
            py = targets[1].y + (targets[2].y - targets[1].y) * g - Math.sin(g * Math.PI) * 7;
          } else {
            const f = (local - 0.35) / 0.65;
            const angle = f * Math.PI * 2;
            const radius = f < 0.85 ? 2.8 * (1 - f * 0.4) : 0;
            px = targets[2].x + Math.cos(angle) * radius;
            py = targets[2].y + Math.sin(angle) * radius;
            fills[2] = Math.min(1, f / 0.8);
          }
        } else {
          const hold = (norm - 0.84) / 0.16;
          const fade = hold > 0.5 ? Math.max(0, 1 - (hold - 0.5) / 0.5) : 1;
          fills[0] = fade;
          fills[1] = fade;
          fills[2] = fade;
          px = targets[2].x;
          py = targets[2].y - hold * 8;
          penOpacity = Math.max(0, 1 - hold * 1.6);
        }

        penEl.setAttribute("transform", `translate(${px.toFixed(2)}, ${py.toFixed(2)})`);
        penEl.style.opacity = `${penOpacity}`;

        fills.forEach((v, idx) => {
          const el = fillRefs.current[idx];
          if (el) {
            el.setAttribute("r", (v * 9.5).toFixed(2));
            el.style.opacity = `${Math.min(1, v * 1.15)}`;
          }
        });
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
          key="test-start-omr-reveal"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoading ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[120] flex items-center justify-center pointer-events-none select-none overflow-hidden bg-slate-50/95 dark:bg-[#060b16]/98 backdrop-blur-3xl"
        >
          {/* Ambient Radial Aura */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-[30rem] h-[30rem] rounded-full bg-gradient-to-tr from-brand-blue/20 via-sky-400/15 to-amber-500/20 blur-[110px]"
            />
          </div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{
              scale: isLoading ? 1 : 1.03,
              opacity: isLoading ? 1 : 0,
              y: isLoading ? 0 : -8,
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center gap-5 z-10 max-w-sm w-full px-4"
          >
            {/* Promax Logo Emblem */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center drop-shadow-[0_8px_20px_rgba(0,86,210,0.28)]"
            >
              <Image
                src="/Logo_without_sentence.png"
                alt="Promax Education"
                fill
                priority
                className="object-contain"
              />
            </motion.div>

            {/* ── Realistic OMR Exam Answer Sheet (Titul Varaqasi) ── */}
            <div className="relative w-full max-w-[340px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 border border-white/90 dark:border-slate-800/90 shadow-[0_20px_50px_rgba(0,86,210,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
              {/* Top Barcode-like Exam Registration Strip */}
              <div className="pb-3 mb-2 flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800/70">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-extrabold tracking-widest text-brand-blue uppercase">
                    {modeLabel}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-extrabold uppercase tracking-wider">
                  PROMAX
                </span>
              </div>

              {/* Unified SVG Coordinate System: 3 OMR Bubble Rows + Fountain Pen */}
              <div className="relative pt-1 pb-0.5">
                <svg viewBox="0 0 250 104" className="w-full h-auto overflow-visible">
                  <defs>
                    <linearGradient id="omrInkFill" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0056D2" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>

                  {ROWS.map((row, rowIdx) => (
                    <g key={row.num}>
                      {/* Question number label */}
                      <text
                        x="18"
                        y={row.y + 4}
                        fontSize="11"
                        fontWeight="800"
                        fill="currentColor"
                        className="text-slate-400 dark:text-slate-500"
                        style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
                      >
                        {row.num}
                      </text>

                      {/* 4 Answer Bubbles (A B C D) */}
                      {LETTERS.map((letter, colIdx) => {
                        const cx = COL_X[colIdx];
                        const isTarget = colIdx === row.targetIndex;
                        return (
                          <g key={letter}>
                            <circle
                              cx={cx}
                              cy={row.y}
                              r="10.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              className="text-slate-300 dark:text-slate-700"
                            />
                            <text
                              x={cx}
                              y={row.y + 3.5}
                              textAnchor="middle"
                              fontSize="9.5"
                              fontWeight="700"
                              fill="currentColor"
                              className="text-slate-400 dark:text-slate-500"
                            >
                              {letter}
                            </text>
                            {isTarget && (
                              <circle
                                ref={(el) => {
                                  fillRefs.current[rowIdx] = el;
                                }}
                                cx={cx}
                                cy={row.y}
                                r="0"
                                fill="url(#omrInkFill)"
                                style={{ opacity: 0 }}
                              />
                            )}
                          </g>
                        );
                      })}
                    </g>
                  ))}

                  {/* Promax Fountain Pen (Nib tip (0,0) locked 1:1 to bubble center) */}
                  <g ref={penRef} transform={`translate(${COL_X[1]}, ${ROWS[0].y})`} style={{ opacity: 0 }}>
                    <g transform="rotate(38)">
                      <polygon points="0,0 -4,-12 4,-12" fill="#F59E0B" />
                      <line x1="0" y1="0" x2="0" y2="-7" stroke="#78350F" strokeWidth="0.8" />
                      <circle cx="0" cy="-7" r="0.9" fill="#0056D2" />
                      <rect x="-4.5" y="-15" width="9" height="3" fill="#0F172A" rx="0.5" />
                      <polygon points="-4.5,-15 4.5,-15 5.5,-45 -5.5,-45" fill="#0056D2" />
                      <rect x="-5" y="-30" width="10" height="2.5" fill="#E2E8F0" />
                      <rect x="-5.5" y="-42" width="11" height="3.5" fill="#F97316" rx="0.5" />
                    </g>
                  </g>
                </svg>
              </div>
            </div>

            {/* Test Title & Status */}
            <div className="flex flex-col items-center gap-1 text-center px-2">
              <h2 className="text-base sm:text-lg font-extrabold font-fredoka text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 max-w-xs">
                {title || "Test tayyorlanmoqda..."}
              </h2>
              <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-slate-500 dark:text-slate-400 mt-0.5">
                {isLoading ? "Savollar yuklanmoqda" : "Omad tilaymiz!"}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
