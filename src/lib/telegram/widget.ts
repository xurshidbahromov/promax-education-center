import crypto from 'crypto';

export function verifyTelegramWidgetPayload(payload: any, botToken: string): boolean {
  if (!payload || !payload.hash) return false;

  const { hash, ...data } = payload;
  
  // Sort keys alphabetically
  const keys = Object.keys(data).sort();
  
  // Create data check string
  const dataCheckString = keys
    .filter(key => data[key] !== undefined && data[key] !== null)
    .map(key => `${key}=${data[key]}`)
    .join('\n');

  // Compute secret key: SHA256 of bot token
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  
  // Compute HMAC SHA256
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  return hmac === hash;
}
