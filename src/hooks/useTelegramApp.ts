"use client";

import { useEffect, useState, useCallback } from 'react';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export interface TelegramTheme {
  colorScheme: 'dark' | 'light';
  bgColor: string;
  textColor: string;
  hintColor: string;
  linkColor: string;
  buttonColor: string;
  buttonTextColor: string;
}

export interface UseTelegramAppReturn {
  tgApp: any | null;
  tgUser: TelegramUser | null;
  initData: string;
  theme: TelegramTheme | null;
  isReady: boolean;
  isExpanded: boolean;
  expand: () => void;
  close: () => void;
  showBackButton: (onClick: () => void) => void;
  hideBackButton: () => void;
  setMainButton: (text: string, onClick: () => void, color?: string) => void;
  hideMainButton: () => void;
  haptic: (type?: 'light' | 'medium' | 'heavy') => void;
  openLink: (url: string) => void;
}

export function useTelegramApp(): UseTelegramAppReturn {
  const [tgApp, setTgApp] = useState<any>(null);
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState('');
  const [theme, setTheme] = useState<TelegramTheme | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    tg.expand();

    setTgApp(tg);
    setTgUser(tg.initDataUnsafe?.user || null);
    setInitData(tg.initData || '');
    setIsExpanded(tg.isExpanded);
    setIsReady(true);

    // Theme
    const themeParams = tg.themeParams;
    if (themeParams) {
      setTheme({
        colorScheme: tg.colorScheme || 'light',
        bgColor: themeParams.bg_color || '#ffffff',
        textColor: themeParams.text_color || '#000000',
        hintColor: themeParams.hint_color || '#999999',
        linkColor: themeParams.link_color || '#0056D2',
        buttonColor: themeParams.button_color || '#0056D2',
        buttonTextColor: themeParams.button_text_color || '#ffffff',
      });
    }

    // Expand listener
    tg.onEvent('viewportChanged', () => {
      setIsExpanded(tg.isExpanded);
    });
  }, []);

  const expand = useCallback(() => {
    tgApp?.expand();
  }, [tgApp]);

  const close = useCallback(() => {
    tgApp?.close();
  }, [tgApp]);

  const showBackButton = useCallback(
    (onClick: () => void) => {
      if (!tgApp) return;
      tgApp.BackButton.show();
      tgApp.BackButton.onClick(onClick);
    },
    [tgApp]
  );

  const hideBackButton = useCallback(() => {
    tgApp?.BackButton.hide();
  }, [tgApp]);

  const setMainButton = useCallback(
    (text: string, onClick: () => void, color?: string) => {
      if (!tgApp) return;
      tgApp.MainButton.text = text;
      if (color) tgApp.MainButton.color = color;
      tgApp.MainButton.show();
      tgApp.MainButton.onClick(onClick);
    },
    [tgApp]
  );

  const hideMainButton = useCallback(() => {
    tgApp?.MainButton.hide();
  }, [tgApp]);

  const haptic = useCallback(
    (type: 'light' | 'medium' | 'heavy' = 'light') => {
      tgApp?.HapticFeedback.impactOccurred(type);
    },
    [tgApp]
  );

  const openLink = useCallback(
    (url: string) => {
      tgApp?.openLink(url);
    },
    [tgApp]
  );

  return {
    tgApp,
    tgUser,
    initData,
    theme,
    isReady,
    isExpanded,
    expand,
    close,
    showBackButton,
    hideBackButton,
    setMainButton,
    hideMainButton,
    haptic,
    openLink,
  };
}
