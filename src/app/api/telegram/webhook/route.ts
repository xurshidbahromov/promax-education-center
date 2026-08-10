import { NextRequest, NextResponse } from 'next/server';
import { createTelegramBotClient } from '@/utils/supabase/server';
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

  const supabase = await createTelegramBotClient();

  // ─── Handle message ────────────────────────────────────────────────────────
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat.id;
    const telegramId = msg.from?.id;
    const firstName = msg.from?.first_name || 'Foydalanuvchi';
    const text = msg.text || '';

    // ── Contact sharing (ota-ona) ──────────────────────────────────────────
    if (msg.contact) {
      const rawPhone = msg.contact.phone_number || '';
      const phoneClean = rawPhone.replace(/\D/g, '');
      const phoneWithPlus = '+' + phoneClean;

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
        await sendMessage(chatId, buildParentLinkSuccessMessage(parentName, studentNames), {
          reply_markup: buildParentReplyKeyboard()
        });
      } else {
        await sendMessage(
          chatId,
          `⚠️ <b>O'quvchi topilmadi</b>\n\n<b>${phoneWithPlus}</b> telefon raqamiga biriktirilgan o'quvchi topilmadi.\n\nIltimos, o'quv markaz ma'muriyatiga ota-ona telefon raqamingizni taqdim eting. 📞`,
          { reply_markup: buildReplyKeyboard(false) }
        );
      }
      return NextResponse.json({ ok: true });
    }

    // ── Load user info ─────────────────────────────────────────────────────
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

    // ── /start ─────────────────────────────────────────────────────────────
    if (text === '/start' || text.startsWith('/start ')) {
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
            .update({ telegram_id: telegramId, telegram_username: msg.from?.username, telegram_link_token: null })
            .eq('id', tokenProfile.id);

          await sendMessage(
            chatId,
            `✅ <b>Muvaffaqiyatli ulandi!</b>\n\nSalom, <b>${tokenProfile.full_name || firstName}</b>! Telegram hisobingiz Promax Education platformasiga ulandi. 🎉`,
            { reply_markup: buildOpenAppKeyboard() }
          );
          return NextResponse.json({ ok: true });
        }
      }

      await sendMessage(chatId, buildWelcomeMessage(firstName, isLinked, effectiveRole), {
        reply_markup: buildReplyKeyboard(isLinked, effectiveRole),
      });

    // ── /menu ──────────────────────────────────────────────────────────────
    } else if (text === '/menu') {
      await sendMessage(chatId, `📋 <b>Asosiy menyu</b>\n\nQuyidagi bo'limlardan birini tanlang:`, {
        reply_markup: buildReplyKeyboard(isLinked, effectiveRole),
      });

    // ── /help ──────────────────────────────────────────────────────────────
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

    // ── 👤 Profil / /mystats ───────────────────────────────────────────────
    } else if (text === '/mystats' || text === '👤 Profil') {
      if (!isLinked || !profile) {
        await sendMessage(chatId, '⚠️ Platformaga ulanmagan. /start buyrug\'ini yuboring.', {
          reply_markup: buildMainMenuKeyboard(false)
        });
      } else {
        let additionalStats = undefined;
        if (profile.role === 'student') {
          const { count: testsCompleted } = await supabase
            .from('test_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', profile.id);

          const { count: higherCoins } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'student')
            .gt('coins', profile.coins || 0);

          additionalStats = { testsCompleted: testsCompleted || 0, rank: (higherCoins || 0) + 1 };
        }
        await sendMessage(chatId, buildStatsMessage(profile, additionalStats), {
          reply_markup: buildOpenAppKeyboard(),
        });
      }

    // ── 📝 Testlar (Student) ───────────────────────────────────────────────
    } else if (text === '📝 Testlar') {
      if (!profile) {
        await sendMessage(chatId, '⚠️ Avval platformaga ulaning.', { reply_markup: buildReplyKeyboard(false) });
      } else {
        const { data: tests } = await supabase
          .from('tests')
          .select('id, title, time_limit, is_published')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!tests || tests.length === 0) {
          await sendMessage(chatId, `📝 <b>Testlar:</b>\n\nHozircha faol testlar mavjud emas.`, {
            reply_markup: buildOpenAppKeyboard()
          });
        } else {
          const listText = tests.map((t: any, i: number) =>
            `${i + 1}. 📝 <b>${t.title}</b> ${t.time_limit ? `(${t.time_limit} daqiqa)` : ''}`
          ).join('\n');
          await sendMessage(
            chatId,
            `📝 <b>Faol Testlar:</b>\n\n${listText}\n\n📱 Testni topshirish uchun Mini App ni oching:`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: '📱 Testlarni ochish', web_app: { url: `${APP_URL}/tg` } }]
                ]
              }
            }
          );
        }
      }

    // ── 📊 Natijalarim (Student) ───────────────────────────────────────────
    } else if (text === '📊 Natijalarim') {
      if (!profile) {
        await sendMessage(chatId, '⚠️ Avval platformaga ulaning.', { reply_markup: buildReplyKeyboard(false) });
      } else {
        const { data: attempts } = await supabase
          .from('test_attempts')
          .select('score, max_score, completed_at, test:tests(title)')
          .eq('student_id', profile.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(5);

        if (!attempts || attempts.length === 0) {
          await sendMessage(chatId, `📊 <b>Natijalarim:</b>\n\nHozircha topshirilgan testlar yo'q.`, {
            reply_markup: buildOpenAppKeyboard()
          });
        } else {
          const listText = attempts.map((a: any) => {
            const pct = Math.round(((a.score || 0) / (a.max_score || 100)) * 100);
            const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '✅' : '💪';
            const date = a.completed_at ? new Date(a.completed_at).toLocaleDateString('uz-UZ') : '';
            return `${emoji} <b>${(a.test as any)?.title || 'Test'}</b>\n   📊 ${a.score}/${a.max_score} ball (${pct}%) — ${date}`;
          }).join('\n\n');

          const total = attempts.length;
          const avgPct = Math.round(attempts.reduce((sum: number, a: any) =>
            sum + ((a.score || 0) / (a.max_score || 100)) * 100, 0) / total);

          await sendMessage(
            chatId,
            `📊 <b>So'nggi ${total} ta natijam:</b>\n\n${listText}\n\n📈 O'rtacha: <b>${avgPct}%</b>`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: '📊 Batafsil natijalar', web_app: { url: `${APP_URL}/tg` } }]
                ]
              }
            }
          );
        }
      }

    // ── 📚 Darslar (Student) ───────────────────────────────────────────────
    } else if (text === '📚 Darslar') {
      if (!profile) {
        await sendMessage(chatId, '⚠️ Avval platformaga ulaning.', { reply_markup: buildReplyKeyboard(false) });
      } else {
        const { data: groupStudents } = await supabase
          .from('group_students')
          .select('group:groups(id, name, schedule, subject:subjects(title))')
          .eq('student_id', profile.id);

        if (!groupStudents || groupStudents.length === 0) {
          await sendMessage(chatId, `📚 <b>Darslarim:</b>\n\nSiz hali hech qanday guruhga qo'shilmagansiz.`, {
            reply_markup: buildOpenAppKeyboard()
          });
        } else {
          const listText = groupStudents.map((gs: any) => {
            const g = gs.group as any;
            return `🏫 <b>${g?.name || 'Guruh'}</b>\n   📖 Fan: ${g?.subject?.title || 'Fan'}\n   📅 Jadval: ${g?.schedule || 'Belgilanmagan'}`;
          }).join('\n\n');

          await sendMessage(
            chatId,
            `📚 <b>Mening darslarim:</b>\n\n${listText}`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: '📚 Darslarni ko\'rish', web_app: { url: `${APP_URL}/tg` } }]
                ]
              }
            }
          );
        }
      }

    // ── 👥 O'quvchilar (Teacher/Admin) ─────────────────────────────────────
    } else if (text === "👥 O'quvchilar") {
      if (!profile || !['admin', 'teacher', 'staff'].includes(profile.role)) {
        await sendMessage(chatId, '⛔️ Bu bo\'lim faqat xodimlar uchun.', { reply_markup: buildReplyKeyboard(isLinked, effectiveRole) });
      } else {
        const { count: studentCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student');

        const { data: newStudents } = await supabase
          .from('profiles')
          .select('full_name, created_at')
          .eq('role', 'student')
          .order('created_at', { ascending: false })
          .limit(3);

        const newList = newStudents?.map((s: any) =>
          `• <b>${s.full_name || 'Yangi o\'quvchi'}</b>`
        ).join('\n') || '';

        await sendMessage(
          chatId,
          `👥 <b>O'quvchilar:</b>\n\n📊 Jami: <b>${studentCount || 0} ta</b> o'quvchi\n\n🆕 <b>So'nggi qo'shilganlar:</b>\n${newList}`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "👥 O'quvchilar ro'yxati", web_app: { url: `${APP_URL}/tg` } }]
              ]
            }
          }
        );
      }

    // ── 📝 Testlarni tekshirish (Teacher/Admin) ────────────────────────────
    } else if (text === '📝 Testlarni tekshirish') {
      if (!profile || !['admin', 'teacher', 'staff'].includes(profile.role)) {
        await sendMessage(chatId, '⛔️ Bu bo\'lim faqat xodimlar uchun.', { reply_markup: buildReplyKeyboard(isLinked, effectiveRole) });
      } else {
        const { data: pendingTests } = await supabase
          .from('test_attempts')
          .select('id, score, max_score, completed_at, student:profiles!test_attempts_student_id_fkey(full_name), test:tests(title)')
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(5);

        if (!pendingTests || pendingTests.length === 0) {
          await sendMessage(chatId, `📝 <b>Topshirilgan testlar:</b>\n\nHozircha yangi natijalar yo'q.`, {
            reply_markup: buildOpenAppKeyboard()
          });
        } else {
          const listText = pendingTests.map((a: any) => {
            const pct = Math.round(((a.score || 0) / (a.max_score || 100)) * 100);
            const date = a.completed_at ? new Date(a.completed_at).toLocaleDateString('uz-UZ') : '';
            return `📝 <b>${(a.test as any)?.title}</b>\n   👤 ${(a.student as any)?.full_name || 'O\'quvchi'}\n   📊 ${a.score}/${a.max_score} (${pct}%) — ${date}`;
          }).join('\n\n');

          await sendMessage(
            chatId,
            `📝 <b>So'nggi test natijalari:</b>\n\n${listText}`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: '📝 Batafsil ko\'rish', web_app: { url: `${APP_URL}/tg` } }]
                ]
              }
            }
          );
        }
      }

    // ── 🏫 Guruhlar (Teacher/Admin) ────────────────────────────────────────
    } else if (text === '🏫 Guruhlar') {
      if (!profile || !['admin', 'teacher', 'staff'].includes(profile.role)) {
        await sendMessage(chatId, '⛔️ Bu bo\'lim faqat xodimlar uchun.', { reply_markup: buildReplyKeyboard(isLinked, effectiveRole) });
      } else {
        const { data: groups } = await supabase
          .from('groups')
          .select('id, name, subject:subjects(title)')
          .order('name')
          .limit(10);

        if (!groups || groups.length === 0) {
          await sendMessage(chatId, `🏫 <b>Guruhlar:</b>\n\nHozircha guruhlar mavjud emas.`, {
            reply_markup: buildOpenAppKeyboard()
          });
        } else {
          const listText = groups.map((g: any, i: number) =>
            `${i + 1}. 🏫 <b>${g.name}</b> — ${(g.subject as any)?.title || 'Fan'}`
          ).join('\n');

          await sendMessage(
            chatId,
            `🏫 <b>Guruhlar ro'yxati:</b>\n\n${listText}`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🏫 Guruhlarni boshqarish', web_app: { url: `${APP_URL}/tg` } }]
                ]
              }
            }
          );
        }
      }

    // ── Ota-ona tugmalari ─────────────────────────────────────────────────
    } else if (text === '👨‍👩‍👧‍👦 Farzandim Natijalari') {
      if (!parentLinks || parentLinks.length === 0) {
        await sendMessage(chatId, `⚠️ Sizga biriktirilgan farzand topilmadi.`, { reply_markup: buildReplyKeyboard(false) });
      } else {
        const studentIds = parentLinks.map((p: any) => p.student_id);
        const { data: attempts } = await supabase
          .from('test_attempts')
          .select('score, max_score, completed_at, student:profiles(full_name), test:tests(title)')
          .in('student_id', studentIds)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(5);

        if (!attempts || attempts.length === 0) {
          await sendMessage(chatId, `📊 <b>Farzandingiz natijalari:</b>\n\nHozircha topshirilgan testlar topilmadi.`);
        } else {
          const listText = attempts.map((a: any) => {
            const pct = Math.round(((a.score || 0) / (a.max_score || 100)) * 100);
            const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '✅' : '💪';
            return `${emoji} <b>${(a.student as any)?.full_name}</b>\n   📝 ${(a.test as any)?.title}\n   📊 ${a.score}/${a.max_score} (${pct}%)`;
          }).join('\n\n');
          await sendMessage(chatId, `📊 <b>Farzandingizning so'nggi natijalari:</b>\n\n${listText}`, {
            reply_markup: buildParentReplyKeyboard()
          });
        }
      }

    } else if (text === "💳 To'lovlar Tarixi") {
      if (!parentLinks || parentLinks.length === 0) {
        await sendMessage(chatId, `⚠️ Biriktirilgan farzand topilmadi.`, { reply_markup: buildReplyKeyboard(false) });
      } else {
        const studentIds = parentLinks.map((p: any) => p.student_id);
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('amount, payment_method, month_year, payment_date, student:profiles(full_name)')
          .in('student_id', studentIds)
          .order('payment_date', { ascending: false })
          .limit(5);

        if (!paymentsData || paymentsData.length === 0) {
          await sendMessage(chatId, `💳 <b>To'lovlar tarixi:</b>\n\nHozircha to'lov yozuvlari topilmadi.`);
        } else {
          const listText = paymentsData.map((p: any) => {
            const amt = Number(p.amount || 0).toLocaleString('uz-UZ');
            const method = p.payment_method === 'card' ? '💳 Karta' : p.payment_method === 'transfer' ? '🏦 O\'tkazma' : '💵 Naqd';
            const date = p.payment_date ? new Date(p.payment_date).toLocaleDateString('uz-UZ') : '';
            return `✅ <b>${(p.student as any)?.full_name}</b>\n   📅 ${p.month_year} — <b>${amt} so'm</b> (${method})\n   ⏱ ${date}`;
          }).join('\n\n');
          await sendMessage(chatId, `💳 <b>So'nggi to'lovlar:</b>\n\n${listText}`, {
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
          .select('group:groups(name, schedule, subject:subjects(title)), student:profiles(full_name)')
          .in('student_id', studentIds);

        if (!groupStudents || groupStudents.length === 0) {
          await sendMessage(chatId, `🏫 <b>Farzandingiz guruhlari:</b>\n\nHozircha guruhlar topilmadi.`);
        } else {
          const listText = groupStudents.map((gs: any) => {
            const g = gs.group as any;
            return `🎓 <b>${(gs.student as any)?.full_name}</b>\n   🏫 ${g?.name} (${g?.subject?.title || 'Fan'})\n   📅 ${g?.schedule || 'Jadval belgilanmagan'}`;
          }).join('\n\n');
          await sendMessage(chatId, `🏫 <b>Farzandingiz guruhlari:</b>\n\n${listText}`, {
            reply_markup: buildParentReplyKeyboard()
          });
        }
      }

    } else if (text === "📞 Markaz Bilan Bog'lanish") {
      await sendMessage(
        chatId,
        `📞 <b>Promax Education O'quv Markazi</b>\n\n`+
        `📍 Manzil: Toshkent sh., Chilonzor tumani\n`+
        `📱 Telefon: +998 (90) 123-45-67\n`+
        `💬 Telegram: @promax_admin\n`+
        `🌐 Veb-sayt: ${APP_URL}`
      );

    // ── Noma'lum ───────────────────────────────────────────────────────────
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

    // Deep links to specific sections
    const deepLinks: Record<string, string> = {
      menu_tests:       `${APP_URL}/tg`,
      menu_results:     `${APP_URL}/tg`,
      menu_lessons:     `${APP_URL}/tg`,
      menu_profile:     `${APP_URL}/tg`,
      menu_students:    `${APP_URL}/tg`,
      menu_check_tests: `${APP_URL}/tg`,
      menu_groups:      `${APP_URL}/tg`,
    };

    const labels: Record<string, string> = {
      menu_tests:       '📝 Testlar bo\'limi',
      menu_results:     '📊 Natijalar bo\'limi',
      menu_lessons:     '📚 Darslar bo\'limi',
      menu_profile:     '👤 Profil bo\'limi',
      menu_students:    '👥 O\'quvchilar bo\'limi',
      menu_check_tests: '📝 Testlarni tekshirish',
      menu_groups:      '🏫 Guruhlar bo\'limi',
    };

    if (data && deepLinks[data]) {
      await answerCallbackQuery(query.id, `${labels[data]} ochilmoqda...`);
      await sendMessage(chatId, `${labels[data]} uchun Mini App ni oching:`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 Mini App ochish', web_app: { url: deepLinks[data] } }]
          ]
        }
      });
    } else {
      await answerCallbackQuery(query.id);
    }
  }

  return NextResponse.json({ ok: true });
}
