import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  verifyWebhookSignature,
  sendMessage,
  answerCallbackQuery,
} from '@/lib/telegram/bot';
import {
  buildWelcomeMessage,
  buildStatsMessage,
  buildMainMenuKeyboard,
  buildReplyKeyboard,
  buildOpenAppKeyboard,
} from '@/lib/telegram/messages';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://promaxedu.uz';

export async function POST(request: NextRequest) {
  // ─── Security check ────────────────────────────────────────────────────────
  const secretToken = request.headers.get('x-telegram-bot-api-secret-token') || '';
  if (!verifyWebhookSignature(secretToken)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let update: any;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = await createClient();

  // ─── Handle /message ───────────────────────────────────────────────────────
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat.id;
    const telegramId = msg.from?.id;
    const firstName = msg.from?.first_name || 'Foydalanuvchi';
    const text = msg.text || '';

    // Find linked profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, coins, role, telegram_id')
      .eq('telegram_id', telegramId)
      .single();

    const isLinked = !!profile;

    if (text === '/start' || text.startsWith('/start ')) {
      // Handle deep link token from /start
      const startPayload = text.split(' ')[1];
      if (startPayload && startPayload.startsWith('link_')) {
        const linkToken = startPayload.replace('link_', '');
        // Find profile by link token stored in metadata
        const { data: tokenProfile } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('telegram_link_token', linkToken)
          .single();

        if (tokenProfile) {
          // Link telegram_id to profile
          await supabase
            .from('profiles')
            .update({
              telegram_id: telegramId,
              telegram_username: msg.from?.username,
              telegram_link_token: null,
            })
            .eq('id', tokenProfile.id);

          await sendMessage(
            chatId,
            `✅ <b>Muvaffaqiyatli ulandi!</b>\n\nSalom, <b>${tokenProfile.full_name || firstName}</b>! Telegram hisobingiz Promax Education platformasiga ulandi. 🎉\n\nEndi bildirishnomalar olasiz va Mini App orqali kirishingiz mumkin.`,
            { reply_markup: buildOpenAppKeyboard() }
          );
          return NextResponse.json({ ok: true });
        }
      }

      await sendMessage(chatId, buildWelcomeMessage(firstName, isLinked, profile?.role), {
        reply_markup: buildReplyKeyboard(isLinked, profile?.role),
      });
    } else if (text === '/menu') {
      await sendMessage(chatId, `📋 <b>Asosiy menyu</b>\n\nQuyidagi bo'limlardan birini tanlang:`, {
        reply_markup: buildReplyKeyboard(isLinked, profile?.role),
      });
    } else if (text === '/mystats' || text === '👤 Profil') {
      if (!isLinked || !profile) {
        await sendMessage(
          chatId,
          '⚠️ Platformaga ulanmagan. /start buyrug\'ini yuboring va hisobingizni ulang.',
          { reply_markup: buildMainMenuKeyboard(false) }
        );
      } else {
        let additionalStats = undefined;
        if (profile.role === 'student') {
          // Fetch tests completed
          const { count: testsCompleted } = await supabase
            .from('test_results')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', profile.id);

          // Get rank (naïve approach: count how many students have more coins)
          const { count: higherCoins } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'student')
            .gt('coins', profile.coins || 0);
          
          const rank = (higherCoins || 0) + 1;
          
          additionalStats = {
            testsCompleted: testsCompleted || 0,
            rank
          };
        }

        await sendMessage(chatId, buildStatsMessage(profile, additionalStats), {
          reply_markup: buildOpenAppKeyboard(),
        });
      }
    } else if (text === '/help') {
      await sendMessage(
        chatId,
        `ℹ️ <b>Yordam</b>\n\n` +
        `/start — Botni ishga tushirish\n` +
        `/menu — Asosiy menyu\n` +
        `/mystats — Statistikam\n` +
        `/help — Yordam\n\n` +
        `📱 Mini App orqali barcha funksiyalardan foydalaning!`
      );
    } else if (['📝 Testlar', '📊 Natijalarim', '📚 Darslar', '👥 O\'quvchilar', '📝 Testlarni tekshirish', '🏫 Guruhlar'].includes(text)) {
      await sendMessage(
        chatId,
        `${text.split(' ')[1]} bo'limini ochish uchun quyidagi tugmani bosing:`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: `📱 Mini App'da ochish`, web_app: { url: `${APP_URL}/tg` } }],
            ],
          },
        }
      );
    } else {
      // Unknown command
      await sendMessage(
        chatId,
        `❓ Noma'lum buyruq.\n\n/menu — Asosiy menyu\n/help — Yordam`,
        { reply_markup: buildReplyKeyboard(isLinked, profile?.role) }
      );
    }
  }

  // ─── Handle callback_query ─────────────────────────────────────────────────
  if (update.callback_query) {
    const query = update.callback_query;
    const chatId = query.message?.chat?.id;
    const data = query.data;

    const deepLinks: Record<string, string> = {
      menu_tests: `${APP_URL}/tg`,
      menu_results: `${APP_URL}/tg`,
      menu_lessons: `${APP_URL}/tg`,
      menu_profile: `${APP_URL}/tg`,
      menu_students: `${APP_URL}/tg`,
      menu_check_tests: `${APP_URL}/tg`,
      menu_groups: `${APP_URL}/tg`,
    };

    const labels: Record<string, string> = {
      menu_tests: '📝 Testlar bo\'limi',
      menu_results: '📊 Natijalar bo\'limi',
      menu_lessons: '📚 Darslar bo\'limi',
      menu_profile: '👤 Profil bo\'limi',
      menu_students: '👥 O\'quvchilar bo\'limi',
      menu_check_tests: '📝 Testlarni tekshirish',
      menu_groups: '🏫 Guruhlar bo\'limi',
    };

    if (data && deepLinks[data]) {
      await answerCallbackQuery(query.id, `${labels[data]} ochilmoqda...`);
      await sendMessage(
        chatId,
        `${labels[data]} uchun Mini App-ni oching:`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '📱 Mini App ochish', web_app: { url: deepLinks[data] } }],
            ],
          },
        }
      );
    } else {
      await answerCallbackQuery(query.id);
    }
  }

  return NextResponse.json({ ok: true });
}
