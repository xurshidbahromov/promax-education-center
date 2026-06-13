"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { MessageSquare, Lock, Target, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
 { id: 'step1', num: '01', icon: MessageSquare, color: '#f97316' },
 { id: 'step2', num: '02', icon: Lock, color: '#f97316' },
 { id: 'step3', num: '03', icon: Target, color: '#f97316' },
 { id: 'step4', num: '04', icon: Clock, color: '#f97316' },
];

/* 
 Desktop layout (lg+):
 Step 1 → bottom row (translateY = 0, card sits lower via margin-top)
 Step 2 → top row
 Step 3 → bottom row
 Step 4 → top row

 The SVG connector sits absolutely behind the 4 cards.
*/

const Methodology = () => {
 const { t } = useLanguage();

 return (
 <section className="py-16 md:py-24 relative z-10 px-4 sm:px-6 lg:px-8">

 {/* Soft ambient glows */}
 <div className="pointer-events-none absolute -top-40 left-1/3 w-[40rem] h-[40rem] rounded-full bg-amber-400/10 dark:bg-amber-500/5 blur-[140px]" />
 <div className="pointer-events-none absolute -bottom-40 right-1/3 w-[40rem] h-[40rem] rounded-full bg-brand-blue/10 dark:bg-brand-blue/5 blur-[140px]" />

 <div className="max-w-7xl mx-auto w-full relative z-10">

 {/* ── Header ── */}
 <div className="flex flex-col md:flex-row items-center text-center md:items-end md:text-left justify-between mb-16 lg:mb-24 gap-8">
 <div className="max-w-2xl">
 <motion.h2
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-800 dark:text-slate-100 mb-5 uppercase tracking-tighter font-fredoka"
 >
 {t('methodology.title')}
 </motion.h2>
 <motion.p
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ delay: 0.1 }}
 className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-prose"
 >
 {t('methodology.subtitle')}
 </motion.p>
 </div>

 <motion.div
 initial={{ opacity: 0, x: 20 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 className="whitespace-nowrap pb-2 md:pb-4"
 >
 <Link
 href="/methodology"
 className="inline-flex items-center gap-2 font-medium uppercase tracking-wider text-brand-blue dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
 >
 {t('methodology.home.cta')}
 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
 </Link>
 </motion.div>
 </div>

 {/* ── Zig-Zag Step Diagram ── */}

 {/* MOBILE: vertical zig-zag stack */}
 <div className="flex justify-center w-full lg:hidden overflow-hidden py-8">
 <MobileZigZag steps={steps} t={t} />
 </div>

 {/* DESKTOP: horizontal zig-zag layout */}
 <div className="hidden lg:block origin-center lg:scale-[0.82] xl:scale-[0.92] 2xl:scale-100 transition-transform duration-300">
 <DesktopZigZag steps={steps} t={t} />
 </div>

 </div>
 </section>
 );
};

/* ─────────────────────────────────────────────
 Mobile Zig-Zag layout
───────────────────────────────────────────── */
type StepItem = { id: string; num: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; color: string };

