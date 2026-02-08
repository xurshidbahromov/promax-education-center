"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface TeacherModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseTitle: string;
    teacherName?: string;
    teacherBio?: string;
}

export const TeacherModal = ({ isOpen, onClose, courseTitle, teacherName, teacherBio }: TeacherModalProps) => {
    const { t } = useLanguage();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-slate-800 flex flex-col items-center text-center"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Profile Image (Top Center) */}
                        <div className="w-28 h-28 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 mb-6 border border-gray-200 dark:border-slate-700 shadow-inner">
                            <User size={48} />
                        </div>

                        {/* Teacher Info */}
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {teacherName || "Teacher Name"}
                        </h3>
                        <p className="text-brand-blue font-medium mb-6 uppercase tracking-wide text-sm">
                            {courseTitle} Instructor
                        </p>

                        <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-8">
                            {teacherBio || "Professional instructor with years of experience in preparing students for university entrance exams and international certifications."}
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-brand-blue text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                        >
                            Close
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
