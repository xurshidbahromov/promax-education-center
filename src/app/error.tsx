"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-8">
                <AlertCircle className="text-red-500" size={48} />
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                Xatolik yuz berdi
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mb-10">
                Kechirasiz, tizimda kutilmagan xatolik yuz berdi. Biz buni tez orada bartaraf etamiz.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => reset()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-sm"
                >
                    <RotateCcw size={18} />
                    Qayta urinib ko'rish
                </button>

                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                    <Home size={18} />
                    Bosh sahifaga qaytish
                </Link>
            </div>
        </div>
    );
}
