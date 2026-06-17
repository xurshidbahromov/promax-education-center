import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Promax Education | Mini App',
  description: 'Promax Education platformasi',
};

export default function TelegramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <head>
        {/* Telegram Mini App SDK — must be loaded synchronously */}
        <script src="https://telegram.org/js/telegram-web-app.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { 
            height: 100%; 
            overflow-x: hidden;
            background: var(--tg-theme-bg-color, #ffffff);
            color: var(--tg-theme-text-color, #000000);
            font-family: 'Source Sans 3', 'DM Sans', -apple-system, sans-serif;
          }
          :root {
            --brand-blue: #0056D2;
            --brand-orange: #F97316;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
