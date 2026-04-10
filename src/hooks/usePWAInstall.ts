'use client';

import { useState, useEffect, useRef } from 'react';

interface PWAInstallState {
  isInstallable: boolean;
  isIOS: boolean;
  isInstalled: boolean;
  install: () => Promise<void>;
}

export function usePWAInstall(): PWAInstallState {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check for iOS
    const isIOSDevice = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as unknown as { standalone: boolean }).standalone;

    if (isIOSDevice && !isInStandaloneMode) {
      setIsIOS(true);
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      deferredPrompt.current = null;
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt.current) return;

    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    deferredPrompt.current = null;
    setIsInstallable(false);
  };

  return { isInstallable, isIOS, isInstalled, install };
}

// Type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
