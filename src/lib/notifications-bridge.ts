import { createClient } from '@/utils/supabase/client';

interface PaymentReceiptParams {
  studentId: string;
  groupId?: string;
  amount: number;
  paymentMethod: string;
  monthYear: string;
}

/**
 * Send instant payment receipt notification to student and all linked parents.
 * Client-safe: proxies through /api/notify (server route) to avoid CORS & token exposure.
 */
export async function sendPaymentReceiptToStudentAndParents(
  params: PaymentReceiptParams
): Promise<void> {
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'payment_receipt', ...params }),
    });
  } catch (error) {
    console.error('Error sending payment receipt notification:', error);
  }
}

/**
 * Send notification to user and their linked parents via Telegram & Web App.
 * Client-safe: proxies through /api/notify (server route).
 */
export async function sendSystemNotificationToUserAndParents({
  userId,
  title,
  body,
}: {
  userId: string;
  title: string;
  body: string;
}): Promise<void> {
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'system_notification', userId, title, body }),
    });
  } catch (error) {
    console.error('Error sending system notification:', error);
  }
}
