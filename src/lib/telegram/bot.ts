/**
 * Telegram Bot API utility functions
 * Server-side only — never import in client components
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function callTelegramAPI(method: string, body: Record<string, unknown>) {
 const res = await fetch(`${BASE_URL}/${method}`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(body),
 });
 const data = await res.json();
 if (!data.ok) {
 console.error(`[Telegram API] ${method} failed:`, data);
 }
 return data;
}

export async function sendMessage(
 chatId: number | string,
 text: string,
 options: Record<string, unknown> = {}
) {
 return callTelegramAPI('sendMessage', {
 chat_id: chatId,
 text,
 parse_mode: 'HTML',
 ...options,
 });
}

export async function sendPhoto(
  chatId: number | string,
  photoUrl: string,
  caption?: string,
  options: Record<string, unknown> = {}
) {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    photo: photoUrl,
    parse_mode: 'HTML',
    ...options,
  };
  if (caption) {
    payload.caption = caption.length > 1024 ? caption.slice(0, 1020) + '...' : caption;
  }
  return callTelegramAPI('sendPhoto', payload);
}

export async function editMessageText(
 chatId: number | string,
 messageId: number,
 text: string,
 options: Record<string, unknown> = {}
) {
 return callTelegramAPI('editMessageText', {
 chat_id: chatId,
 message_id: messageId,
 text,
 parse_mode: 'HTML',
 ...options,
 });
}

export async function answerCallbackQuery(
 callbackQueryId: string,
 text?: string,
 showAlert = false
) {
 return callTelegramAPI('answerCallbackQuery', {
 callback_query_id: callbackQueryId,
 text,
 show_alert: showAlert,
 });
}

export async function broadcastMessage(
  chatIds: (number | string)[],
  text: string,
  options: Record<string, unknown> = {}
) {
  const results = [];
  for (const chatId of chatIds) {
    await new Promise(r => setTimeout(r, 40));
    const result = await sendMessage(chatId, text, options);
    results.push(result);
  }
  return results;
}

export async function broadcastPhoto(
  chatIds: (number | string)[],
  photoUrl: string,
  caption?: string,
  options: Record<string, unknown> = {}
) {
  const results = [];
  for (const chatId of chatIds) {
    await new Promise(r => setTimeout(r, 40));
    try {
      const result = await sendPhoto(chatId, photoUrl, caption, options);
      if (!result?.ok && caption) {
        // Fallback to text message if photo fails
        const fallback = await sendMessage(chatId, caption, options);
        results.push(fallback);
      } else {
        results.push(result);
      }
    } catch {
      if (caption) {
        const fallback = await sendMessage(chatId, caption, options);
        results.push(fallback);
      }
    }
  }
  return results;
}

export async function setWebhook(url: string, secret: string) {
 return callTelegramAPI('setWebhook', {
 url,
 secret_token: secret,
 allowed_updates: ['message', 'callback_query'],
 drop_pending_updates: true,
 });
}

export async function getWebhookInfo() {
 const res = await fetch(`${BASE_URL}/getWebhookInfo`);
 return res.json();
}

export async function getMe() {
 const res = await fetch(`${BASE_URL}/getMe`);
 return res.json();
}

export function verifyWebhookSignature(token: string): boolean {
 const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
 return token === secret;
}
