import { useState } from "react";
import useSWR from "swr";
import { createClient } from "@/utils/supabase/client";
import { Group, GroupStudent } from "@/lib/admin-queries";
import { sendPaymentReceiptToStudentAndParents } from "@/lib/notifications-bridge";

export interface Payment {
  id: string;
  student_id: string;
  group_id: string;
  amount: number;
  month_year: string;
  status: 'pending' | 'completed' | 'partial';
  payment_method: 'cash' | 'card' | 'transfer';
  payment_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpectedPayment {
  studentId: string;
  studentName: string | null;
  studentPhone: string | null;
  groupId: string;
  groupName: string;
  groupPrice: number;
  subjectTitle: string;
  payment?: Payment; // null if no payment record exists (Unpaid)
}

export function useExpectedPayments(monthYear: string, subjectId?: string, groupId?: string, statusFilter?: string) {
  const supabase = createClient();

  const fetcher = async () => {
    // 1. Fetch all groups and their students
    let groupsQuery = supabase
      .from('groups')
      .select(`
        id, name, price, 
        subject:subjects(id, title),
        students:group_students(
          student_id,
          student:profiles!group_students_student_id_fkey(id, full_name, phone)
        )
      `);
      
    const { data: groupsData, error: groupsError } = await groupsQuery;
    if (groupsError) throw groupsError;

    // Filter by subject and group if needed
    let filteredGroups = groupsData || [];
    if (subjectId && subjectId !== 'all') {
      filteredGroups = filteredGroups.filter((g: any) => g.subject?.id === subjectId || g.subject?.[0]?.id === subjectId);
    }
    if (groupId && groupId !== 'all') {
      filteredGroups = filteredGroups.filter((g: any) => g.id === groupId);
    }

    // Extract all group IDs to fetch relevant payments
    const groupIds = filteredGroups.map(g => g.id);
    
    // 2. Fetch payments for the given month
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('month_year', monthYear)
      .in('group_id', groupIds.length > 0 ? groupIds : ['00000000-0000-0000-0000-000000000000']);
      
    if (paymentsError) throw paymentsError;

    // Create a map of payment by student_id + group_id
    const paymentMap = new Map<string, Payment>();
    (paymentsData || []).forEach(p => {
      paymentMap.set(`${p.student_id}_${p.group_id}`, p);
    });

    // 3. Combine into ExpectedPayment array
    let expected: ExpectedPayment[] = [];
    
    filteredGroups.forEach(group => {
      // @ts-ignore
      const students = group.students || [];
      students.forEach((gs: any) => {
        if (!gs.student) return;
        
        const payment = paymentMap.get(`${gs.student_id}_${group.id}`);
        expected.push({
          studentId: gs.student_id,
          studentName: gs.student.full_name,
          studentPhone: gs.student.phone,
          groupId: group.id,
          groupName: group.name,
          groupPrice: group.price || 0,
          subjectTitle: (group.subject as any)?.title || (group.subject as any)?.[0]?.title || '',
          payment: payment
        });
      });
    });

    // 4. Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      expected = expected.filter(e => {
        if (statusFilter === 'unpaid') return !e.payment;
        if (statusFilter === 'paid') return e.payment?.status === 'completed';
        if (statusFilter === 'partial') return e.payment?.status === 'partial';
        return true;
      });
    }

    // Sort by Group Name, then Student Name
    return expected.sort((a, b) => {
      if (a.groupName !== b.groupName) return a.groupName.localeCompare(b.groupName);
      return (a.studentName || '').localeCompare(b.studentName || '');
    });
  };

  const { data, error, mutate, isLoading } = useSWR(
    ['expected_payments', monthYear, subjectId, groupId, statusFilter],
    fetcher
  );

  return {
    data: data || [],
    isLoading,
    error,
    mutate
  };
}

export async function processPayment(
  studentId: string, 
  groupId: string, 
  amount: number, 
  monthYear: string,
  method: 'cash' | 'card' | 'transfer' = 'cash',
  status: 'completed' | 'partial' = 'completed'
) {
  const supabase = createClient();
  
  // Check if payment exists
  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('student_id', studentId)
    .eq('group_id', groupId)
    .eq('month_year', monthYear)
    .single();

  if (existing) {
    // Update
    const { error } = await supabase
      .from('payments')
      .update({ amount, payment_method: method, status, payment_date: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) return { success: false, error: error.message };

    // Trigger instant Telegram receipt notification to student and parents
    sendPaymentReceiptToStudentAndParents({
      studentId,
      groupId,
      amount,
      paymentMethod: method,
      monthYear,
    }).catch(console.error);

    return { success: true };
  } else {
    // Insert
    const { error } = await supabase
      .from('payments')
      .insert({
        student_id: studentId,
        group_id: groupId,
        amount,
        month_year: monthYear,
        payment_method: method,
        status,
        payment_date: new Date().toISOString()
      });
    if (error) return { success: false, error: error.message };

    // Trigger instant Telegram receipt notification to student and parents
    sendPaymentReceiptToStudentAndParents({
      studentId,
      groupId,
      amount,
      paymentMethod: method,
      monthYear,
    }).catch(console.error);

    return { success: true };
  }
}

export async function deletePayment(studentId: string, groupId: string, monthYear: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('student_id', studentId)
    .eq('group_id', groupId)
    .eq('month_year', monthYear);
    
  if (error) return { success: false, error: error.message };
  return { success: true };
}
