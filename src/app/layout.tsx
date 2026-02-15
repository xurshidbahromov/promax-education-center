import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Background } from "@/components/Background";
import QueryProvider from "@/providers/QueryProvider";
import ToastContainer from "@/components/ToastContainer";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Promax Education Center",
  description: "Expert preparation for OTM, IELTS, SAT, and International Universities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${poppins.variable} antialiased text-gray-900 dark:text-slate-50 min-h-screen flex flex-col font-sans selection:bg-brand-blue/20 transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ToastProvider>
              <LanguageProvider>
                <ToastContainer />
                {children}
              </LanguageProvider>
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
