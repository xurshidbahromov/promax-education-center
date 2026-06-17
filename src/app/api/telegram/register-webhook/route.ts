import { NextRequest, NextResponse } from 'next/server';
import { setWebhook, getWebhookInfo } from '@/lib/telegram/bot';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const adminSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!secret || secret !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const webhookUrl = `${appUrl}/api/telegram/webhook`;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET!;

  const result = await setWebhook(webhookUrl, webhookSecret);
  const info = await getWebhookInfo();

  return NextResponse.json({
    success: result.ok,
    webhook_url: webhookUrl,
    webhook_info: info.result,
  });
}
