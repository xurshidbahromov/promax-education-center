"use client";

import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

export interface TelegramOIDCUser {
  id: number;
  name: string;
  preferred_username?: string;
  picture?: string;
  phone_number?: string;
}

export interface TelegramAuthPayload {
  user: TelegramOIDCUser;
  id_token: string;
}

interface TelegramLoginWidgetProps {
  clientId: string;
  onAuth: (payload: TelegramAuthPayload) => void;
}

export default function TelegramLoginWidget({
  clientId,
  onAuth,
}: TelegramLoginWidgetProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if the script is already loaded
    if (document.querySelector('script[src^="https://oauth.telegram.org/js/telegram-login.js"]')) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://oauth.telegram.org/js/telegram-login.js?5';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      // We don't remove the script on unmount as it might be used globally
    };
  }, []);

  const handleCustomLogin = () => {
    if (!isScriptLoaded || !(window as any).Telegram?.Login) {
      console.error("Telegram Login SDK not loaded yet.");
      return;
    }

    (window as any).Telegram.Login.auth(
      { client_id: clientId, request_access: 'write' },
      (data: any) => {
        if (data && data.id_token && data.user) {
          onAuth(data);
        } else if (data && data.error) {
          if (data.error === "popup_closed") {
            console.log("Telegram login popup was closed by the user.");
          } else {
            console.error("Telegram login error:", data.error);
          }
        }
      }
    );
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCustomLogin}
      disabled={!isScriptLoaded}
      className={`w-full py-3.5 px-4 bg-[#2AABEE] hover:bg-[#229ED9] text-white rounded-xl font-medium transition-all shadow-lg shadow-[#2AABEE]/20 hover:shadow-[#2AABEE]/40 flex items-center justify-center gap-3 mt-2 ${!isScriptLoaded ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <Send className="w-5 h-5" />
      <span>Telegram orqali tizimga kirish</span>
    </motion.button>
  );
}
