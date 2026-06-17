/**
 * Telegram message templates and keyboard builders
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://promaxedu.uz';

// ─── Keyboards ─────────────────────────────────────────────────────────────────

export function buildMainMenuKeyboard(linked: boolean) {
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
  linked: boolean
): string {
  if (!linked) {
    return (
      `👋 <b>Salom, ${firstName}!</b>\n\n` +
      `🎓 <b>Promax Education</b> platformasiga xush kelibsiz!\n\n` +
      `Bu bot orqali siz:\n` +
      `• 📝 Online testlar topshirishingiz\n` +
      `• 📊 Natijalaringizni ko'rishingiz\n` +
      `• 📚 Darslarni kuzatishingiz\n` +
      `• 🔔 Bildirishnomalar olishingiz mumkin\n\n` +
      `Boshlash uchun <b>Platformaga ulash</b> tugmasini bosing 👇`
    );
  }

  return (
    `👋 <b>Qaytib kelganingiz bilan, ${firstName}!</b>\n\n` +
    `🎓 <b>Promax Education</b> platformasiga xush kelibsiz!\n\n` +
    `📱 Mini App-ni ochish yoki quyidagi bo'limlardan birini tanlang 👇`
  );
}

export function buildStatsMessage(profile: {
  full_name: string;
  coins: number;
  role: string;
}): string {
  return (
    `📊 <b>Mening statistikam</b>\n\n` +
    `👤 Ism: <b>${profile.full_name || 'Noma\'lum'}</b>\n` +
    `🪙 Tangalar: <b>${profile.coins || 0} ta</b>\n` +
    `🎓 Status: <b>${profile.role === 'student' ? 'O\'quvchi' : profile.role}</b>\n\n` +
    `📱 Batafsil natijalar uchun Mini App-ni oching:`
  );
}

export function buildLinkSuccessMessage(firstName: string): string {
  return (
    `✅ <b>Muvaffaqiyatli ulandi!</b>\n\n` +
    `Salom, <b>${firstName}</b>! Telegram hisobingiz Promax Education platformasiga ulandi.\n\n` +
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
    `${emoji} <b>Yangi natija!</b>\n\n` +
    `O'quvchi: <b>${studentName}</b>\n` +
    `Imtihon: <b>${examTitle}</b>\n` +
    `Ball: <b>${score}/${maxScore}</b> (${percent}%)\n\n` +
    `Batafsil ko'rish uchun Mini App-ni oching:`
  );
}
