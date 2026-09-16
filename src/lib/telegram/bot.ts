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

async function callTelegramAPIFormData(method: string, formData: FormData) {
  const res = await fetch(`${BASE_URL}/${method}`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!data.ok) {
    console.error(`[Telegram API] ${method} (FormData) failed:`, data);
  }
  return data;
}

function parseBase64DataUrl(dataUrl: string): { mimeType: string; buffer: Buffer; extension: string } | null {
  const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const extension = mimeType.split('/')[1] || 'jpg';
  return { mimeType, buffer, extension };
}

export function truncateTelegramCaption(caption: string, maxLength = 1024): string {
  if (!caption || caption.length <= maxLength) return caption;
  let slice = caption.slice(0, maxLength - 4) + '...';

  // Close any unclosed basic HTML tags supported by Telegram (b, i, u, s, code, pre, a)
  const tags = ['b', 'i', 'u', 's', 'code', 'pre', 'a'];
  for (const tag of tags) {
    slice = slice.replace(new RegExp(`<${tag}[^>]*$`, 'i'), '');
    const openCount = (slice.match(new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi')) || []).length;
    const closeCount = (slice.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
    if (openCount > closeCount) {
      for (let i = 0; i < openCount - closeCount; i++) {
        slice += `</${tag}>`;
      }
    }
  }
  return slice;
}

export function escapeTelegramHtml(text: string): string {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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
  photoUrlOrData: string,
  caption?: string,
  options: Record<string, unknown> = {}
) {
  const safeCaption = caption ? truncateTelegramCaption(caption, 1024) : undefined;
  const isBase64 = typeof photoUrlOrData === 'string' && photoUrlOrData.startsWith('data:image/');

  if (isBase64) {
    const parsed = parseBase64DataUrl(photoUrlOrData);
    if (parsed) {
      const formData = new FormData();
      formData.append('chat_id', String(chatId));
      const blob = new Blob([new Uint8Array(parsed.buffer)], { type: parsed.mimeType });
      formData.append('photo', blob, `announcement.${parsed.extension}`);
      formData.append('parse_mode', 'HTML');
      if (safeCaption) {
        formData.append('caption', safeCaption);
      }
      for (const [key, val] of Object.entries(options)) {
        if (val !== undefined && val !== null) {
          formData.append(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
        }
      }
      return callTelegramAPIFormData('sendPhoto', formData);
    }
  }

  const payload: Record<string, unknown> = {
    chat_id: chatId,
    photo: photoUrlOrData,
    parse_mode: 'HTML',
    ...options,
  };
  if (safeCaption) {
    payload.caption = safeCaption;
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
  let currentPhotoRef = photoUrl;

  for (const chatId of chatIds) {
    await new Promise(r => setTimeout(r, 40));
    try {
      const result = await sendPhoto(chatId, currentPhotoRef, caption, options);
      if (!result?.ok && caption) {
        console.warn(`[Telegram broadcastPhoto] sendPhoto failed for ${chatId}, falling back to text:`, result?.description);
        // Fallback to text message if photo fails
        const fallback = await sendMessage(chatId, caption, options);
        results.push(fallback);
      } else {
        results.push(result);
        // If Telegram accepted an uploaded photo or URL, it returns a photo array with file_id
        const fileId = result?.result?.photo?.slice(-1)[0]?.file_id;
        if (fileId) {
          currentPhotoRef = fileId; // Reusing file_id speeds up following sends 100x and saves bandwidth!
        }
      }
    } catch (err) {
      console.error(`[Telegram broadcastPhoto] Exception for ${chatId}:`, err);
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
