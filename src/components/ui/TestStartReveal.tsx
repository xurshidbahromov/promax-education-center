"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { soundFx } from "@/lib/sound-effects";

interface TestStartRevealProps {
  isLoading?: boolean;
  title?: string;
  modeLabel?: string;
}

const ROWS = [
  { num: "01", y: 24, targetIndex: 1 },
  { num: "02", y: 56, targetIndex: 3 },
  { num: "03", y: 88, targetIndex: 0 },
];
const LETTERS = ["A", "B", "C", "D"];
const COL_X = [72, 120, 168, 216];

export default function TestStartReveal({
  isLoading = false,
  title,
  modeLabel = "TITUL VARAQASI",
}: TestStartRevealProps) {
  const [isFinished, setIsFinished] = useState(false);
  const penRef = useRef<SVGGElement | null>(null);
  const fillRefs = useRef<(SVGCircleElement | null)[]>([null, null, null]);
  const ringRefs = useRef<(SVGCircleElement | null)[]>([null, null, null]);
  const letterRefs = useRef<(SVGTextElement | null)[]>([null, null, null]);
  const rowNumRefs = useRef<(SVGTextElement | null)[]>([null, null, null]);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const playedReadySoundRef = useRef(false);

  useEffect(() => {
    if (!isLoading) {
      if (!playedReadySoundRef.current) {
        playedReadySoundRef.current = true;
        soundFx.playModalOpen();
      }
      const timer = setTimeout(() => {
        setIsFinished(true);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // GPU-composited rAF loop (zero React re-renders, zero heavy blur layers)
  useEffect(() => {
    if (isFinished) return;
    let rafId = 0;
    let startTs: number | null = null;
    const CYCLE_MS = 2400;

    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const targets = ROWS.map((r) => ({ x: COL_X[r.targetIndex], y: r.y }));

    const tick = (now: number) => {
      if (startTs === null) startTs = now;
      const norm = ((now - startTs) % CYCLE_MS) / CYCLE_MS;
      const penEl = penRef.current;

      if (penEl) {
        let px = targets[0].x;
        let py = targets[0].y;
        let penOpacity = 1;
        let activeRow = 0;

        const fills = [0, 0, 0];
        const rings = [0, 0, 0];

        if (norm < 0.28) {
          activeRow = 0;
          const local = norm / 0.28;
          const angle = local * Math.PI * 2;
          const radius = local < 0.8 ? 2.4 * (1 - local * 0.45) : 0;
          px = targets[0].x + Math.cos(angle) * radius;
          py = targets[0].y + Math.sin(angle) * radius;
          fills[0] = Math.min(1, local / 0.72);
          if (local > 0.65) rings[0] = (local - 0.65) / 0.35;
          penOpacity = Math.min(1, local / 0.14);
        } else if (norm < 0.56) {
          fills[0] = 1;
          activeRow = 1;
          const local = (norm - 0.28) / 0.28;
          if (local < 0.34) {
            const g = easeInOut(local / 0.34);
            px = targets[0].x + (targets[1].x - targets[0].x) * g;
            py = targets[0].y + (targets[1].y - targets[0].y) * g - Math.sin(g * Math.PI) * 8;
          } else {
            const f = (local - 0.34) / 0.66;
            const angle = f * Math.PI * 2;
            const radius = f < 0.8 ? 2.4 * (1 - f * 0.45) : 0;
            px = targets[1].x + Math.cos(angle) * radius;
            py = targets[1].y + Math.sin(angle) * radius;
            fills[1] = Math.min(1, f / 0.72);
            if (f > 0.65) rings[1] = (f - 0.65) / 0.35;
          }
        } else if (norm < 0.84) {
          fills[0] = 1;
          fills[1] = 1;
          activeRow = 2;
          const local = (norm - 0.56) / 0.28;
          if (local < 0.34) {
            const g = easeInOut(local / 0.34);
            px = targets[1].x + (targets[2].x - targets[1].x) * g;
            py = targets[1].y + (targets[2].y - targets[1].y) * g - Math.sin(g * Math.PI) * 8;
          } else {
            const f = (local - 0.34) / 0.66;
            const angle = f * Math.PI * 2;
            const radius = f < 0.8 ? 2.4 * (1 - f * 0.45) : 0;
            px = targets[2].x + Math.cos(angle) * radius;
            py = targets[2].y + Math.sin(angle) * radius;
            fills[2] = Math.min(1, f / 0.72);
            if (f > 0.65) rings[2] = (f - 0.65) / 0.35;
          }
        } else {
          activeRow = -1;
          const hold = (norm - 0.84) / 0.16;
          const fade = hold > 0.45 ? Math.max(0, 1 - (hold - 0.45) / 0.55) : 1;
          fills[0] = fade;
          fills[1] = fade;
          fills[2] = fade;
          px = targets[2].x + hold * 4;
          py = targets[2].y - hold * 9;
          penOpacity = Math.max(0, 1 - hold * 1.7);
        }

        penEl.setAttribute("transform", `translate(${px.toFixed(1)}, ${py.toFixed(1)})`);
        penEl.style.opacity = `${penOpacity.toFixed(2)}`;

        fills.forEach((v, idx) => {
          const fillEl = fillRefs.current[idx];
          if (fillEl) {
            fillEl.setAttribute("r", (v * 10.2).toFixed(1));
            fillEl.style.opacity = `${Math.min(1, v * 1.15).toFixed(2)}`;
          }
          const letterEl = letterRefs.current[idx];
          if (letterEl) {
            letterEl.style.fill = v > 0.45 ? "#FFFFFF" : "";
          }
          const ringEl = ringRefs.current[idx];
          if (ringEl) {
            const rProg = rings[idx];
            if (rProg > 0 && rProg < 1) {
              ringEl.setAttribute("r", (10.5 + rProg * 7).toFixed(1));
              ringEl.style.opacity = `${((1 - rProg) * 0.5).toFixed(2)}`;
            } else {
              ringEl.style.opacity = "0";
            }
          }
          const numEl = rowNumRefs.current[idx];
          if (numEl) {
            numEl.style.fill = idx === activeRow || v >= 0.99 ? "#0056D2" : "";
          }
        });

        if (progressBarRef.current) {
          const scale = norm < 0.84 ? Math.min(1, norm / 0.84) : 1;
          progressBarRef.current.style.transform = `scaleX(${scale.toFixed(3)})`;
          progressBarRef.current.style.opacity =
            norm > 0.92 ? `${Math.max(0, 1 - (norm - 0.92) / 0.08).toFixed(2)}` : "1";
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isFinished]);

  if (isFinished) return null;

  return (
    <div
      style={{ willChange: "opacity" }}
      className={`fixed inset-0 z-[120] flex items-center justify-center pointer-events-none select-none overflow-hidden bg-slate-50 dark:bg-[#060b16] transition-opacity duration-500 ease-out ${
        isLoading ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Pure CSS radial aura (zero GPU blur filter cost) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-70 dark:opacity-40"
        style={{
          background:
            "radial-gradient(circle at 38% 35%, rgba(0,86,210,0.12), transparent 52%), radial-gradient(circle at 65% 65%, rgba(245,158,11,0.12), transparent 50%)",
        }}
      />

      <div
        style={{ willChange: "transform, opacity" }}
        className={`relative flex flex-col items-center gap-5 z-10 max-w-sm w-full px-4 transition-transform duration-500 ease-out ${
          isLoading ? "scale-100 translate-y-0" : "scale-[1.03] -translate-y-2"
        }`}
      >
        {/* Promax Logo Emblem */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
          <Image
            src="/Logo_without_sentence.png"
            alt="Promax Education"
            fill
            priority
            className="object-contain"
          />
        </div>

        {/* Editorial Promax Exam Sheet (solid surface, zero backdrop-blur jank) */}
        <div className="relative w-full max-w-[340px] bg-white dark:bg-slate-900 rounded-[28px] p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Left Spiral Binder Rings */}
          <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around py-4 z-20 pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="w-3.5 h-1 bg-slate-300 dark:bg-slate-600 rounded-full -ml-1" />
              </div>
            ))}
          </div>

          <div className="absolute left-9 top-0 bottom-0 w-px bg-brand-blue/15 dark:bg-brand-blue/25 z-10" />

          {/* Sheet Header */}
          <div className="pl-7 pb-3 mb-2 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[10px] font-extrabold tracking-[0.16em] text-brand-blue uppercase">
                {modeLabel}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-extrabold tracking-wider uppercase">
              DTM · SAT
            </span>
          </div>

          {/* Unified SVG Coordinate System */}
          <div className="relative pl-6 pt-1">
            <svg viewBox="0 0 256 112" className="w-full h-auto overflow-visible">
              <rect x="6" y="4" width="4" height="4" rx="1" fill="currentColor" className="text-slate-300 dark:text-slate-700" />
              <rect x="242" y="4" width="4" height="4" rx="1" fill="currentColor" className="text-slate-300 dark:text-slate-700" />
              <rect x="6" y="102" width="4" height="4" rx="1" fill="currentColor" className="text-slate-300 dark:text-slate-700" />
              <rect x="242" y="102" width="4" height="4" rx="1" fill="currentColor" className="text-slate-300 dark:text-slate-700" />

              <line x1="16" y1="40" x2="236" y2="40" stroke="currentColor" strokeWidth="0.75" className="text-slate-100 dark:text-slate-800/80" />
              <line x1="16" y1="72" x2="236" y2="72" stroke="currentColor" strokeWidth="0.75" className="text-slate-100 dark:text-slate-800/80" />

              {ROWS.map((row, rowIdx) => (
                <g key={row.num}>
                  <text
                    ref={(el) => {
                      rowNumRefs.current[rowIdx] = el;
                    }}
                    x="22"
                    y={row.y + 4}
                    fontSize="11"
                    fontWeight="800"
                    fill="currentColor"
                    className="text-slate-400 dark:text-slate-500"
                    style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
                  >
                    {row.num}
                  </text>

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
                          strokeWidth="1.3"
                          className="text-slate-200 dark:text-slate-700"
                        />

                        {isTarget && (
                          <>
                            <circle
                              ref={(el) => {
                                ringRefs.current[rowIdx] = el;
                              }}
                              cx={cx}
                              cy={row.y}
                              r="10.5"
                              fill="none"
                              stroke={rowIdx === 1 ? "#F59E0B" : "#0056D2"}
                              strokeWidth="1.5"
                              style={{ opacity: 0 }}
                            />
                            <circle
                              ref={(el) => {
                                fillRefs.current[rowIdx] = el;
                              }}
                              cx={cx}
                              cy={row.y}
                              r="0"
                              fill={rowIdx === 1 ? "#F59E0B" : "#0056D2"}
                              style={{ opacity: 0 }}
                            />
                          </>
                        )}

                        <text
                          ref={
                            isTarget
                              ? (el) => {
                                  letterRefs.current[rowIdx] = el;
                                }
                              : undefined
                          }
                          x={cx}
                          y={row.y + 3.5}
                          textAnchor="middle"
                          fontSize="9.5"
                          fontWeight="800"
                          fill="currentColor"
                          className="text-slate-400 dark:text-slate-500"
                        >
                          {letter}
                        </text>
                      </g>
                    );
                  })}
                </g>
              ))}

              {/* Flat Promax Fountain Pen */}
              <g ref={penRef} transform={`translate(${COL_X[1]}, ${ROWS[0].y})`} style={{ opacity: 0 }}>
                <g transform="rotate(36)">
                  <polygon points="0,0 -3.4,-11 3.4,-11" fill="#F59E0B" />
                  <line x1="0" y1="0" x2="0" y2="-6.5" stroke="#92400E" strokeWidth="0.7" />
                  <rect x="-3.8" y="-14" width="7.6" height="3.2" fill="#0F172A" rx="0.8" />
                  <polygon points="-3.8,-14 3.8,-14 4.6,-42 -4.6,-42" fill="#0056D2" />
                  <rect x="-4.4" y="-37" width="8.8" height="3" fill="#F59E0B" rx="0.6" />
                  <rect x="-4.6" y="-44.5" width="9.2" height="2.8" fill="#1E293B" rx="1.2" />
                </g>
              </g>
            </svg>
          </div>

          {/* GPU-composited scaleX progress bar */}
          <div className="mt-3 ml-7 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              ref={progressBarRef}
              className="h-full w-full origin-left bg-gradient-to-r from-brand-blue to-amber-500 rounded-full"
              style={{ transform: "scaleX(0)" }}
            />
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
      </div>
    </div>
  );
}
