'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { KeyboardIcon, ChevronUp, ScanLine } from 'lucide-react';
import { toast } from 'sonner';
import BarcodeScanner from '@/components/auth/BarcodeScanner';

export default function LoginPage() {
  const [showManual, setShowManual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setStudent = useAuthStore((s) => s.setStudent);

  const handleScanSuccess = async (decodedText: string) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/barcode-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcodeData: decodedText }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      toast.success('Welcome back! Redirecting...');
      setStudent(data.student);
      router.push('/cafeteria');
    } catch {
      toast.error('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCameraError = () => {
    setShowManual(true);
  };

  const handleManualSubmit = async (regNum: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/manual-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: regNum }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      toast.success('Welcome! Redirecting...');
      setStudent(data.student);
      router.push('/cafeteria');
    } catch {
      toast.error('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'radial-gradient(ellipse at top, #FF6B35 0%, #C0410F 40%, #1A1A2E 100%)'
    }}>
      {/* Logo */}
      <div className="absolute top-0 left-0 right-0 z-10 flex flex-col items-center pt-16 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="text-2xl">🍽️</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl leading-none">Amrita Feast</h1>
            <p className="text-white/60 text-xs mt-0.5">Skip the queue · Order from class</p>
          </div>
        </motion.div>
      </div>

      {/* Scanner instructions */}
      <div className="absolute top-[140px] left-0 right-0 z-10 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-white/70 text-sm"
        >
          <ScanLine size={16} />
          Scan your Amrita ID card to login
        </motion.div>
      </div>

      {/* Barcode Scanner */}
      <BarcodeScanner
        onScanSuccess={handleScanSuccess}
        onCameraError={handleCameraError}
      />

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-auto z-10">
        <motion.button
          onClick={() => setShowManual(!showManual)}
          className="w-full py-4 text-center flex items-center justify-center gap-2"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          <KeyboardIcon size={16} />
          <span className="text-sm">Can&apos;t scan? Enter manually</span>
          <motion.div
            animate={{ rotate: showManual ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronUp size={16} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {showManual && (
            <ManualInput onSubmit={handleManualSubmit} isLoading={isLoading} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ManualInput({
  onSubmit,
  isLoading,
}: {
  onSubmit: (regNum: string) => void;
  isLoading: boolean;
}) {
  const [regNum, setRegNum] = useState('');

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="bg-white p-6 rounded-t-3xl safe-bottom shadow-2xl"
    >
      <div className="w-10 h-1 bg-[#FFE4D0] rounded-full mx-auto mb-5" />

      <h2 className="text-[#1A1A2E] font-bold text-lg mb-1">Manual Login</h2>
      <p className="text-[#6B7280] text-xs mb-4">
        Enter your registration number (e.g., BL.EN.U4CSE22001)
      </p>

      <input
        type="text"
        value={regNum}
        onChange={(e) => setRegNum(e.target.value.toUpperCase())}
        placeholder="BL.EN.U4CSE22001"
        className="input-field mb-3 uppercase tracking-wider"
        autoCapitalize="characters"
        style={{ fontSize: '16px' }}
      />

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onSubmit(regNum)}
        disabled={!regNum || isLoading}
        className="btn-primary w-full h-[52px] flex items-center justify-center"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block"
            />
            Logging in...
          </span>
        ) : (
          'Login'
        )}
      </motion.button>
    </motion.div>
  );
}
