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
      .select('full_name, coins, role, telegram_id')
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

      await sendMessage(chatId, buildWelcomeMessage(firstName, isLinked), {
        reply_markup: buildMainMenuKeyboard(isLinked),
      });
    } else if (text === '/menu') {
      await sendMessage(chatId, `📋 <b>Asosiy menyu</b>\n\nQuyidagi bo'limlardan birini tanlang:`, {
        reply_markup: buildMainMenuKeyboard(isLinked),
      });
    } else if (text === '/mystats') {
      if (!isLinked || !profile) {
        await sendMessage(
          chatId,
          '⚠️ Platformaga ulanmagan. /start buyrug\'ini yuboring va hisobingizni ulang.',
          { reply_markup: buildMainMenuKeyboard(false) }
        );
      } else {
        await sendMessage(chatId, buildStatsMessage(profile), {
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
    } else {
      // Unknown command
      await sendMessage(
        chatId,
        `❓ Noma'lum buyruq.\n\n/menu — Asosiy menyu\n/help — Yordam`,
        { reply_markup: buildMainMenuKeyboard(isLinked) }
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
    };

    const labels: Record<string, string> = {
      menu_tests: '📝 Testlar bo\'limi',
      menu_results: '📊 Natijalar bo\'limi',
      menu_lessons: '📚 Darslar bo\'limi',
      menu_profile: '👤 Profil bo\'limi',
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
