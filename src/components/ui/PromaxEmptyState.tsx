"use client";

import { useId, type ReactNode } from "react";
import { motion } from "framer-motion";
import LessonsComingSoonEmblem from "./LessonsComingSoonEmblem";

export type EmptyStateVariant =
  | "lessons"
  | "tests"
  | "trophy"
  | "international"
  | "results"
  | "shop"
  | "not-found";

interface PromaxEmptyEmblemProps {
  variant: EmptyStateVariant;
  size?: "sm" | "md";
  badgeLabel?: string;
}

export function PromaxEmptyEmblem({
  variant,
  size = "md",
  badgeLabel,
}: PromaxEmptyEmblemProps) {
  const uid = useId().replace(/:/g, "");

  if (variant === "lessons") {
    return (
      <div className={size === "sm" ? "scale-90 -my-2" : ""}>
        <LessonsComingSoonEmblem />
      </div>
    );
  }

  const sizeClasses =
    size === "sm"
      ? "w-36 h-28 sm:w-40 sm:h-30"
      : "w-44 h-32 sm:w-48 sm:h-36";

  const blueGrad = `pmxBlue_${uid}`;
  const amberGrad = `pmxAmber_${uid}`;
  const softGrad = `pmxSoft_${uid}`;

  const radialBg =
    variant === "trophy" || variant === "shop"
      ? "radial-gradient(circle at 50% 54%, rgba(245,158,11,0.19) 0%, rgba(0,86,210,0.08) 48%, transparent 72%)"
      : "radial-gradient(circle at 50% 54%, rgba(0,86,210,0.14) 0%, rgba(245,158,11,0.1) 46%, transparent 72%)";

  return (
    <div
      className={`relative ${sizeClasses} flex items-center justify-center select-none pointer-events-none`}
      aria-hidden="true"
    >
      {/* Subtle static radial backdrop (zero GPU blur filter) */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: radialBg }}
      />

      {/* Soft ground shadow pulsing in sync with float */}
      <motion.div
        animate={{ scaleX: [1, 0.85, 1], opacity: [0.18, 0.1, 0.18] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-2 w-24 h-2.5 rounded-full bg-slate-900 dark:bg-black"
      />

      {/* Main Floating Animated SVG */}
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
            <linearGradient
              id={blueGrad}
              x1="28"
              y1="26"
              x2="152"
              y2="110"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#0056D2" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient
              id={amberGrad}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient
              id={softGrad}
              x1="40"
              y1="24"
              x2="140"
              y2="108"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#EFF6FF" />
              <stop offset="100%" stopColor="#DBEAFE" />
            </linearGradient>
          </defs>

          {/* Subtle dashed orbit ring shared across all variants */}
          <motion.circle
            cx="90"
            cy="66"
            r="53"
            stroke="#94A3B8"
            strokeOpacity="0.24"
            strokeWidth="1.2"
            strokeDasharray="4 6"
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            style={{ originX: 0.5, originY: 0.5, transformBox: "fill-box" }}
          />

          {/* ── VARIANT: ONLINE TESTS (Notched Ticket + Animated Rows + Loupe) ── */}
          {variant === "tests" && (
            <>
              {/* Ticket Card Base */}
              <rect
                x="38"
                y="26"
                width="104"
                height="82"
                rx="16"
                className="fill-white dark:fill-slate-800"
                stroke="#CBD5E1"
                strokeOpacity="0.65"
                strokeWidth="1.4"
              />
              {/* Ticket Top Stub */}
              <path
                d="M38 42C38 33.1634 45.1634 26 54 26H126C134.837 26 142 33.1634 142 42V49H38V42Z"
                fill={`url(#${blueGrad})`}
              />
              {/* Stub pill details */}
              <rect x="50" y="35" width="36" height="5" rx="2.5" fill="#FFFFFF" fillOpacity="0.88" />
              <rect x="108" y="34" width="22" height="7" rx="3.5" fill="#FBBF24" />

              {/* Ticket Cutout Notches */}
              <circle cx="38" cy="49" r="5" className="fill-slate-100 dark:fill-slate-900" />
              <circle cx="142" cy="49" r="5" className="fill-slate-100 dark:fill-slate-900" />
              {/* Perforation Line */}
              <line
                x1="46"
                y1="49"
                x2="134"
                y2="49"
                stroke="#94A3B8"
                strokeOpacity="0.45"
                strokeWidth="1.4"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />

              {/* Animated Checklist Lines */}
              <circle cx="53" cy="64" r="4.5" fill="#0056D2" fillOpacity="0.16" />
              <motion.path
                d="M50.8 64.1L52.3 65.6L55.3 62.5"
                stroke="#0056D2"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.rect
                x="63"
                y="62"
                height="4"
                rx="2"
                fill="#64748B"
                fillOpacity="0.55"
                animate={{ width: [26, 62, 62, 26] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              />

              <circle cx="53" cy="78" r="4.5" fill="#F59E0B" fillOpacity="0.2" />
              <circle cx="53" cy="78" r="1.8" fill="#F59E0B" />
              <motion.rect
                x="63"
                y="76"
                height="4"
                rx="2"
                fill="#94A3B8"
                fillOpacity="0.5"
                animate={{ width: [20, 48, 48, 20] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.25 }}
              />

              {/* Bottom Amber CTA preview bar */}
              <rect
                x="49"
                y="90"
                width="82"
                height="9"
                rx="4.5"
                fill={`url(#${amberGrad})`}
                fillOpacity="0.9"
              />

              {/* Floating Magnifying Badge (Top-Right) */}
              <motion.g
                animate={{ y: [0, -5, 0], rotate: [-4, 6, -4] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                style={{ originX: 0.5, originY: 0.5, transformBox: "fill-box" }}
              >
                <rect
                  x="124"
                  y="14"
                  width="34"
                  height="34"
                  rx="12"
                  fill={`url(#${amberGrad})`}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                />
                <circle cx="139.5" cy="29.5" r="5.5" stroke="#FFFFFF" strokeWidth="2.2" />
                <line
                  x1="143.8"
                  y1="33.8"
                  x2="147.8"
                  y2="37.8"
                  stroke="#FFFFFF"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </motion.g>
            </>
          )}

          {/* ── VARIANT: TROPHY (Musobaqalar / Olympiads) ── */}
          {variant === "trophy" && (
            <>
              {/* Trophy Left & Right Handles */}
              <path
                d="M62 42H50C47.5 42 46 44 46 46.5C46 56.5 52 63.5 62.5 65"
                stroke="#F59E0B"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <path
                d="M118 42H130C132.5 42 134 44 134 46.5C134 56.5 128 63.5 117.5 65"
                stroke="#F59E0B"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              {/* Trophy Stem */}
              <rect x="84" y="76" width="12" height="15" rx="3" fill="#D97706" />
              {/* Trophy Pedestal */}
              <rect x="66" y="90" width="48" height="10" rx="5" fill={`url(#${blueGrad})`} />
              <rect x="58" y="98" width="64" height="9" rx="4.5" fill="#1E3A8A" />
              <rect x="78" y="93.5" width="24" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.65" />

              {/* Main Cup Body */}
              <path
                d="M60 32C60 29.8 61.8 28 64 28H116C118.2 28 120 29.8 120 32V51C120 67.5 106.6 80 90 80C73.4 80 60 67.5 60 51V32Z"
                fill={`url(#${amberGrad})`}
              />
              {/* Gloss highlight on Cup */}
              <path
                d="M70 36V51C70 60 75 67 82 70.5"
                stroke="#FFFFFF"
                strokeOpacity="0.45"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Center Star on Cup */}
              <motion.path
                d="M90 42L92.7 48.2L99.4 48.8L94.3 53.2L95.8 59.8L90 56.3L84.2 59.8L85.7 53.2L80.6 48.8L87.3 48.2L90 42Z"
                fill="#FFFFFF"
                animate={{ scale: [0.92, 1.12, 0.92], opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ originX: 0.5, originY: 0.5, transformBox: "fill-box" }}
              />

              {/* Floating Crown / Star Badge (Top-Right) */}
              <motion.g
                animate={{ y: [0, -5, 0], scale: [1, 1.06, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ originX: 0.5, originY: 0.5, transformBox: "fill-box" }}
              >
                <rect
                  x="124"
                  y="14"
                  width="34"
                  height="34"
                  rx="12"
                  fill={`url(#${blueGrad})`}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                />
                <path
                  d="M141 23L143.1 28.1L148.5 28.6L144.4 32.1L145.6 37.4L141 34.6L136.4 37.4L137.6 32.1L133.5 28.6L138.9 28.1L141 23Z"
                  fill="#FBBF24"
                />
              </motion.g>
            </>
          )}

          {/* ── VARIANT: INTERNATIONAL (Globe + Orbiting SAT Ring) ── */}
          {variant === "international" && (
            <>
              {/* Globe Outer Circle */}
              <circle cx="90" cy="66" r="37" fill={`url(#${blueGrad})`} />
              {/* Latitude / Longitude Arcs */}
              <ellipse
                cx="90"
                cy="66"
                rx="18"
                ry="37"
                stroke="#FFFFFF"
                strokeOpacity="0.4"
                strokeWidth="1.8"
              />
              <line
                x1="53"
                y1="66"
                x2="127"
                y2="66"
                stroke="#FFFFFF"
                strokeOpacity="0.4"
                strokeWidth="1.8"
              />
              <path
                d="M58 50C67 54 113 54 122 50"
                stroke="#FFFFFF"
                strokeOpacity="0.35"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M58 82C67 78 113 78 122 82"
                stroke="#FFFFFF"
                strokeOpacity="0.35"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              {/* Tilted Amber Orbital Ring */}
              <motion.ellipse
                cx="90"
                cy="66"
                rx="49"
                ry="16"
                transform="rotate(-18 90 66)"
                stroke="#F59E0B"
                strokeWidth="2.4"
                strokeDasharray="10 6"
                strokeLinecap="round"
                animate={{ strokeDashoffset: [0, -32] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              {/* Floating Pin Dots on Globe */}
              <motion.circle
                cx="78"
                cy="58"
                r="4"
                fill="#FBBF24"
                stroke="#FFFFFF"
                strokeWidth="2"
                animate={{ scale: [0.9, 1.25, 0.9] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ originX: 0.5, originY: 0.5, transformBox: "fill-box" }}
              />
              <motion.circle
                cx="104"
                cy="75"
                r="3.5"
                fill="#FBBF24"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                animate={{ scale: [1.15, 0.85, 1.15] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                style={{ originX: 0.5, originY: 0.5, transformBox: "fill-box" }}
              />

              {/* Floating Amber SAT Badge (Top-Right) */}
              <motion.g
                animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 2.7, repeat: Infinity, ease: "easeInOut" }}
                style={{ originX: 0.5, originY: 0.5, transformBox: "fill-box" }}
              >
                <rect
                  x="118"
                  y="14"
                  width="42"
                  height="30"
                  rx="11"
                  fill={`url(#${amberGrad})`}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                />
                <text
                  x="139"
                  y="33.5"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="11.5"
                  fontWeight="800"
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="0.06em"
                >
                  {badgeLabel || "SAT"}
                </text>
              </motion.g>
            </>
          )}

          {/* ── VARIANT: RESULTS (Live Bar Chart + Trend Card) ── */}
          {variant === "results" && (
            <>
              {/* Analytics Card */}
              <rect
                x="36"
                y="28"
                width="108"
                height="78"
                rx="16"
                className="fill-white dark:fill-slate-800"
                stroke="#CBD5E1"
                strokeOpacity="0.65"
                strokeWidth="1.4"
              />
              {/* Subtle horizontal grid lines */}
              <line x1="48" y1="50" x2="132" y2="50" stroke="#94A3B8" strokeOpacity="0.2" strokeWidth="1" />
              <line x1="48" y1="70" x2="132" y2="70" stroke="#94A3B8" strokeOpacity="0.2" strokeWidth="1" />
              <line x1="48" y1="90" x2="132" y2="90" stroke="#94A3B8" strokeOpacity="0.35" strokeWidth="1.4" strokeLinecap="round" />

              {/* Animated Vertical Bars (pivoted at bottom y=90) */}
              <motion.rect
                x="54"
                y="66"
                width="13"
                height="24"
                rx="4.5"
                fill="#0056D2"
                fillOpacity="0.35"
                style={{ originX: 0.5, originY: 1, transformBox: "fill-box" }}
                animate={{ scaleY: [0.65, 1, 0.65] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.rect
                x="74"
                y="54"
                width="13"
                height="36"
                rx="4.5"
                fill="#0056D2"
                fillOpacity="0.65"
                style={{ originX: 0.5, originY: 1, transformBox: "fill-box" }}
                animate={{ scaleY: [0.75, 1.05, 0.75] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.25 }}
              />
              <motion.rect
                x="94"
                y="60"
                width="13"
                height="30"
                rx="4.5"
                fill={`url(#${blueGrad})`}
                style={{ originX: 0.5, originY: 1, transformBox: "fill-box" }}
                animate={{ scaleY: [0.7, 1.08, 0.7] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
              <motion.rect
                x="114"
                y="42"
                width="13"
                height="48"
                rx="4.5"
                fill={`url(#${amberGrad})`}
                style={{ originX: 0.5, originY: 1, transformBox: "fill-box" }}
                animate={{ scaleY: [0.78, 1.04, 0.78] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.75 }}
              />

              {/* Floating Check / Medal Pill Badge */}
              <motion.g
                animate={{ y: [0, -5, 0], scale: [1, 1.06, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ originX: 0.5, originY: 0.5, transformBox: "fill-box" }}
              >
                <rect
                  x="124"
                  y="14"
                  width="34"
                  height="34"
                  rx="12"
                  fill={`url(#${amberGrad})`}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                />
                <path
                  d="M134.5 31.2L138.8 35.5L147.5 26.8"
                  stroke="#FFFFFF"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.g>
            </>
          )}

          {/* ── VARIANT: SHOP (Gift Box + Peeking Promax Coin) ── */}
          {variant === "shop" && (
            <>
              {/* Peeking Floating Coin above box */}
              <motion.g
                animate={{ y: [4, -9, 4], rotate: [-8, 8, -8] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                style={{ originX: 0.5, originY: 0.5, transformBox: "fill-box" }}
              >
                <circle
                  cx="90"
                  cy="31"
                  r="14"
                  fill={`url(#${amberGrad})`}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                />
                <path
                  d="M90 24.5L91.9 28.9L96.6 29.3L93 32.4L94.1 37L90 34.6L85.9 37L87 32.4L83.4 29.3L88.1 28.9L90 24.5Z"
                  fill="#FFFFFF"
                />
              </motion.g>

              {/* Gift Box Body */}
              <rect
                x="52"
                y="56"
                width="76"
                height="48"
                rx="11"
                fill={`url(#${blueGrad})`}
              />
              {/* Vertical Amber Ribbon on Box */}
              <rect x="83" y="56" width="14" height="48" fill={`url(#${amberGrad})`} />

              {/* Animated Gift Box Lid */}
              <motion.g
                animate={{ y: [0, -3.5, 0], rotate: [0, -2, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                style={{ originX: 0.5, originY: 0.5, transformBox: "fill-box" }}
              >
                <rect
                  x="46"
                  y="45"
                  width="88"
                  height="15"
                  rx="6"
                  fill="#1D4ED8"
                />
                <rect x="83" y="45" width="14" height="15" fill="#FBBF24" />
                {/* Ribbon Bows */}
                <path
                  d="M84 45C76 45 71 39 74 35C77 31 85 37 87 45"
                  stroke="#F59E0B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M96 45C104 45 109 39 106 35C103 31 95 37 93 45"
                  stroke="#F59E0B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </motion.g>
            </>
          )}

          {/* ── VARIANT: NOT FOUND / 404 (Animated Compass + Pill Badge) ── */}
          {variant === "not-found" && (
            <>
              {/* Compass Outer Ring */}
              <circle
                cx="90"
                cy="66"
                r="38"
                fill={`url(#${blueGrad})`}
              />
              {/* Inner Compass Dial */}
              <circle
                cx="90"
                cy="66"
                r="30"
                className="fill-white dark:fill-slate-800"
              />
              {/* Cardinal Ticks */}
              <line x1="90" y1="40" x2="90" y2="45" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="90" y1="87" x2="90" y2="92" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="64" y1="66" x2="69" y2="66" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="111" y1="66" x2="116" y2="66" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" />

              {/* Gently Searching Compass Needle */}
              <motion.g
                animate={{ rotate: [-24, 28, -14, 18, -24] }}
                transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ originX: 0.5, originY: 0.5, transformBox: "fill-box" }}
              >
                {/* North Amber Pointer */}
                <path d="M90 46L96 66H84L90 46Z" fill={`url(#${amberGrad})`} />
                {/* South Blue Pointer */}
                <path d="M90 86L96 66H84L90 86Z" fill="#0056D2" fillOpacity="0.35" />
                <circle cx="90" cy="66" r="4" fill="#0F172A" />
                <circle cx="90" cy="66" r="1.6" fill="#FFFFFF" />
              </motion.g>

              {/* Floating 404 / ? Pill Badge */}
              <motion.g
                animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ originX: 0.5, originY: 0.5, transformBox: "fill-box" }}
              >
                <rect
                  x={badgeLabel && badgeLabel.length > 2 ? "116" : "124"}
                  y="14"
                  width={badgeLabel && badgeLabel.length > 2 ? "46" : "34"}
                  height="32"
                  rx="11"
                  fill={`url(#${amberGrad})`}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                />
                <text
                  x={badgeLabel && badgeLabel.length > 2 ? "139" : "141"}
                  y="34.5"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={badgeLabel && badgeLabel.length > 2 ? "12" : "15"}
                  fontWeight="800"
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="0.04em"
                >
                  {badgeLabel || "?"}
                </text>
              </motion.g>
            </>
          )}

          {/* Crisp Floating Sparkles shared across all variants */}
          <motion.g
            animate={{ scale: [0.7, 1.15, 0.7], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ originX: 0.5, originY: 0.5, transformBox: "fill-box" }}
          >
            <path
              d="M32 20L33.8 25.8L39.6 27.6L33.8 29.4L32 35.2L30.2 29.4L24.4 27.6L30.2 25.8L32 20Z"
              fill="#0056D2"
            />
          </motion.g>

          <motion.circle
            cx="22"
            cy="68"
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

interface PromaxEmptyStateProps {
  variant: EmptyStateVariant;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  compact?: boolean;
  badgeLabel?: string;
  className?: string;
}

export default function PromaxEmptyState({
  variant,
  eyebrow,
  title,
  description,
  actions,
  compact = false,
  badgeLabel,
  className = "",
}: PromaxEmptyStateProps) {
  return (
    <div
      className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center ${
        compact ? "p-6 sm:p-8 gap-3" : "p-8 sm:p-12 gap-4"
      } ${className}`}
    >
      <PromaxEmptyEmblem
        variant={variant}
        size={compact ? "sm" : "md"}
        badgeLabel={badgeLabel}
      />

      <div className="space-y-1.5 max-w-md">
        {eyebrow && (
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            {eyebrow}
          </span>
        )}
        <h2
          className={`${
            compact ? "text-base sm:text-lg" : "text-xl sm:text-2xl"
          } font-semibold font-sans tracking-tight text-slate-900 dark:text-white`}
        >
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          {actions}
        </div>
      )}
    </div>
  );
}
