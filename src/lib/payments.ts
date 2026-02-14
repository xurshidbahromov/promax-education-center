// Student Payment Management Functions
// Handle course enrollment and payment tracking

import { createClient } from '@/utils/supabase/client';

// Types
export interface StudentCourse {
    id: string;
    student_id: string;
    subject: string;
    monthly_fee: number;
    start_date: string;
    end_date: string | null;
    status: 'active' | 'paused' | 'completed';
    created_at: string;
    updated_at: string;
}

export interface PaymentTransaction {
    id: string;
    student_id: string;
    student_course_id: string;
    amount: number;
    payment_date: string;
    payment_month: number;
    payment_year: number;
    payment_method: 'cash' | 'card' | 'transfer' | 'other';
    notes: string | null;
    created_by: string | null;
    created_at: string;
}

export interface MonthlyPaymentStatus {
    id: string;
    student_id: string;
    student_course_id: string;
    month: number;
    year: number;
    required_amount: number;
    paid_amount: number;
    remaining_amount: number;
    status: 'paid' | 'partial' | 'pending' | 'overdue';
    due_date: string;
    created_at: string;
    updated_at: string;
}

/**
 * Enroll student in a course
 */
export async function enrollStudentInCourse(data: {
    student_id: string;
    subject: string;
    monthly_fee: number;
    start_date: string;
}): Promise<{ success: boolean; course?: StudentCourse; error?: string }> {
    const supabase = createClient();

    try {
        const { data: course, error } = await supabase
            .from('student_courses')
            .insert({
                student_id: data.student_id,
                subject: data.subject,
                monthly_fee: data.monthly_fee,
                start_date: data.start_date,
                status: 'active'
            })
            .select()
            .single();

        if (error) {
            console.error('Error enrolling student:', error);
            return { success: false, error: error.message };
        }

        return { success: true, course };
    } catch (error) {
        console.error('Error enrolling student:', error);
        return { success: false, error: 'Failed to enroll student' };
    }
}

/**
 * Get all courses for a student
 */
export async function getStudentCourses(studentId: string): Promise<StudentCourse[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('student_courses')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching student courses:', error);
        return [];
    }

    return data || [];
}

/**
 * Get active courses for a student
 */
export async function getActiveStudentCourses(studentId: string): Promise<StudentCourse[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('student_courses')
        .select('*')
        .eq('student_id', studentId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching active courses:', error);
        return [];
    }

    return data || [];
}

/**
 * Update course status
 */
export async function updateCourseStatus(
    courseId: string,
    status: 'active' | 'paused' | 'completed'
): Promise<boolean> {
    const supabase = createClient();

    const updateData: any = { status, updated_at: new Date().toISOString() };

    // If completing or pausing, set end_date
    if (status === 'completed' || status === 'paused') {
        updateData.end_date = new Date().toISOString().split('T')[0];
    }

    const { error } = await supabase
        .from('student_courses')
        .update(updateData)
        .eq('id', courseId);

    if (error) {
        console.error('Error updating course status:', error);
        return false;
    }

    return true;
}

/**
 * Add payment transaction
 */
