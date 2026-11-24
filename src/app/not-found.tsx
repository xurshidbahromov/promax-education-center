"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import PromaxEmptyState from "@/components/ui/PromaxEmptyState";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 py-16">
      <PromaxEmptyState
        variant="not-found"
        badgeLabel="404"
        eyebrow="Xatolik 404"
        title="Sahifa topilmadi"
        description="Kechirasiz, siz qidirayotgan sahifa o'chirilgan, manzili o'zgargan yoki vaqtincha mavjud emas."
        className="w-full max-w-lg"
        actions={
          <>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 active:scale-95 transition-all"
            >
              <Home size={16} />
              <span>Bosh sahifaga qaytish</span>
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Orqaga qaytish</span>
            </button>
          </>
        }
      />
    </div>
  );
}