function MobileZigZag({ steps, t }: { steps: StepItem[]; t: (k: string) => string }) {
 // Card positions [top-px, cx]
 const positions: [number, number][] = [
 [158, 230], // step1 right
 [458, 110], // step2 left
 [758, 230], // step3 right
 [1058, 110], // step4 left
 ];

 const CARD_SIZE = 260; // px – diameter for mobile (increased from 230)
 const CONTAINER_W = 340;
 const CONTAINER_H = 1200;

 return (
 <div className="relative origin-top transform max-[350px]:scale-[0.75] max-[380px]:scale-[0.85] scale-[0.95] sm:scale-110" style={{ width: `${CONTAINER_W}px`, height: `${CONTAINER_H}px` }}>
 {/* SVG Vertical Connector */}
 <svg
 className="absolute inset-0 w-full h-full pointer-events-none"
 viewBox={`0 0 ${CONTAINER_W} ${CONTAINER_H}`}
 preserveAspectRatio="none"
 overflow="visible"
 >
 <path
 d={[
 "M 170,158",
 "L 184,191 190,222 189,252 179,279 164,303 144,325 120,346 95,373 70,410",
 "L 50,458",
 "L 70,506 95,543 120,570 144,591 164,613 179,637 189,664 190,694 184,725",
 "L 170,758",
 "L 184,791 190,822 189,852 179,879 164,903 144,925 120,946 95,973 70,1010",
 "L 50,1058",
 "L 170,1058",
 "L 157,1025 150,994 151,964 161,937 176,913 196,891 220,870 245,843 270,806",
 "L 290,758",
 "L 270,725 245,694 220,664 196,637 176,613 161,579 151,552 150,522 157,491",
 "L 170,458",
 "L 157,425 150,394 151,364 161,337 176,313 196,291 220,270 245,243 270,206",
 "L 290,158",
 "Z",
 ].join(" ")}
 fill="#f97316"
 stroke="#f97316"
 strokeWidth="1"
 strokeLinejoin="round"
 />
 {[
 [230, 158],
 [110, 458],
 [230, 758],
 [110, 1058],
 ].map(([cx, cy], i) => (
 <circle key={i} cx={cx} cy={cy} r="70" fill="#f97316" opacity="1" />
 ))}
 </svg>

 {/* Cards */}
 {steps.map((step, i) => {
 const [top, cx] = positions[i];
 const left = cx - (CARD_SIZE / 2);
 const Icon = step.icon;
 return (
 <motion.div
 key={step.id}
 initial={{ opacity: 0, scale: 0.7 }}
 whileInView={{ opacity: 1, scale: 1 }}
 viewport={{ once: true, margin: '-50px' }}
 transition={{ delay: 0.1, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
 style={{
 position: 'absolute',
 left: `${left}px`,
 top: `${top - (CARD_SIZE / 2)}px`,
 width: `${CARD_SIZE}px`,
 height: `${CARD_SIZE}px`,
 }}
 className="group cursor-default"
 >
  <div
  className="w-full h-full rounded-full flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800 shadow-lg dark:shadow-2xl dark:shadow-black/30 border border-slate-100 dark:border-slate-700/60 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-amber-500/30 group-hover:shadow-xl p-5"
  >
 <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-500 mb-1">STEP</span>
 <div className="flex items-center gap-1.5 mb-1">
 <Icon size={22} strokeWidth={2.5} className="text-amber-500 transition-transform duration-300" />
 <span className="text-6xl font-semibold text-slate-200 dark:text-slate-600 leading-none select-none transition-colors duration-300">
 {step.num}
 </span>
 </div>
 <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 uppercase tracking-tight px-4 mb-2 leading-tight group-hover:text-amber-600 transition-colors duration-300">
 {t(`methodology.${step.id}.title`)}
 </h3>
 <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 leading-relaxed px-5 line-clamp-3">
 {t(`methodology.${step.id}.desc`)}
 </p>
 </div>
 </motion.div>
 );
 })}
 </div>
 );
}

/* ─────────────────────────────────────────────
 Desktop zig-zag layout
 Positions (percentages of container width):
 Step 1: left=4%, bottom row (top offset = 120px)
 Step 2: left=31%, top row (top offset = 0px)
 Step 3: left=58%, bottom row (top offset = 120px)
 Step 4: left=85%, top row (top offset = 0px)
 Container height: cardDia + 120px gap = 220 + 120 = 340px
───────────────────────────────────────────── */

function DesktopZigZag({ steps, t }: { steps: StepItem[]; t: (k: string) => string }) {
 // Card positions [cx, top-px, isTop]
 const positions: [number, number, boolean][] = [
 [158, 120, false], // step1 bottom
 [458, 0, true], // step2 top
 [758, 120, false], // step3 bottom
 [1058, 0, true], // step4 top
 ];

 const CARD_SIZE = 280; // px – diameter
 const CONTAINER_H = CARD_SIZE + 120; // 400

 return (
 <div className="relative w-full" style={{ height: `${CONTAINER_H}px` }}>

 {/* ── SVG Zig-Zag Connector ── */}
 <svg
 className="absolute inset-0 w-full h-full pointer-events-none"
 viewBox={`0 0 1200 ${CONTAINER_H}`}
 preserveAspectRatio="none"
 overflow="visible"
 >
 {/*
 Card centres:
 C1: 158, 230 (step1 — bottom-left)
 C2: 458, 110 (step2 — top)
 C3: 758, 230 (step3 — bottom)
 C4: 1058, 110 (step4 — top-right)

 Filled polygon computed by sampling each bezier segment at 11 t-values,
 offsetting perpendicular to the curve tangent by W(t) = 8 + 52*(1-sin(πt)).
 Width: ~120px at card centres → ~12px at segment midpoints.
 */}

 {/* === Dumbbell-shaped filled polygon connector === */}
 <path
 d={[
 /* ── TOP outline (C1 → C4, left to right) ── */
 "M 158,170",
 /* seg1 top */ "L 191,184 222,190 252,189 279,179 303,164 325,144 346,120 373,95 410,70",
 "L 458,50", /* C2 top */
 /* seg2 top */ "L 506,70 543,95 570,120 591,144 613,164 637,179 664,189 694,190 725,184",
 "L 758,170", /* C3 top */
 /* seg3 top */ "L 791,184 822,190 852,189 879,179 903,164 925,144 946,120 973,95 1010,70",
 "L 1058,50", /* C4 top */

 /* ── BOTTOM outline (C4 → C1, right to left) ── */
 "L 1058,170", /* C4 bottom */
 /* seg3 bot */ "L 1025,157 994,150 964,151 937,161 913,176 891,196 870,220 843,245 806,270",
 "L 758,290", /* C3 bottom */
 /* seg2 bot */ "L 725,270 694,245 664,220 637,196 613,176 579,161 552,151 522,150 491,157",
 "L 458,170", /* C2 bottom */
 /* seg1 bot */ "L 425,157 394,150 364,151 337,161 313,176 291,196 270,220 243,245 206,270",
 "L 158,290", /* C1 bottom */
 "Z",
 ].join(" ")}
 fill="#f97316"
 stroke="#f97316"
 strokeWidth="1"
 strokeLinejoin="round"
 />

 {/* === Circular blobs at card centres — cover polygon endpoints cleanly === */}
 {[
 [158, 230],
 [458, 110],
 [758, 230],
 [1058, 110],
 ].map(([cx, cy], i) => (
 <circle key={i} cx={cx} cy={cy} r="70" fill="#f97316" opacity="1" />
 ))}
 </svg>

 {/* ── Cards ── */}
 {steps.map((step, i) => {
 const [cx, top] = positions[i];
 const Icon = step.icon;
 return (
 <motion.div
 key={step.id}
 initial={{ opacity: 0, scale: 0.7 }}
 whileInView={{ opacity: 1, scale: 1 }}
 viewport={{ once: true, margin: '-80px' }}
 transition={{ delay: i * 0.15, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
 style={{
 position: 'absolute',
 left: `calc(${(cx / 1200) * 100}% - ${CARD_SIZE / 2}px)`,
 top: `${top}px`,
 width: `${CARD_SIZE}px`,
 height: `${CARD_SIZE}px`,
 }}
 className="group cursor-default"
 >
  <div
  className="w-full h-full rounded-full flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 transition-all duration-300 group-hover:-translate-y-1.5 shadow-lg dark:shadow-2xl dark:shadow-black/30 group-hover:border-amber-500/30 group-hover:shadow-xl p-5"
  >
 {/* STEP label */}
 <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-500 mb-1.5">STEP</span>

 {/* Big number + icon row */}
 <div className="flex items-center gap-2 mb-2">
 <Icon
 size={24}
 strokeWidth={2.5}
 className="text-amber-500 transition-transform duration-300"
 />
 <span className="text-6xl font-semibold text-slate-200 dark:text-slate-600 leading-none select-none transition-colors duration-300">
 {step.num}
 </span>
 </div>

 {/* Title */}
 <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 uppercase tracking-tight px-8 mb-2.5 leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
 {t(`methodology.${step.id}.title`)}
 </h3>

 {/* Desc */}
 <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed px-8 line-clamp-3">
 {t(`methodology.${step.id}.desc`)}
 </p>
 </div>
 </motion.div>
 );
 })}
 </div>
 );
}

export default Methodology;
