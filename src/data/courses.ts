import { Calculator, Globe, Atom, BookOpen, ScrollText, Dna, Languages, GraduationCap, Scale } from 'lucide-react';

export interface Course {
    id: string;
    icon: any;
    color: string;
    bg: string;
    type: 'general' | 'prep' | 'certificate';
}

export const courses: Course[] = [
    // General Subjects
    { id: 'math', icon: Calculator, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', type: 'general' },
    { id: 'english', icon: Globe, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', type: 'general' },
    { id: 'physics', icon: Atom, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', type: 'general' },
    { id: 'korean', icon: Languages, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', type: 'general' },
    { id: 'native', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', type: 'general' },
    { id: 'russian', icon: Languages, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20', type: 'general' },
    { id: 'history', icon: ScrollText, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', type: 'general' },
    { id: 'biology', icon: Dna, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', type: 'general' },
    { id: 'chemistry', icon: Atom, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20', type: 'general' },
    { id: 'law', icon: Scale, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', type: 'general' },

    // Certificate Prep
    { id: 'cert.national', icon: ScrollText, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', type: 'certificate' },
    { id: 'cert.ielts', icon: Globe, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', type: 'certificate' },
    { id: 'cert.sat', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', type: 'certificate' },
    { id: 'cert.cefr', icon: Languages, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', type: 'certificate' },

    // University Prep
    { id: 'prep.inha', icon: GraduationCap, color: 'text-blue-700', bg: 'bg-blue-100 dark:bg-blue-900/30', type: 'prep' },
    { id: 'prep.west', icon: GraduationCap, color: 'text-purple-700', bg: 'bg-purple-100 dark:bg-purple-900/30', type: 'prep' },
    { id: 'prep.turin', icon: GraduationCap, color: 'text-indigo-700', bg: 'bg-indigo-100 dark:bg-indigo-900/30', type: 'prep' },
    { id: 'prep.aut', icon: GraduationCap, color: 'text-cyan-700', bg: 'bg-cyan-100 dark:bg-cyan-900/30', type: 'prep' },
];
