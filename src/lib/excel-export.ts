/**
 * Excel Export Utility - Lazy Loaded
 * Helper functions for exporting data to Excel files
 * Uses dynamic import to load xlsx library only when needed
 */

export interface ExportColumn {
    header: string;
    key: string;
    width?: number;
    format?: 'text' | 'number' | 'currency' | 'percentage' | 'date';
}

/**
 * Lazy load XLSX library
 * Only imports the heavy library when actually needed
 */
async function getXLSX() {
    const XLSX = await import('xlsx');
    return XLSX;
}

/**
 * Export data to Excel file
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 * @param sheetName - Name of the worksheet
 * @param columns - Optional column configuration for formatting
 */
export async function exportToExcel(
    data: any[],
    filename: string,
    sheetName: string = 'Sheet1',
    columns?: ExportColumn[]
) {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    // Lazy load XLSX
    const XLSX = await getXLSX();

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();

    // If columns are specified, format the data accordingly
    let formattedData = data;
    if (columns) {
        formattedData = data.map(row => {
            const formatted: any = {};
            columns.forEach(col => {
                const value = row[col.key];
                formatted[col.header] = formatValue(value, col.format);
            });
            return formatted;
        });
    }

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Set column widths if specified
    if (columns) {
        const wscols = columns.map(col => ({
            wch: col.width || 15
        }));
        worksheet['!cols'] = wscols;
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file and trigger download
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${timestamp}.xlsx`;
    XLSX.writeFile(workbook, fullFilename);
}

/**
 * Format value based on type
 */
function formatValue(value: any, format?: string): any {
    if (value === null || value === undefined) return '';

    switch (format) {
        case 'date':
            return formatDate(value);
        case 'currency':
            return formatCurrency(value);
        case 'percentage':
            return formatPercentage(value);
        case 'number':
            return typeof value === 'number' ? value : parseFloat(value) || 0;
        case 'text':
        default:
            return String(value);
    }
}

/**
 * Format date to DD.MM.YYYY
 */
function formatDate(date: string | Date): string {
    try {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    } catch {
        return String(date);
    }
}

/**
 * Format currency with thousand separators
 */
function formatCurrency(amount: number): string {
    if (typeof amount !== 'number') {
        amount = parseFloat(String(amount)) || 0;
    }
    return amount.toLocaleString('uz-UZ', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }) + ' UZS';
}

/**
 * Format percentage
 */
function formatPercentage(value: number): string {
    if (typeof value !== 'number') {
        value = parseFloat(String(value)) || 0;
    }
    return value.toFixed(1) + '%';
}

/**
 * Export student results to Excel
 */
export async function exportStudentResults(results: any[]) {
    const columns: ExportColumn[] = [
        { header: 'Student', key: 'student_name', width: 20 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Test', key: 'test_title', width: 25 },
        { header: 'Subject', key: 'subject', width: 12 },
        { header: 'Score', key: 'score', width: 10, format: 'number' },
        { header: 'Max Score', key: 'max_score', width: 10, format: 'number' },
        { header: 'Percentage', key: 'percentage', width: 12, format: 'percentage' },
        { header: 'Status', key: 'status', width: 10 },
        { header: 'Date', key: 'completed_at', width: 12, format: 'date' },
        { header: 'Time Spent', key: 'time_spent', width: 12 }
    ];

    const formattedResults = results.map(r => ({
        student_name: r.student_name || 'Unknown',
        phone: r.phone || 'N/A',
        test_title: r.test_title || 'N/A',
        subject: r.subject || 'N/A',
        score: r.score || 0,
        max_score: r.max_score || 0,
        percentage: r.percentage || 0,
        status: r.percentage >= r.passing_score ? 'Passed' : 'Failed',
        completed_at: r.completed_at,
        time_spent: formatTimeSpent(r.time_spent_seconds)
    }));

    await exportToExcel(formattedResults, 'Student_Results', 'Results', columns);
}

/**
 * Export payment history to Excel
 */
export async function exportPaymentHistory(payments: any[]) {
    const columns: ExportColumn[] = [
        { header: 'Student', key: 'student_name', width: 20 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Course', key: 'course_name', width: 20 },
        { header: 'Amount', key: 'amount', width: 15, format: 'currency' },
        { header: 'Payment Date', key: 'payment_date', width: 15, format: 'date' },
        { header: 'Month/Year', key: 'month_year', width: 12 },
        { header: 'Status', key: 'status', width: 12 }
    ];

    const formattedPayments = payments.map(p => ({
        student_name: p.student_name || 'Unknown',
        phone: p.phone || 'N/A',
        course_name: p.course_name || 'N/A',
        amount: p.amount || 0,
        payment_date: p.payment_date,
        month_year: formatMonthYear(p.month, p.year),
        status: p.status || 'completed'
    }));

    await exportToExcel(formattedPayments, 'Payment_History', 'Payments', columns);
}

/**
 * Export students list with payment status
 */
export async function exportStudentsList(students: any[], paymentSummaries: Map<string, any>) {
    const columns: ExportColumn[] = [
        { header: 'Student', key: 'full_name', width: 20 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Role', key: 'role', width: 10 },
        { header: 'Total Courses', key: 'total_courses', width: 15, format: 'number' },
        { header: 'Payment Status', key: 'payment_status', width: 15 },
        { header: 'Overdue Amount', key: 'overdue_amount', width: 18, format: 'currency' },
        { header: 'Joined Date', key: 'joined_at', width: 15, format: 'date' }
    ];

    const formattedStudents = students.map(s => {
        const summary = paymentSummaries.get(s.id);
        return {
            full_name: s.full_name || 'Unknown',
            phone: s.phone || 'N/A',
            email: s.email || 'N/A',
            role: s.role || 'student',
            total_courses: summary?.totalCourses || 0,
            payment_status: getPaymentStatusText(summary?.status),
            overdue_amount: summary?.totalOverdue || 0,
            joined_at: s.joined_at || s.created_at
        };
    });

    await exportToExcel(formattedStudents, 'Students_List', 'Students', columns);
}

/**
 * Helper: Format time spent in minutes
 */
function formatTimeSpent(seconds: number | null): string {
    if (!seconds) return '0 min';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
}

/**
 * Helper: Format month/year
 */
function formatMonthYear(month: number, year: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[month - 1]} ${year}`;
}

/**
 * Helper: Get payment status text
 */
function getPaymentStatusText(status: string): string {
    const statusMap: Record<string, string> = {
        'all_paid': 'All Paid',
        'partial': 'Partial',
        'overdue': 'Overdue',
        'no_courses': 'No Courses'
    };
    return statusMap[status] || status;
}
