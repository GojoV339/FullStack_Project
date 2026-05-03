'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { X, Download, Share } from 'lucide-react';
import { useState } from 'react';

export default function InstallBanner() {
  const { isInstallable, isIOS, isInstalled, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || isDismissed) return null;
  if (!isInstallable && !isIOS) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-20 left-4 right-4 z-40 md:bottom-4 md:left-auto md:right-4 md:max-w-sm"
      >
        <div className="glass-card p-4 shadow-elevated">
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-3 right-3 text-[#2D2D2D]/40 hover:text-[#2D2D2D]"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🍽️</span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#2D2D2D] text-sm">
                Install Amrita Feast
              </h3>

              {isIOS ? (
                <p className="text-[#2D2D2D]/50 text-xs mt-1 leading-relaxed">
                  Tap <Share size={12} className="inline mx-0.5" /> Share then{' '}
                  <span className="font-medium text-[#2D2D2D]/70">
                    &quot;Add to Home Screen&quot;
                  </span>
                </p>
              ) : (
                <>
                  <p className="text-[#2D2D2D]/50 text-xs mt-1">
                    Get the full app experience — works offline!
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={install}
                    className="mt-2 btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    Install App
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
