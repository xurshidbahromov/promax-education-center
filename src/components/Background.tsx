"use client";

export const Background = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transform-gpu select-none">
      
      {/* ── 1. Base Gradient Canvas (Adaptive in all screen sizes) ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-slate-50/80 to-amber-50/50 dark:from-[#050b16] dark:via-[#081022] dark:to-[#120e0a]" />

      {/* ── 2. Screen-Proportional Responsive Mesh Layer (Always visible on mobile & desktop) ── */}
      <div
        className="absolute inset-0 opacity-80 dark:opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 8%, rgba(0, 86, 210, 0.40) 0%, rgba(37, 99, 235, 0.15) 30%, transparent 60%), " +
            "radial-gradient(circle at 92% 12%, rgba(249, 115, 22, 0.42) 0%, rgba(251, 146, 60, 0.15) 30%, transparent 58%), " +
            "radial-gradient(circle at 8% 65%, rgba(234, 88, 12, 0.35) 0%, rgba(249, 115, 22, 0.10) 28%, transparent 55%), " +
            "radial-gradient(circle at 90% 80%, rgba(2, 132, 199, 0.38) 0%, rgba(0, 86, 210, 0.12) 30%, transparent 58%)",
        }}
      />

      {/* ── 3. High-Performance Responsive Floating Orbs (vw/vh based for perfect mobile scale) ── */}
      <div className="absolute inset-0">
        
        {/* Top-Left: Promax Royal Blue (Visible on Mobile & Desktop) */}
        <div
          className="absolute -top-[10vw] -left-[12vw] w-[65vw] h-[65vw] max-w-[42rem] max-h-[42rem] rounded-full opacity-60 dark:opacity-50 filter blur-[45px] sm:blur-[80px] lg:blur-[100px] transform-gpu pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(0, 86, 210, 0.52) 0%, rgba(37, 99, 235, 0.20) 50%, transparent 70%)",
          }}
        />

        {/* Top-Right: Prominent Promax Orange (Scaled cleanly on Mobile) */}
        <div
          className="absolute -top-[8vw] -right-[12vw] w-[60vw] h-[60vw] max-w-[38rem] max-h-[38rem] rounded-full opacity-60 dark:opacity-50 filter blur-[45px] sm:blur-[80px] lg:blur-[95px] transform-gpu pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(249, 115, 22, 0.52) 0%, rgba(251, 146, 60, 0.20) 50%, transparent 70%)",
          }}
        />

        {/* Middle/Bottom-Left: Warm Brand Orange */}
        <div
          className="absolute top-[45vh] -left-[15vw] w-[55vw] h-[55vw] max-w-[34rem] max-h-[34rem] rounded-full opacity-45 dark:opacity-35 filter blur-[50px] sm:blur-[85px] transform-gpu pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(234, 88, 12, 0.42) 0%, rgba(249, 115, 22, 0.15) 50%, transparent 70%)",
          }}
        />

        {/* Bottom-Right: Sky & Royal Blue */}
        <div
          className="absolute -bottom-[10vw] -right-[10vw] w-[65vw] h-[65vw] max-w-[40rem] max-h-[40rem] rounded-full opacity-55 dark:opacity-45 filter blur-[50px] sm:blur-[90px] lg:blur-[105px] transform-gpu pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(2, 132, 199, 0.48) 0%, rgba(0, 86, 210, 0.18) 50%, transparent 70%)",
          }}
        />
      </div>

    </div>
  );
};
