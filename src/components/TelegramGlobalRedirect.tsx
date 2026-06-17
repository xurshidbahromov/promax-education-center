"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function TelegramGlobalRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Telegram appends #tgWebAppData to the URL when opening a Mini App
      const isTelegram = window.location.hash.includes('tgWebAppData') || (window as any).Telegram?.WebApp?.initData;
      
      if (isTelegram && !pathname.startsWith('/tg')) {
        router.replace('/tg');
      }
    }
  }, [pathname, router]);

  return null;
}
