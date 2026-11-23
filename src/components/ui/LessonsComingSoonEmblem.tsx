"use client";

import { motion } from "framer-motion";

export default function LessonsComingSoonEmblem() {
  return (
    <div
      className="relative w-44 h-32 sm:w-48 sm:h-36 flex items-center justify-center select-none pointer-events-none"
      aria-hidden="true"
    >
      {/* Subtle static radial backdrop (zero GPU blur filter) */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 54%, rgba(245,158,11,0.16) 0%, rgba(0,86,210,0.08) 45%, transparent 72%)",
        }}
      />

      {/* Soft ground shadow pulsing in sync with book float */}
      <motion.div
        animate={{ scaleX: [1, 0.86, 1], opacity: [0.18, 0.1, 0.18] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-2 w-24 h-2.5 rounded-full bg-slate-900 dark:bg-black"
      />

      {/* Main Floating Book + Turning Page + Video Badge SVG */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        <svg
          viewBox="0 0 180 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="pmxBookCover" x1="28" y1="36" x2="152" y2="108" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0056D2" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="pmxAmberBadge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="pmxPageFlip" x1="90" y1="34" x2="146" y2="96" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>

          {/* Subtle dashed orbit ring */}
          <motion.circle
            cx="90"
            cy="68"
            r="54"
            stroke="#94A3B8"
            strokeOpacity="0.24"
            strokeWidth="1.2"
            strokeDasharray="4 6"
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            style={{ originX: 0.5, originY: 0.5, transformBox: "fill-box" }}
          />

          {/* Book Back Cover */}
          <rect
            x="30"
            y="42"
            width="120"
            height="66"
            rx="12"
            fill="url(#pmxBookCover)"
          />
          {/* Book Spine Notch */}
          <path
            d="M84 108C86.5 111.5 93.5 111.5 96 108"
            stroke="#0056D2"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Left Static Page */}
          <path
            d="M36 44C36 40.5 39 38 42.5 38H83C87 38 90 41 90 45V102C90 99 87 97 83 97H41C38.2 97 36 94.8 36 92V44Z"
            className="fill-white dark:fill-slate-800"
            stroke="#CBD5E1"
            strokeOpacity="0.55"
            strokeWidth="1.2"
          />

          {/* Right Static Page */}
          <path
            d="M144 44C144 40.5 141 38 137.5 38H97C93 38 90 41 90 45V102C90 99 93 97 97 97H139C141.8 97 144 94.8 144 92V44Z"
            className="fill-slate-50 dark:fill-slate-800/95"
            stroke="#CBD5E1"
            strokeOpacity="0.55"
            strokeWidth="1.2"
          />

          {/* Center Spine Fold */}
          <line
            x1="90"
            y1="43"
            x2="90"
            y2="101"
            stroke="#94A3B8"
            strokeOpacity="0.4"
            strokeWidth="1.4"
          />

          {/* Animated Left Page Writing Lines */}
          <motion.rect
            x="46"
            y="52"
            height="4"
            rx="2"
            fill="#0056D2"
            fillOpacity="0.75"
            animate={{ width: [0, 32, 32, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.25, 0.85, 1], ease: "easeInOut" }}
          />
          <motion.rect
            x="46"
            y="62"
            height="3.5"
            rx="1.75"
            fill="#94A3B8"
            fillOpacity="0.55"
            animate={{ width: [0, 28, 28, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, times: [0.08, 0.34, 0.85, 1], ease: "easeInOut" }}
          />
          <motion.rect
            x="46"
            y="71"
            height="3.5"
            rx="1.75"
            fill="#94A3B8"
            fillOpacity="0.45"
            animate={{ width: [0, 22, 22, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, times: [0.16, 0.42, 0.85, 1], ease: "easeInOut" }}
          />
          {/* Small Amber Highlight Pill on Left Page */}
          <motion.rect
            x="46"
            y="81"
            width="24"
            height="6"
            rx="3"
            fill="#F59E0B"
            fillOpacity="0.25"
            animate={{ opacity: [0.35, 0.9, 0.35] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Right Page Preview Video Frame */}
          <rect
            x="99"
            y="50"
            width="36"
            height="24"
            rx="6"
            className="fill-amber-500/15 dark:fill-amber-500/20"
            stroke="#F59E0B"
            strokeOpacity="0.35"
            strokeWidth="1.2"
          />
          <path d="M114 57.5L122 62L114 66.5V57.5Z" fill="#F59E0B" />
          <rect x="99" y="80" width="32" height="3.5" rx="1.75" fill="#94A3B8" fillOpacity="0.45" />
          <rect x="99" y="87" width="22" height="3.5" rx="1.75" fill="#94A3B8" fillOpacity="0.35" />

          {/* Smooth Flipping Page Sheet (Pivots strictly on center spine x=90) */}
          <g transform="translate(90, 0)">
            <motion.path
              d="M0 45C0 41 3 38 7 38H47.5C51 38 54 40.5 54 44V92C54 94.8 51.8 97 49 97H7C3 97 0 99 0 102V45Z"
              fill="url(#pmxPageFlip)"
              stroke="#F59E0B"
              strokeOpacity="0.4"
              strokeWidth="1.2"
              style={{ originX: 0, originY: 0.5, transformBox: "fill-box" }}
              animate={{
                scaleX: [1, 0.06, -1, -1],
                opacity: [0, 0.94, 0.88, 0],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                times: [0.35, 0.56, 0.78, 0.92],
                ease: "easeInOut",
              }}
            />
          </g>

          {/* Floating Amber Play Pill Badge (Top-Right) */}
          <motion.g
            animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: 0.5, originY: 0.5, transformBox: "fill-box" }}
          >
            <rect
              x="126"
              y="14"
              width="34"
              height="34"
              rx="12"
              fill="url(#pmxAmberBadge)"
              stroke="#FFFFFF"
              strokeWidth="3"
            />
            <path
              d="M140 25.5L149.5 31L140 36.5V25.5Z"
              fill="#FFFFFF"
            />
          </motion.g>

          {/* Crisp Floating Sparkles */}
          <motion.g
            animate={{ scale: [0.7, 1.15, 0.7], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: 0.5, originY: 0.5, transformBox: "fill-box" }}
          >
            <path
              d="M34 18L35.8 24.2L42 26L35.8 27.8L34 34L32.2 27.8L26 26L32.2 24.2L34 18Z"
              fill="#0056D2"
            />
          </motion.g>

          <motion.circle
            cx="22"
            cy="64"
            r="3.2"
            fill="#F59E0B"
            animate={{ y: [0, -6, 0], opacity: [0.4, 0.95, 0.4] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
          <motion.circle
            cx="158"
            cy="78"
            r="2.8"
            fill="#0056D2"
            animate={{ y: [0, -5, 0], opacity: [0.35, 0.9, 0.35] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
