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
  Step 1 → bottom row
  Step 2 → top row
  Step 3 → bottom row
  Step 4 → top row

  The SVG connector sits absolutely behind the 4 cards.
*/

const Methodology = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24 relative z-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full relative z-10">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row items-center text-center md:items-end md:text-left justify-between mb-16 lg:mb-24 gap-6">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white mb-3.5 leading-[1.1]"
            >
              {t('methodology.title')}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium max-w-prose"
            >
              {t('methodology.subtitle')}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="whitespace-nowrap pb-1 md:pb-2"
          >
            <Link
              href="/methodology"
              className="inline-flex items-center gap-2 font-semibold text-sm text-brand-blue dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
            >
              {t('methodology.home.cta')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
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

  const CARD_SIZE = 260; // px – diameter for mobile
  const CONTAINER_W = 340;
  const CONTAINER_H = 1200;

  return (
    <div className="relative origin-top transform max-[350px]:scale-[0.75] max-[380px]:scale-[0.85] scale-[0.95] sm:scale-110" style={{ width: `${CONTAINER_W}px`, height: `${CONTAINER_H}px` }}>
      {/* SVG Vertical Connector */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
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

      {/* Cards - 100% Solid Opaque Background */}
      {steps.map((step, i) => {
        const [top, cx] = positions[i];
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
              left: `${cx - (CARD_SIZE / 2)}px`,
              top: `${top - (CARD_SIZE / 2)}px`,
              width: `${CARD_SIZE}px`,
              height: `${CARD_SIZE}px`,
            }}
            className="group cursor-default z-10"
          >
            <div
              className="w-full h-full rounded-full flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 shadow-[0_12px_36px_rgba(0,0,0,0.1)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)] border-4 border-white dark:border-slate-800 p-5 select-none transition-shadow duration-300"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-orange mb-1">STEP</span>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center text-brand-orange">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <span className="text-5xl font-bold tabular-nums text-slate-200 dark:text-slate-700 leading-none select-none font-sans">
                  {step.num}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white tracking-tight px-4 mb-1.5 leading-tight font-sans">
                {t(`methodology.${step.id}.title`)}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-5 line-clamp-3 font-medium">
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
───────────────────────────────────────────── */

function DesktopZigZag({ steps, t }: { steps: StepItem[]; t: (k: string) => string }) {
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
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox={`0 0 1200 ${CONTAINER_H}`}
        preserveAspectRatio="none"
        overflow="visible"
      >
        {/* === Dumbbell-shaped filled polygon connector === */}
        <path
          d={[
            "M 158,170",
            "L 191,184 222,190 252,189 279,179 303,164 325,144 346,120 373,95 410,70",
            "L 458,50",
            "L 506,70 543,95 570,120 591,144 613,164 637,179 664,189 694,190 725,184",
            "L 758,170",
            "L 791,184 822,190 852,189 879,179 903,164 925,144 946,120 973,95 1010,70",
            "L 1058,50",
            "L 1058,170",
            "L 1025,157 994,150 964,151 937,161 913,176 891,196 870,220 843,245 806,270",
            "L 758,290",
            "L 725,270 694,245 664,220 637,196 613,176 579,161 552,151 522,150 491,157",
            "L 458,170",
            "L 425,157 394,150 364,151 337,161 313,176 291,196 270,220 243,245 206,270",
            "L 158,290",
            "Z",
          ].join(" ")}
          fill="#f97316"
          stroke="#f97316"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* === Circular blobs at card centres === */}
        {[
          [158, 230],
          [458, 110],
          [758, 230],
          [1058, 110],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="70" fill="#f97316" opacity="1" />
        ))}
      </svg>

      {/* ── Cards - 100% Solid Opaque Background ── */}
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
            className="group cursor-default z-10"
          >
            <div
              className="w-full h-full rounded-full flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 shadow-[0_12px_36px_rgba(0,0,0,0.1)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)] border-4 border-white dark:border-slate-800 p-6 select-none transition-shadow duration-300"
            >
              {/* STEP label */}
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-orange mb-1.5">STEP</span>

              {/* Big number + icon row */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-full bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center text-brand-orange">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <span className="text-6xl font-bold tabular-nums text-slate-200 dark:text-slate-700 leading-none select-none font-sans">
                  {step.num}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight px-6 mb-2 leading-tight font-sans">
                {t(`methodology.${step.id}.title`)}
              </h3>

              {/* Desc */}
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-6 line-clamp-3 font-medium">
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
