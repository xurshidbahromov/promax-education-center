"use client";

export const Background = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transform-gpu">
      {/* ── Rich Promax Vibrant Gradient Layer (Orange -> Lavender -> Royal Blue) ── */}
      <div
        className="absolute inset-0 opacity-80 dark:opacity-60"
        style={{
          background:
            "linear-gradient(115deg, rgba(235, 124, 14, 0.40) 0%, rgba(219, 222, 255, 0.40) 45%, rgba(3, 44, 128, 0.42) 100%)",
        }}
      />

      {/* ── High-Performance Ambient Glow Spheres (Hardware Accelerated) ── */}
      <div className="absolute inset-0">
        {/* Top-Left Vibrant Orange Ambient Glow */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-60 dark:opacity-40 filter blur-3xl transform-gpu pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(235, 124, 14, 0.65) 0%, rgba(235, 124, 14, 0) 70%)",
          }}
        />

        {/* Bottom-Right Deep Royal Blue Ambient Glow */}
        <div
          className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] rounded-full opacity-70 dark:opacity-50 filter blur-3xl transform-gpu pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(3, 44, 128, 0.75) 0%, rgba(3, 44, 128, 0) 70%)",
          }}
        />

        {/* Center Soft Lavender-Blue Ambient Light */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[40rem] h-[25rem] rounded-full opacity-50 dark:opacity-30 filter blur-3xl transform-gpu pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(219, 222, 255, 0.6) 0%, rgba(219, 222, 255, 0) 70%)",
          }}
        />
      </div>

      {/* ── Balanced Base Contrast Overlay (Crisp in Light, Deep in Dark) ── */}
      <div className="absolute inset-0 bg-white/45 dark:bg-[#09090b]/80" />

      {/* ── Ultra-Subtle Texture (No lag) ── */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />
    </div>
  );
};
