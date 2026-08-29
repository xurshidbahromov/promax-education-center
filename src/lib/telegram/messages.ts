/**
 * Telegram message templates and keyboard builders
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://promaxedu.uz';

// ─── Keyboards ─────────────────────────────────────────────────────────────────

export function buildReplyKeyboard(linked: boolean, role: string = 'student') {
  if (!linked) {
    return {
      keyboard: [
        [
          {
            text: '🔗 Platformaga ulash',
            web_app: { url: `${APP_URL}/tg/link` },
          },
        ],
        [
          {
            text: '📱 Ota-ona sifatida ulanish',
            request_contact: true,
          },
        ],
      ],
      resize_keyboard: true,
      is_persistent: true,
    };
  }

  if (role === 'parent') {
    return buildParentReplyKeyboard();
  }

  if (role === 'staff' || role === 'admin') {
    return {
      keyboard: [
        [
          {
            text: '📱 Mini App ochish',
            web_app: { url: `${APP_URL}/tg` },
          },
        ],
        [
          { text: '👥 O\'quvchilar' },
          { text: '📝 Testlarni tekshirish' },
        ],
        [
          { text: '🏫 Guruhlar' },
          { text: '👤 Profil' },
        ],
      ],
      resize_keyboard: true,
      is_persistent: true,
    };
  }

  // Default: Student
  return {
    keyboard: [
      [
        {
          text: '📱 Mini App ochish',
          web_app: { url: `${APP_URL}/tg` },
        },
      ],
      [
        { text: '📝 Testlar' },
        { text: '📊 Natijalarim' },
      ],
      [
        { text: '📚 Darslar' },
        { text: '👤 Profil' },
      ],
      [
        {
          text: '📱 Ota-ona sifatida ulanish',
          request_contact: true,
        },
      ],
    ],
    resize_keyboard: true,
    is_persistent: true,
  };
}

export function buildParentReplyKeyboard() {
  return {
    keyboard: [
      [
        {
          text: '📱 Mini App ochish',
          web_app: { url: `${APP_URL}/tg` },
        },
      ],
      [
        { text: '👨‍👩‍👧‍👦 Farzandim Natijalari' },
        { text: '💳 To\'lovlar Tarixi' },
      ],
      [
        { text: '🏫 Farzandim Guruhlari' },
        { text: '📞 Markaz Bilan Bog\'lanish' },
      ],
    ],
    resize_keyboard: true,
    is_persistent: true,
  };
}

export function buildMainMenuKeyboard(linked: boolean, role: string = 'student') {
 if (!linked) {
 return {
 inline_keyboard: [
 [
 {
 text: '🔗 Platformaga ulash',
 web_app: { url: `${APP_URL}/tg/link` },
 },
 ],
 [
 {
 text: '🌐 Saytga o\'tish',
 url: APP_URL,
 },
 ],
 ],
 };
 }

 if (role === 'staff' || role === 'admin') {
 return {
 inline_keyboard: [
 [
 {
 text: '📱 Mini App ochish',
 web_app: { url: `${APP_URL}/tg` },
 },
 ],
 [
 {
 text: '👥 O\'quvchilar',
 callback_data: 'menu_students',
 },
 {
 text: '📝 Testlarni tekshirish',
 callback_data: 'menu_check_tests',
 },
 ],
 [
 {
 text: '🏫 Guruhlar',
 callback_data: 'menu_groups',
 },
 {
 text: '👤 Profil',
 callback_data: 'menu_profile',
 },
 ],
 ],
 };
 }

 // Default: Student
 return {
 inline_keyboard: [
 [
 {
 text: '📱 Mini App ochish',
 web_app: { url: `${APP_URL}/tg` },
 },
 ],
 [
 {
 text: '📝 Testlar',
 callback_data: 'menu_tests',
 },
 {
 text: '📊 Natijalarim',
 callback_data: 'menu_results',
 },
 ],
 [
 {
 text: '📚 Darslar',
 callback_data: 'menu_lessons',
 },
 {
 text: '👤 Profil',
 callback_data: 'menu_profile',
 },
 ],
 ],
 };
}

export function buildOpenAppKeyboard() {
 return {
 inline_keyboard: [
 [
 {
 text: '📱 Platformani ochish',
 web_app: { url: `${APP_URL}/tg` },
 },
 ],
 ],
 };
}

// ─── Messages ──────────────────────────────────────────────────────────────────

export function buildWelcomeMessage(
 firstName: string,
 linked: boolean,
 role: string = 'student'
): string {
 if (!linked) {
 return (
 `👋 <b>Salom, ${firstName}!</b>\n\n`+
 `🎓 <b>Promax Education</b> platformasiga xush kelibsiz!\n\n`+
 `Bu bot orqali siz:\n`+
 `• 📝 Online testlar topshirishingiz\n`+
 `• 📊 Natijalaringizni ko'rishingiz\n`+
 `• 📚 Darslarni kuzatishingiz\n`+
 `• 🔔 Bildirishnomalar olishingiz mumkin\n\n`+
 `Boshlash uchun <b>Platformaga ulash</b> tugmasini bosing 👇`
 );
 }

 return (
 `👋 <b>Qaytib kelganingiz bilan, ${firstName}!</b>\n\n`+
 `🎓 <b>Promax Education</b> platformasiga xush kelibsiz!\n\n`+
 `Siz tizimga <b>${role === 'staff' || role === 'admin' ? 'O\'qituvchi' : 'O\'quvchi'}</b> sifatida kirgansiz.\n\n`+
 `📱 Mini App-ni ochish yoki quyidagi bo'limlardan birini tanlang 👇`
 );
}

export function buildStatsMessage(profile: {
 full_name: string;
 coins: number;
 role: string;
}, additionalStats?: { testsCompleted?: number; rank?: number }): string {
 if (profile.role === 'staff' || profile.role === 'admin') {
 return (
 `📊 <b>O'qituvchi Statistikasi</b>\n\n`+
 `👤 Ism: <b>${profile.full_name || 'Noma\'lum'}</b>\n`+
 `💼 Status: <b>O'qituvchi</b>\n\n`+
 `📱 Guruhlar va o'quvchilarni boshqarish uchun Mini App-ni oching:`
 );
 }

 return (
 `📊 <b>Mening statistikam</b>\n\n`+
 `👤 Ism: <b>${profile.full_name || 'Noma\'lum'}</b>\n`+
 `🎓 Status: <b>O'quvchi</b>\n\n`+
 `🪙 Tangalar: <b>${profile.coins || 0} Coin</b> 🟡\n`+
 `📝 Yechilgan testlar: <b>${additionalStats?.testsCompleted || 0} ta</b>\n`+
 `🏆 Reytingdagi o'rin: <b>${additionalStats?.rank ? additionalStats.rank+ '-o\'rin' : 'Noma\'lum'}</b>\n\n`+
 `📱 Batafsil natijalar uchun Mini App-ni oching:`
 );
}

export function buildLinkSuccessMessage(firstName: string): string {
 return (
 `✅ <b>Muvaffaqiyatli ulandi!</b>\n\n`+
 `Salom, <b>${firstName}</b>! Telegram hisobingiz Promax Education platformasiga ulandi.\n\n`+
 `Endi siz bildirishnomalar olasiz va Mini App orqali platformaga kirishingiz mumkin 🎉`
 );
}

export function buildNotificationMessage(
 title: string,
 body: string
): string {
 return `🔔 <b>${title}</b>\n\n${body}`;
}

export function buildNewResultNotification(
  studentName: string,
  examTitle: string,
  score: number,
  maxScore: number
): string {
  const percent = Math.round((score / maxScore) * 100);
  const emoji = percent >= 70 ? '🏆' : percent >= 50 ? '📈' : '💪';
  return (
    `${emoji} <b>Yangi natija!</b>\n\n`+
    `O'quvchi: <b>${studentName}</b>\n`+
    `Imtihon: <b>${examTitle}</b>\n`+
    `Ball: <b>${score}/${maxScore}</b> (${percent}%)\n\n`+
    `Batafsil ko'rish uchun Mini App-ni oching:`
  );
}

export function buildParentLinkSuccessMessage(parentName: string, studentNames: string[]): string {
  return (
    `✅ <b>Muvaffaqiyatli ulandi!</b>\n\n`+
    `Salom, <b>${parentName}</b>!\n\n`+
    `Telegram hisobingiz quyidagi farzandingiz(lar)ga bog'landi:\n`+
    studentNames.map(s => `• <b>${s}</b>`).join('\n') + `\n\n`+
    `Endi farzandingizning test natijalari, dars davomati hamda to'lov cheklari ushbu botga avtomatik yetib keladi. 🎓✨`
  );
}

export function buildPaymentReceiptMessage({
  studentName,
  groupName,
  amount,
  method,
  monthYear,
  date,
  receiptNumber
}: {
  studentName: string;
  groupName?: string;
  amount: number;
  method: string;
  monthYear: string;
  date?: string;
  receiptNumber?: string;
}): string {
  const formattedAmount = amount.toLocaleString('uz-UZ');
  const methodLabel = method === 'card' ? '💳 Plastik karta' : method === 'transfer' ? '🏦 Bank o\'tkazmasi' : '💵 Naqd pul';
  const payDate = date ? new Date(date).toLocaleDateString('uz-UZ') : new Date().toLocaleDateString('uz-UZ');

  return (
    `🧾 <b>TO'LOV QABUL QILINDI #CHEK-${receiptNumber || Date.now().toString().slice(-6)}</b>\n\n`+
    `🎓 O'quvchi: <b>${studentName}</b>\n`+
    (groupName ? `🏫 Guruh / Fan: <b>${groupName}</b>\n` : '') +
    `📅 Oylik To'lov: <b>${monthYear}</b>\n`+
    `💰 Summa: <b>${formattedAmount} so'm</b>\n`+
    `💳 To'lov Usuli: <b>${methodLabel}</b>\n`+
    `⏱️ Sana: <b>${payDate}</b>\n\n`+
    `✅ <i>To'lovingiz uchun rahmat! Promax Education o'quv markazi.</i>`
  );
}

export function buildAttendanceMessage({
  studentName,
  groupName,
  date,
  status,
  homework,
  notes,
  isParent = false
}: {
  studentName: string;
  groupName?: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  homework?: 'done' | 'not_done' | 'partially' | 'none';
  notes?: string;
  isParent?: boolean;
}): string {
  const formattedDate = new Date(date).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
  const roleGreeting = isParent ? `Hurmatli ota-ona!\nFarzandingiz ` : `Hurmatli `;

  let statusBadge = '';
  let statusIcon = '';
  if (status === 'present') {
    statusIcon = '✅';
    statusBadge = '🟢 Darsda qatnashdi (Keldi)';
  } else if (status === 'absent') {
    statusIcon = '⚠️';
    statusBadge = '🔴 Darsga KELMADI';
  } else if (status === 'late') {
    statusIcon = '⏱️';
    statusBadge = '🟡 Darsga KECHIKIB KELDI';
  }

  let hwBadge = '';
  if (homework === 'done') hwBadge = '✅ Bajarilgan';
  else if (homework === 'not_done') hwBadge = '❌ Bajarilmagan';
  else if (homework === 'partially') hwBadge = '⚠️ Qisman bajarilgan';

  let msg = `${statusIcon} <b>DAVOMAT HISOBOTI</b>\n\n` +
    `${roleGreeting}<b>${studentName}</b>ning dars davomati:\n\n` +
    (groupName ? `🏫 Guruh / Fan: <b>${groupName}</b>\n` : '') +
    `📅 Sana: <b>${formattedDate}</b>\n` +
    `📌 Davomat holati: <b>${statusBadge}</b>\n`;

  if (hwBadge && status !== 'absent') {
    msg += `📚 Uy vazifasi: <b>${hwBadge}</b>\n`;
  }

  if (notes && notes.trim()) {
    msg += `📝 O'qituvchi izohi: <i>${notes.trim()}</i>\n`;
  }

  if (status === 'absent') {
    msg += `\n⚠️ <i>Iltimos, farzandingiz darslarni muntazam qoldirmasligini nazorat qiling.</i>\n`;
  } else if (homework === 'not_done') {
    msg += `\n📌 <i>Uy vazifalarini to'liq bajarishi uchun e'tibor qaratishingizni so'raymiz.</i>\n`;
  }

  msg += `\n✨ <i>Promax Education o'quv markazi</i>`;
  return msg;
}

export function buildDTMExamResultMessage({
  studentName,
  examTitle,
  examDate,
  directionTitle,
  directionCode,
  totalScore,
  maxScore = 189.0,
  compulsoryMathScore = 0,
  compulsoryHistoryScore = 0,
  compulsoryLangScore = 0,
  subject1Score = 0,
  subject2Score = 0,
  subject1Name = "1-Asosiy fan",
  subject2Name = "2-Asosiy fan",
  isParent = false
}: {
  studentName: string;
  examTitle?: string;
  examDate: string;
  directionTitle: string;
  directionCode?: string;
  totalScore: number;
  maxScore?: number;
  compulsoryMathScore?: number;
  compulsoryHistoryScore?: number;
  compulsoryLangScore?: number;
  subject1Score?: number;
  subject2Score?: number;
  subject1Name?: string;
  subject2Name?: string;
  isParent?: boolean;
}): string {
  const formattedDate = new Date(examDate).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
  const percentage = Math.round((totalScore / maxScore) * 100);
  const roleGreeting = isParent ? `Hurmatli ota-ona!\nFarzandingiz ` : `Hurmatli `;

  let badge = '💪 Ko\'proq tayyorgarlik talab etiladi';
  if (totalScore >= 150) badge = '🥇 Davlat Granti uchun yuqori imkoniyat!';
  else if (totalScore >= 120) badge = '🥈 To\'lov-shartnoma uchun mustahkam natija!';
  else if (totalScore >= 80) badge = '📈 Yaxshi natija, yana o\'sish mumkin!';

  return (
    `🏆 <b>DTM MOCK IMTIHONI NATIJASI</b> 📊\n\n` +
    `${roleGreeting}<b>${studentName}</b> yakshanbalik DTM Mock testini topshirdi:\n\n` +
    (examTitle ? `📝 Imtihon: <b>${examTitle}</b>\n` : '') +
    `📅 Sana: <b>${formattedDate}</b>\n` +
    `🎯 Yo'nalish: <b>${directionTitle}</b> ${directionCode ? `(kod: ${directionCode})` : ''}\n\n` +
    `🌟 <b>UMUMIY NATIJA: ${totalScore.toFixed(1)} / ${maxScore.toFixed(1)} BALL (${percentage}%)</b>\n\n` +
    `📚 <b>Majburiy blok fanlar (10 tadan):</b>\n` +
    `• Ona tili: <b>${compulsoryLangScore.toFixed(1)} ball</b> (1.1)\n` +
    `• Matematika: <b>${compulsoryMathScore.toFixed(1)} ball</b> (1.1)\n` +
    `• O'zbekiston tarixi: <b>${compulsoryHistoryScore.toFixed(1)} ball</b> (1.1)\n\n` +
    `🎯 <b>Asosiy mutaxassislik bloklari:</b>\n` +
    `• ${subject1Name} (30 ta): <b>${subject1Score.toFixed(1)} ball</b> (3.1)\n` +
    `• ${subject2Name} (30 ta): <b>${subject2Score.toFixed(1)} ball</b> (2.1)\n\n` +
    `⭐️ <b>Xulosa:</b> <b>${badge}</b>\n\n` +
    `📱 <i>Batafsil natijalar va tahlillar Promax platformasida saqlanadi.</i>\n` +
    `✨ <i>Promax Education — Sifatli ta'lim & Katta marralar sari!</i>`
  );
}

export function buildOnlineTestResultMessage({
  studentName,
  testTitle,
  score,
  maxScore,
  percentage,
  timeSpent,
  isParent = false
}: {
  studentName: string;
  testTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent?: string;
  isParent?: boolean;
}): string {
  const roleGreeting = isParent ? `Hurmatli ota-ona!\nFarzandingiz ` : `Hurmatli `;
  const emoji = percentage >= 80 ? '🏆' : percentage >= 50 ? '📈' : '💪';

  return (
    `${emoji} <b>TEST NATIJASI</b> 📝\n\n` +
    `${roleGreeting}<b>${studentName}</b> online testni yakunladi:\n\n` +
    `📖 Test nomi: <b>${testTitle}</b>\n` +
    `📊 Natija: <b>${score} / ${maxScore} ball (${percentage}%)</b>\n` +
    (timeSpent ? `⏱️ Sarflangan vaqt: <b>${timeSpent}</b>\n` : '') +
    `\n` +
    (percentage >= 80 ? '🎉 <i>Ajoyib natija, tabriklaymiz!</i>' : percentage >= 50 ? '👍 <i>Yaxshi natija, yanada o\'sishda davom eting!</i>' : '💪 <i>Keyingi safar albatta bundan ham yuqori natija bo\'ladi!</i>') +
    `\n\n✨ <i>Promax Education platformasi</i>`
  );
}
