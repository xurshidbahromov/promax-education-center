import { CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';

interface PaymentBadgeProps {
    status: 'all_paid' | 'partial' | 'overdue' | 'no_courses';
    totalCourses?: number;
    overdueAmount?: number;
}

export default function PaymentBadge({ status, totalCourses = 0, overdueAmount = 0 }: PaymentBadgeProps) {
    const badges = {
        all_paid: {
            icon: CheckCircle,
            label: 'To\'langan',
            className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
        },
        partial: {
            icon: Clock,
            label: 'Qisman',
            className: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
        },
        overdue: {
            icon: AlertTriangle,
            label: 'Muddati o\'tgan',
            className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
        },
        no_courses: {
            icon: XCircle,
            label: 'Kurs yo\'q',
            className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700'
        }
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
        <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${badge.className}`}>
                <Icon size={14} />
                <span>{badge.label}</span>
            </div>
            {status !== 'no_courses' && totalCourses > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {totalCourses} ta kurs
                </span>
            )}
            {overdueAmount > 0 && (
                <span className="text-xs font-bold text-red-600 dark:text-red-400">
                    {new Intl.NumberFormat('uz-UZ').format(overdueAmount)} so'm
                </span>
            )}
        </div>
    );
}
