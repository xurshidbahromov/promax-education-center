"use client";

interface StreakFlameIconProps {
  size?: number;
  className?: string;
  active?: boolean;
}

/**
 * Custom flat-minimalist geometric flame icon tailored for Promax UI.
 * Pure vector duotone stroke — zero gradients, zero 3D shadows.
 */
export default function StreakFlameIcon({
  size = 16,
  className = "",
  active = true,
}: StreakFlameIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Subtle flat duotone inner wash */}
      <path
        d="M12.35 3.1C12.35 3.1 17.5 6.85 17.5 12.6C17.5 16.45 14.95 19.6 11.7 19.95C8.1 20.32 5.5 17.45 5.5 13.7C5.5 11.1 6.85 8.85 8.15 7.45C8.15 7.45 8.1 9.55 9.65 10.15C9.4 7.35 10.65 4.75 12.35 3.1Z"
        fill="currentColor"
        fillOpacity={active ? 0.18 : 0.06}
      />
      {/* Crisp minimalist outer flame silhouette */}
      <path
        d="M12.35 3.1C12.35 3.1 17.5 6.85 17.5 12.6C17.5 16.45 14.95 19.6 11.7 19.95C8.1 20.32 5.5 17.45 5.5 13.7C5.5 11.1 6.85 8.85 8.15 7.45C8.15 7.45 8.1 9.55 9.65 10.15C9.4 7.35 10.65 4.75 12.35 3.1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Creative geometric inner spark */}
      <path
        d="M11.65 19.95C13.3 19.95 14.4 18.65 14.4 17.1C14.4 15.6 13.35 14.55 12.1 13.55C11.2 14.55 10.4 15.65 10.4 17.05C10.4 18.55 10.95 19.95 11.65 19.95Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
