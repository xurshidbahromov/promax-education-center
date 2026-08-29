/**
 * Notifications Bridge
 * Client-safe helper methods that proxy via /api/notify server endpoint
 * Dispatches notifications simultaneously to students, all linked parents, and in-app web notifications.
 */

export interface PaymentReceiptParams {
  studentId: string;
  groupId?: string;
  amount: number;
  paymentMethod: string;
  monthYear: string;
}

export interface AttendanceNotificationParams {
  studentId: string;
  groupId?: string;
  groupName?: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  homework?: 'done' | 'not_done' | 'partially' | 'none';
  notes?: string;
}

export interface DTMResultNotificationParams {
  studentId: string;
  examTitle?: string;
  examDate: string;
  directionCode?: string;
  directionTitle?: string;
  scores: {
    total: number;
    comp_math?: number;
    comp_history?: number;
    comp_lang?: number;
    subject_1?: number;
    subject_2?: number;
  };
}

export interface TestResultNotificationParams {
  studentId: string;
  testTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent?: string;
}

/**
 * 1. Send instant payment receipt notification to student and all linked parents.
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
 * 2. Send attendance notification (present / absent / late / homework) to student and all linked parents.
 */
export async function sendAttendanceNotificationToStudentAndParents(
  params: AttendanceNotificationParams
): Promise<void> {
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'attendance', ...params }),
    });
  } catch (error) {
    console.error('Error sending attendance notification:', error);
  }
}

/**
 * 3. Send Sunday DTM Mock test result notification to student and all linked parents.
 */
export async function sendDTMResultToStudentAndParents(
  params: DTMResultNotificationParams
): Promise<void> {
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'dtm_result', ...params }),
    });
  } catch (error) {
    console.error('Error sending DTM result notification:', error);
  }
}

/**
 * 4. Send online test attempt result notification to student and all linked parents.
 */
export async function sendTestAttemptResultToStudentAndParents(
  params: TestResultNotificationParams
): Promise<void> {
  try {
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'test_result', ...params }),
    });
  } catch (error) {
    console.error('Error sending test result notification:', error);
  }
}

/**
 * 5. Send generic system notification to user and their linked parents.
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
