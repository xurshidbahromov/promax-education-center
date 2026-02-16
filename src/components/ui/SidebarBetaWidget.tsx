"use client";

import { MessageSquare, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SidebarBetaWidget() {
    const { t } = useLanguage();

    return (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/30">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-500 shrink-0">
                    <AlertTriangle size={18} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                        {t('beta.title') || "Beta Rejim"}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                        {t('beta.sidebar_message') || "Tizim test rejimida ishlamoqda. Xatoliklar bo'lishi mumkin."}
                    </p>
                    <a
                        href="https://t.me/xurshidbahromov"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-brand-blue hover:text-brand-blue/80 flex items-center gap-1.5 transition-colors"
                    >
                        <MessageSquare size={14} />
                        {t('beta.action') || "Xabar berish"}
                    </a>
                </div>
            </div>
        </div>
    );
}
