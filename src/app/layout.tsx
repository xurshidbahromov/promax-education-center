import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Inter, Fredoka, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Background } from "@/components/Background";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";


const atkinson = Atkinson_Hyperlegible({
 variable: "--font-atkinson",
 subsets: ["latin"],
 weight: ["400", "700"],
 display: "swap",
});

const inter = Inter({
 variable: "--font-inter",
 subsets: ["latin"],
 weight: ["300", "400", "500", "600", "700", "800", "900"],
 display: "swap",
});

const fredoka = Fredoka({
 variable: "--font-fredoka",
 subsets: ["latin"],
 weight: ["300", "400", "500", "600", "700"],
 display: "swap",
});

const sourceSans = Source_Sans_3({
 variable: "--font-sans-pro",
 subsets: ["latin"],
 weight: ["300", "400", "500", "600", "700", "800", "900"],
 display: "swap",
});

export const metadata: Metadata = {
 title: "Promax Education Center | Zamonaviy Ta'lim Markazi",
 description: "Xorazm Urganch shahridagi eng zamonaviy o'quv markazi. OTM larga, IELTS, SAT va Xalqaro Universitetlarga tayyorlov.",
 keywords: ["O'quv markazi", "Urganch", "Xorazm", "IELTS", "SAT", "OTM", "Abituriyent", "Matematika", "Ingliz tili", "Promax Education"],
 openGraph: {
 title: "Promax Education Center",
 description: "Urganch shahridagi eng zamonaviy o'quv markazi",
 url: "https://promaxedu.uz",
 siteName: "Promax Education Center",
 locale: "uz_UZ",
 type: "website",
 },
 twitter: {
 card: "summary_large_image",
 title: "Promax Education Center",
 description: "Zamonaviy ta'lim markazi - IELTS, SAT, Milliy Sertifikatlar",
 }
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en" className="scroll-smooth" suppressHydrationWarning>
 <body
 className={`${atkinson.variable} ${inter.variable} ${fredoka.variable} ${sourceSans.variable} antialiased text-slate-800 dark:text-slate-50 min-h-screen flex flex-col font-sans selection:bg-brand-blue/20 transition-colors duration-300`}
 >
 <NextTopLoader color="#F97316" height={3} showSpinner={false} />
 <ThemeProvider
 attribute="class"
 defaultTheme="system"
 enableSystem
 disableTransitionOnChange
 >
 <QueryProvider>
 <LanguageProvider>
              <Toaster 
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'transparent',
                    boxShadow: 'none',
                    padding: 0,
                  },
                  className: "!max-w-[90vw] sm:!max-w-md !bg-white/60 dark:!bg-slate-900/60 !backdrop-blur-2xl !border !border-white/50 dark:!border-slate-700/50 !shadow-2xl !text-slate-800 dark:!text-slate-100 !font-medium !font-fredoka !text-base sm:!text-lg !rounded-2xl sm:!rounded-[1.5rem] !px-4 sm:!px-6 !py-3 sm:!py-4",
                  success: {
                    iconTheme: { primary: '#10b981', secondary: '#ffffff' }
                  },
                  error: {
                    iconTheme: { primary: '#ef4444', secondary: '#ffffff' }
                  }
                }}
              />
 {children}
 </LanguageProvider>
 </QueryProvider>
 </ThemeProvider>
 </body>
 </html>
 );
}
