/**
 * Telegram Mini App — server-side initData verification
 * Verifies HMAC-SHA256 signature from Telegram WebApp
 */

import { createHmac } from 'crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export interface ParsedInitData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  query_id?: string;
  chat_type?: string;
}

/**
 * Verifies Telegram initData signature using HMAC-SHA256
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyInitData(initDataRaw: string): ParsedInitData | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN!;
  
  try {
    const params = new URLSearchParams(initDataRaw);
    const hash = params.get('hash');
    if (!hash) return null;

    // Build data-check-string
    params.delete('hash');
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    // Secret key = HMAC-SHA256("WebAppData", bot_token)
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Verify
    const expectedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (expectedHash !== hash) return null;

    // Check auth_date is not older than 24 hours
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    if (Date.now() / 1000 - authDate > 86400) return null;

    // Parse user
    const userStr = params.get('user');
    const user = userStr ? JSON.parse(decodeURIComponent(userStr)) : undefined;

    return {
      user,
      auth_date: authDate,
      hash,
      query_id: params.get('query_id') || undefined,
      chat_type: params.get('chat_type') || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Safe version that never throws — returns null on any error
 */
export function parseTelegramUser(initDataRaw: string): TelegramUser | null {
  const parsed = verifyInitData(initDataRaw);
  return parsed?.user || null;
}
