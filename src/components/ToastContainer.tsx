"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    const getIcon = (type: string) => {
        switch (type) {
            case "success":
                return <CheckCircle size={20} />;
            case "error":
                return <XCircle size={20} />;
            case "warning":
                return <AlertCircle size={20} />;
            case "info":
            default:
                return <Info size={20} />;
        }
    };

    const getColors = (type: string) => {
        switch (type) {
            case "success":
                return {
                    bg: "bg-green-50 dark:bg-green-900/20",
                    border: "border-l-green-600",
                    text: "text-green-800 dark:text-green-300",
                    icon: "text-green-600 dark:text-green-400"
                };
            case "error":
                return {
                    bg: "bg-red-50 dark:bg-red-900/20",
                    border: "border-l-red-600",
                    text: "text-red-800 dark:text-red-300",
                    icon: "text-red-600 dark:text-red-400"
                };
            case "warning":
                return {
                    bg: "bg-yellow-50 dark:bg-yellow-900/20",
                    border: "border-l-yellow-600",
                    text: "text-yellow-800 dark:text-yellow-300",
                    icon: "text-yellow-600 dark:text-yellow-400"
                };
            case "info":
            default:
                return {
                    bg: "bg-blue-50 dark:bg-blue-900/20",
                    border: "border-l-blue-600",
                    text: "text-blue-800 dark:text-blue-300",
                    icon: "text-blue-600 dark:text-blue-400"
                };
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const colors = getColors(toast.type);
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={`${colors.bg} ${colors.border} border-l-4 rounded-xl p-4 shadow-lg backdrop-blur-sm pointer-events-auto`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={colors.icon}>
                                    {getIcon(toast.type)}
                                </div>
                                <p className={`flex-1 text-sm font-medium ${colors.text}`}>
                                    {toast.message}
                                </p>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className={`${colors.icon} hover:opacity-70 transition-opacity flex-shrink-0`}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
