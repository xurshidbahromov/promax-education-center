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
  buildParentReplyKeyboard,
  buildParentLinkSuccessMessage,
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

    // Handle Contact Sharing for Parent Registration
    if (msg.contact) {
      const rawPhone = msg.contact.phone_number || '';
      const phoneClean = rawPhone.replace(/\D/g, '');
      const phoneWithPlus = '+' + phoneClean;

      // Find matching students in profiles where parent_phone or phone contains clean number
      const { data: matchedStudents } = await supabase
        .from('profiles')
        .select('id, full_name, parent_name, parent_phone')
        .or(`parent_phone.ilike.%${phoneClean}%,phone.ilike.%${phoneClean}%`);

      if (matchedStudents && matchedStudents.length > 0) {
        for (const student of matchedStudents) {
          await supabase.from('parent_students').upsert({
            parent_telegram_id: telegramId,
            parent_phone: phoneWithPlus,
            parent_name: msg.contact.first_name || 'Ota-ona',
            student_id: student.id,
          }, { onConflict: 'parent_telegram_id,student_id' });
        }

        const studentNames = matchedStudents.map((s: any) => s.full_name || "O'quvchi");
        const parentName = msg.contact.first_name || 'Ota-ona';

        await sendMessage(
          chatId,
          buildParentLinkSuccessMessage(parentName, studentNames),
          { reply_markup: buildParentReplyKeyboard() }
        );
        return NextResponse.json({ ok: true });
      } else {
        await sendMessage(
          chatId,
          `⚠️ <b>O'quvchi topilmadi</b>\n\n<b>${phoneWithPlus}</b> telefon raqamiga biriktirilgan o'quvchi platformada topilmadi.\n\nIltimos, Promax Education o'quv markazimiz ma'muriyatiga ota-ona telefon raqamingizni taqdim eting, shunda ular sizni farzandingizga bog'lab berishadi. 📞`,
          { reply_markup: buildReplyKeyboard(false) }
        );
        return NextResponse.json({ ok: true });
      }
    }

    // Check if user is linked profile or linked parent
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, coins, role, telegram_id')
      .eq('telegram_id', telegramId)
      .single();

    const { data: parentLinks } = await supabase
      .from('parent_students')
      .select('student_id, student:profiles!student_id(id, full_name)')
      .eq('parent_telegram_id', telegramId);

    const isLinked = !!profile || !!(parentLinks && parentLinks.length > 0);
    const effectiveRole = profile?.role || (parentLinks && parentLinks.length > 0 ? 'parent' : 'student');

    if (text === '/start' || text.startsWith('/start ')) {
      // Handle deep link token from /start
      const startPayload = text.split(' ')[1];
      if (startPayload && startPayload.startsWith('link_')) {
        const linkToken = startPayload.replace('link_', '');
        const { data: tokenProfile } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('telegram_link_token', linkToken)
          .single();

        if (tokenProfile) {
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

      await sendMessage(chatId, buildWelcomeMessage(firstName, isLinked, effectiveRole), {
        reply_markup: buildReplyKeyboard(isLinked, effectiveRole),
      });
    } else if (text === '/menu') {
      await sendMessage(chatId, `📋 <b>Asosiy menyu</b>\n\nQuyidagi bo'limlardan birini tanlang:`, {
        reply_markup: buildReplyKeyboard(isLinked, effectiveRole),
      });
    } else if (text === '👨‍👩‍👧‍👦 Farzandim Natijalari') {
      if (!parentLinks || parentLinks.length === 0) {
        await sendMessage(chatId, `⚠️ Sizga biriktirilgan farzand topilmadi. Ota-ona sifatida ulanish uchun kontaktingizni yuboring.`, {
          reply_markup: buildReplyKeyboard(false)
        });
      } else {
        const studentIds = parentLinks.map((p: any) => p.student_id);
        const { data: results } = await supabase
          .from('test_results')
          .select('score, max_score, created_at, student:profiles(full_name), test:tests(title)')
          .in('student_id', studentIds)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!results || results.length === 0) {
          await sendMessage(chatId, `📊 <b>Farzandingiz natijalari:</b>\n\nHozircha topshirilgan testlar topilmadi.`);
        } else {
          const listText = results.map((r: any) => {
            const percent = Math.round((r.score / (r.max_score || 100)) * 100);
            return `🎓 O'quvchi: <b>${r.student?.full_name || 'Farzandingiz'}</b>\n📝 Test: <b>${r.test?.title || 'Imtihon'}</b>\n📊 Natija: <b>${r.score}/${r.max_score} (${percent}%)</b>\n⏱️ Date: ${new Date(r.created_at).toLocaleDateString('uz-UZ')}\n`;
          }).join('\n─────────────────\n');

          await sendMessage(chatId, `📊 <b>Farzandingizning so'nggi test natijalari:</b>\n\n${listText}`, {
            reply_markup: buildParentReplyKeyboard()
          });
        }
      }
    } else if (text === '💳 To\'lovlar Tarixi') {
      if (!parentLinks || parentLinks.length === 0) {
        await sendMessage(chatId, `⚠️ Sizga biriktirilgan farzand topilmadi.`, { reply_markup: buildReplyKeyboard(false) });
      } else {
        const studentIds = parentLinks.map((p: any) => p.student_id);
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('amount, payment_method, month_year, payment_date, student:profiles(full_name)')
          .in('student_id', studentIds)
          .order('payment_date', { ascending: false })
          .limit(5);

        if (!paymentsData || paymentsData.length === 0) {
          await sendMessage(chatId, `💳 <b>To'lovlar Tarixi:</b>\n\nHozircha to'lov yozuvlari topilmadi.`);
        } else {
          const listText = paymentsData.map((p: any) => {
            const amt = Number(p.amount || 0).toLocaleString('uz-UZ');
            const methodStr = p.payment_method === 'card' ? '💳 Karta' : '💵 Naqd';
            return `🎓 O'quvchi: <b>${p.student?.full_name}</b>\n📅 Oy: <b>${p.month_year}</b>\n💰 Summa: <b>${amt} so'm</b> (${methodStr})\n⏱️ Sana: ${new Date(p.payment_date).toLocaleDateString('uz-UZ')}`;
          }).join('\n─────────────────\n');

          await sendMessage(chatId, `💳 <b>Farzandingizning so'nggi to'lovlari:</b>\n\n${listText}`, {
            reply_markup: buildParentReplyKeyboard()
          });
        }
      }
    } else if (text === '🏫 Farzandim Guruhlari') {
      if (!parentLinks || parentLinks.length === 0) {
        await sendMessage(chatId, `⚠️ Biriktirilgan farzand topilmadi.`);
      } else {
        const studentIds = parentLinks.map((p: any) => p.student_id);
        const { data: groupStudents } = await supabase
          .from('group_students')
          .select('group:groups(name, subject:subjects(title)), student:profiles(full_name)')
          .in('student_id', studentIds);

        if (!groupStudents || groupStudents.length === 0) {
          await sendMessage(chatId, `🏫 <b>Farzandingiz guruhlari:</b>\n\nHozircha guruhlar topilmadi.`);
        } else {
          const textList = groupStudents.map((gs: any) => `🎓 <b>${gs.student?.full_name}</b>\n🏫 Guruh: <b>${gs.group?.name}</b> (${gs.group?.subject?.title || 'Fan'})\n`).join('\n');
          await sendMessage(chatId, `🏫 <b>Farzandingiz a'zo bo'lgan guruhlar:</b>\n\n${textList}`, {
            reply_markup: buildParentReplyKeyboard()
          });
        }
      }
    } else if (text === '📞 Markaz Bilan Bog\'lanish') {
      await sendMessage(
        chatId,
        `📞 <b>Promax Education O'quv Markazi</b>\n\n`+
        `📍 Manzil: Toshkent sh., Chilonzor tumani\n`+
        `📱 Telefon: +998 (90) 123-45-67\n`+
        `💬 Telegram: @promax_admin\n`+
        `🌐 Veb-sayt: ${APP_URL}`
      );
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
          const { count: testsCompleted } = await supabase
            .from('test_results')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', profile.id);

          const { count: higherCoins } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'student')
            .gt('coins', profile.coins || 0);

          const rank = (higherCoins || 0) + 1;
          additionalStats = { testsCompleted: testsCompleted || 0, rank };
        }

        await sendMessage(chatId, buildStatsMessage(profile, additionalStats), {
          reply_markup: buildOpenAppKeyboard(),
        });
      }
    } else if (text === '/help') {
      await sendMessage(
        chatId,
        `ℹ️ <b>Yordam</b>\n\n`+
        `/start — Botni ishga tushirish\n`+
        `/menu — Asosiy menyu\n`+
        `/mystats — Statistikam\n`+
        `/help — Yordam\n\n`+
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
      await sendMessage(
        chatId,
        `❓ Noma'lum buyruq.\n\n/menu — Asosiy menyu\n/help — Yordam`,
        { reply_markup: buildReplyKeyboard(isLinked, effectiveRole) }
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
