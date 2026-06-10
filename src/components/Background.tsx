"use client";

export const Background = () => {
 return (
 <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
 {/* Base Gradient - Moderate opacity for minimalist feel but keeping colors */}
 <div
 className="absolute inset-0"
 style={{
 background: 'linear-gradient(100deg, rgba(235, 124, 14, 0.45) 0%, rgba(219, 222, 255, 0.45) 50%, rgba(3, 44, 128, 0.45) 100%)'
 }}
 />

 {/* Glassy Blur / Diffusion Layer - Balanced overlay to show colors in dark mode */}
 <div className="absolute inset-0 backdrop-blur-[100px] bg-white/40 dark:bg-[#0f172a]/70" />

 {/* Subtle inline noise texture - no external URL */}
 <div
 className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] mix-blend-overlay"
 style={{
 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
 backgroundRepeat: 'repeat',
 backgroundSize: '200px 200px'
 }}
 />
 </div>
 );
};
