'use client';

import { useState, useEffect, useRef } from 'react';

interface UsePWAInstallReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<void>;
  dismissPrompt: () => void;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

function isDismissedRecently(): boolean {
  const dismissedAt = localStorage.getItem(DISMISS_KEY);
  if (!dismissedAt) return false;

  const dismissedTime = parseInt(dismissedAt, 10);
  const now = Date.now();
  
  if (now - dismissedTime < DISMISS_DURATION) {
    return true;
  } else {
    // Cooldown expired, remove the key
    localStorage.removeItem(DISMISS_KEY);
    return false;
  }
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      
      // Only set installable if not dismissed recently
      if (!isDismissedRecently()) {
        setIsInstallable(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    const appInstalledHandler = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      deferredPrompt.current = null;
    };

    window.addEventListener('appinstalled', appInstalledHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt.current) return;

    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    deferredPrompt.current = null;
    setIsInstallable(false);
  };

  const dismissPrompt = () => {
    // Store dismissal timestamp
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsInstallable(false);
    deferredPrompt.current = null;
  };

  return { isInstallable, isInstalled, promptInstall, dismissPrompt };
}

// Type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