export async function addPayment(data: {
    student_id: string;
    student_course_id: string;
    amount: number;
    payment_month: number;
    payment_year: number;
    payment_method?: 'cash' | 'card' | 'transfer' | 'other';
    notes?: string;
}): Promise<{ success: boolean; payment?: PaymentTransaction; error?: string }> {
    const supabase = createClient();

    try {
        // Get current user (admin)
        const { data: { user } } = await supabase.auth.getUser();

        const { data: payment, error } = await supabase
            .from('payment_transactions')
            .insert({
                student_id: data.student_id,
                student_course_id: data.student_course_id,
                amount: data.amount,
                payment_date: new Date().toISOString().split('T')[0],
                payment_month: data.payment_month,
                payment_year: data.payment_year,
                payment_method: data.payment_method || 'cash',
                notes: data.notes || null,
                created_by: user?.id || null
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding payment:', error);
            return { success: false, error: error.message };
        }

        return { success: true, payment };
    } catch (error) {
        console.error('Error adding payment:', error);
        return { success: false, error: 'Failed to add payment' };
    }
}

/**
 * Get payment transactions for a student
 */
export async function getStudentPayments(studentId: string): Promise<PaymentTransaction[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('student_id', studentId)
        .order('payment_date', { ascending: false });

    if (error) {
        console.error('Error fetching payments:', error);
        return [];
    }

    return data || [];
}

/**
 * Get payment transactions for a specific course
 */
export async function getCoursePayments(courseId: string): Promise<PaymentTransaction[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('student_course_id', courseId)
        .order('payment_date', { ascending: false });

    if (error) {
        console.error('Error fetching course payments:', error);
        return [];
    }

    return data || [];
}

/**
 * Get monthly payment status for a student
 */
export async function getMonthlyPaymentStatus(
    studentId: string,
    month?: number,
    year?: number
): Promise<MonthlyPaymentStatus[]> {
    const supabase = createClient();

    let query = supabase
        .from('monthly_payment_status')
        .select('*')
        .eq('student_id', studentId);

    if (month && year) {
        query = query.eq('month', month).eq('year', year);
    }

    const { data, error } = await query.order('year', { ascending: false }).order('month', { ascending: false });

    if (error) {
        console.error('Error fetching monthly status:', error);
        return [];
    }

    return data || [];
}

/**
 * Get overdue payments
 */
export async function getOverduePayments(): Promise<MonthlyPaymentStatus[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('monthly_payment_status')
        .select('*, student_courses(*)')
        .eq('status', 'overdue')
        .order('due_date', { ascending: true });

    if (error) {
        console.error('Error fetching overdue payments:', error);
        return [];
    }

    return data || [];
}

/**
 * Get monthly revenue
 */
export async function getMonthlyRevenue(month: number, year: number): Promise<number> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('payment_month', month)
        .eq('payment_year', year);

    if (error) {
        console.error('Error fetching revenue:', error);
        return 0;
    }

    const total = data?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
    return total;
}

/**
 * Delete payment transaction (admin only)
 */
export async function deletePayment(paymentId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('payment_transactions')
        .delete()
        .eq('id', paymentId);

    if (error) {
        console.error('Error deleting payment:', error);
        return false;
    }

    return true;
}

/**
 * Get payment summary for a student (for admin students list)
 */
export interface StudentPaymentSummary {
    totalCourses: number;
    paidCourses: number;
    partialCourses: number;
    overdueCourses: number;
    totalOverdue: number;
    status: 'all_paid' | 'partial' | 'overdue' | 'no_courses';
}

export async function getStudentPaymentSummary(studentId: string): Promise<StudentPaymentSummary> {
    const supabase = createClient();

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get all active courses for student
    const { data: courses, error: coursesError } = await supabase
        .from('student_courses')
        .select('id')
        .eq('student_id', studentId)
        .eq('status', 'active');

    if (coursesError || !courses || courses.length === 0) {
        return {
            totalCourses: 0,
            paidCourses: 0,
            partialCourses: 0,
            overdueCourses: 0,
            totalOverdue: 0,
            status: 'no_courses'
        };
    }

    const totalCourses = courses.length;
    let paidCourses = 0;
    let partialCourses = 0;
    let overdueCourses = 0;
    let totalOverdue = 0;

    // Get current month payment status for each course
    const courseIds = courses.map(c => c.id);
    const { data: paymentStatuses } = await supabase
        .from('monthly_payment_status')
        .select('*')
        .in('student_course_id', courseIds)
        .eq('month', currentMonth)
        .eq('year', currentYear);

    if (paymentStatuses) {
        for (const status of paymentStatuses) {
            if (status.status === 'paid') {
                paidCourses++;
            } else if (status.status === 'partial' || status.status === 'pending') {
                partialCourses++;
            } else if (status.status === 'overdue') {
                overdueCourses++;
                totalOverdue += Number(status.remaining_amount);
            }
        }
    }

    // Determine overall status
    let overallStatus: 'all_paid' | 'partial' | 'overdue' | 'no_courses';
    if (overdueCourses > 0) {
        overallStatus = 'overdue';
    } else if (partialCourses > 0) {
        overallStatus = 'partial';
    } else if (paidCourses === totalCourses) {
        overallStatus = 'all_paid';
    } else {
        overallStatus = 'partial';
    }

    return {
        totalCourses,
        paidCourses,
        partialCourses,
        overdueCourses,
        totalOverdue,
        status: overallStatus
    };
}
