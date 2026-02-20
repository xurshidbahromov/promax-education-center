"use client";

import Link from "next/link";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-8">
                <FileQuestion className="text-brand-blue" size={48} />
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                404 - Sahifa topilmadi
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mb-10">
                Kechirasiz, siz qidirayotgan sahifa o'chirilgan, nomi o'zgargan yoki vaqtincha mavjud bo'lmasligi mumkin.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-sm"
                >
                    <Home size={18} />
                    Bosh sahifaga qaytish
                </Link>

                <button
                    onClick={() => window.history.back()}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                    <ArrowLeft size={18} />
                    Orqaga chekinish
                </button>
            </div>
        </div>
    );
}
