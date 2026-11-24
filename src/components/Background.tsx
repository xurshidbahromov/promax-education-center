"use client";

export const Background = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none select-none">
      {/* ── 1. Base Gradient Canvas (Adaptive across all screen sizes) ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/75 via-slate-50/85 to-amber-50/55 dark:from-[#050b16] dark:via-[#081022] dark:to-[#120e0a]" />

      {/* ── 2. High-Performance Multi-Stop Radial Mesh (Zero GPU CSS blur filters) ── */}
      <div
        className="absolute inset-0 opacity-85 dark:opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8% 6%, rgba(0, 86, 210, 0.30) 0%, rgba(37, 99, 235, 0.12) 28%, transparent 58%), " +
            "radial-gradient(circle at 92% 10%, rgba(249, 115, 22, 0.30) 0%, rgba(251, 146, 60, 0.12) 28%, transparent 56%), " +
            "radial-gradient(circle at 6% 64%, rgba(234, 88, 12, 0.22) 0%, rgba(249, 115, 22, 0.08) 26%, transparent 52%), " +
            "radial-gradient(circle at 90% 82%, rgba(2, 132, 199, 0.26) 0%, rgba(0, 86, 210, 0.10) 28%, transparent 56%)",
        }}
      />

      {/* ── 3. Subtle Geometric Dot Grid Overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
};
