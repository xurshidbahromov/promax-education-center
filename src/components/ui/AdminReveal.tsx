"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const ADMIN_INK_PATH = "M 10 35 Q 45 11, 80 35 T 150 35 T 220 35 Q 232 25, 240 35";

export default function AdminReveal({
  isLoading = false,
  role = "admin",
}: {
  isLoading?: boolean;
  role?: string;
}) {
  const [isFinished, setIsFinished] = useState(false);
  const pathRef = useRef<SVGPathElement | null>(null);
  const penRef = useRef<SVGGElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsFinished(true);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // 100% pixel-perfect sync between ink stroke tip and pen nib via SVG getPointAtLength
  useEffect(() => {
    if (isFinished) return;
    let rafId = 0;
    let startTs: number | null = null;
    const CYCLE_MS = 2300;

    const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

    const tick = (now: number) => {
      if (startTs === null) startTs = now;
      const norm = ((now - startTs) % CYCLE_MS) / CYCLE_MS;

      const pathEl = pathRef.current;
      const penEl = penRef.current;

      if (pathEl && penEl) {
        const totalLength = pathEl.getTotalLength();
        pathEl.style.strokeDasharray = `${totalLength}`;

        if (norm < 0.78) {
          const drawT = easeInOutSine(norm / 0.78);
          const dist = drawT * totalLength;
          const pt = pathEl.getPointAtLength(dist);
          const fadeIn = Math.min(1, norm / 0.08);

          pathEl.style.strokeDashoffset = `${(totalLength - dist).toFixed(1)}`;
          pathEl.style.opacity = "1";
          penEl.setAttribute("transform", `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);
          penEl.style.opacity = `${fadeIn.toFixed(2)}`;
        } else if (norm < 0.9) {
          const holdT = (norm - 0.78) / 0.12;
          const endPt = pathEl.getPointAtLength(totalLength);
          pathEl.style.strokeDashoffset = "0";
          pathEl.style.opacity = "1";
          penEl.setAttribute(
            "transform",
            `translate(${(endPt.x + holdT * 3).toFixed(1)}, ${(endPt.y - holdT * 7).toFixed(1)})`
          );
          penEl.style.opacity = `${Math.max(0, 1 - holdT * 1.5).toFixed(2)}`;
        } else {
          const fadeOut = 1 - (norm - 0.9) / 0.1;
          pathEl.style.strokeDashoffset = "0";
          pathEl.style.opacity = `${Math.max(0, fadeOut).toFixed(2)}`;
          penEl.style.opacity = "0";
        }

        if (progressBarRef.current) {
          const scale = norm < 0.78 ? Math.min(1, norm / 0.78) : 1;
          progressBarRef.current.style.transform = `scaleX(${scale.toFixed(3)})`;
          progressBarRef.current.style.opacity =
            norm > 0.9 ? `${Math.max(0, 1 - (norm - 0.9) / 0.1).toFixed(2)}` : "1";
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isFinished]);

  if (isFinished) return null;

  const roleLabel =
    role === "teacher"
      ? "Ustoz Kabineti"
      : role === "staff"
      ? "Xodim Portali"
      : "Boshqaruv Tizimi";

  return (
    <div
      style={{ willChange: "opacity" }}
      className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none select-none overflow-hidden bg-slate-50 dark:bg-[#060b16] transition-opacity duration-500 ease-out ${
        isLoading ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Pure CSS radial aura (zero GPU blur cost) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-70 dark:opacity-40"
        style={{
          background:
            "radial-gradient(circle at 38% 35%, rgba(79,70,229,0.12), transparent 52%), radial-gradient(circle at 65% 65%, rgba(16,185,129,0.11), transparent 50%)",
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
            alt="Promax Admin Portal"
            fill
            priority
            className="object-contain"
          />
        </div>

        {/* Editorial Spiral Admin Ledger (Boshqaruv Jurnali) */}
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

          {/* Vertical Margin Hairline */}
          <div className="absolute left-9 top-0 bottom-0 w-px bg-indigo-500/20 dark:bg-indigo-400/25 z-10" />

          {/* Header */}
          <div className="pl-7 pb-3 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-extrabold tracking-[0.16em] text-indigo-600 dark:text-indigo-400 uppercase">
                BOSHQARUV JURNALI
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-extrabold uppercase tracking-wider">
              ADMIN
            </span>
          </div>

          {/* Unified SVG Coordinate System */}
          <div className="relative pl-7 pt-2 pb-1 h-28 flex items-center">
            <svg viewBox="0 0 250 70" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="adminPenInk" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="55%" stopColor="#0284C7" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>

              <line x1="0" y1="12" x2="250" y2="12" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
              <line x1="0" y1="35" x2="250" y2="35" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
              <line x1="0" y1="58" x2="250" y2="58" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />

              {/* Ink Line — locked 1:1 with Pen Nib via getPointAtLength */}
              <path
                ref={pathRef}
                d={ADMIN_INK_PATH}
                fill="none"
                stroke="url(#adminPenInk)"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray: 400, strokeDashoffset: 400 }}
              />

              {/* Refined Flat Admin Fountain Pen */}
              <g ref={penRef} transform="translate(10, 35)" style={{ opacity: 0 }}>
                <g transform="rotate(36)">
                  <polygon points="0,0 -3.4,-11 3.4,-11" fill="#F59E0B" />
                  <line x1="0" y1="0" x2="0" y2="-6.5" stroke="#92400E" strokeWidth="0.7" />
                  <rect x="-3.8" y="-14" width="7.6" height="3.2" fill="#0F172A" rx="0.8" />
                  <polygon points="-3.8,-14 3.8,-14 4.6,-42 -4.6,-42" fill="#4F46E5" />
                  <rect x="-4.4" y="-37" width="8.8" height="3" fill="#10B981" rx="0.6" />
                  <rect x="-4.6" y="-44.5" width="9.2" height="2.8" fill="#1E293B" rx="1.2" />
                </g>
              </g>
            </svg>
          </div>

          {/* Synced GPU Progress Bar */}
          <div className="mt-1 ml-7 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              ref={progressBarRef}
              className="h-full w-full origin-left bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500 rounded-full"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>

        {/* Brand Typography */}
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 font-sans-pro tracking-[0.25em] uppercase leading-none">
            Promax
          </h1>
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-slate-500 dark:text-slate-400 mt-0.5">
            {isLoading ? roleLabel : "Tayyor"}
          </p>
        </div>
      </div>
    </div>
  );
}
