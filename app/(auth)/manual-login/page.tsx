'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { ChefHat, ArrowLeft } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';

export default function ManualLoginPage() {
  const [regNum, setRegNum] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setStudent = useAuthStore((s) => s.setStudent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNum.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/manual-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: regNum.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      toast.success('Login successful!');
      setStudent(data.student);
      router.push('/cafeteria');
    } catch {
      toast.error('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen gradient-dark flex flex-col items-center justify-center p-6">
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 text-white/40 hover:text-white/70 transition-colors safe-top"
        >
          <ArrowLeft size={24} />
        </button>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-primary mb-6"
        >
          <ChefHat size={32} className="text-white" />
        </motion.div>

        <h1 className="text-2xl font-bold text-white mb-2">Manual Login</h1>
        <p className="text-white/40 text-sm text-center max-w-xs mb-8">
          Enter your Amrita registration number to continue
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
          <div>
            <label className="text-white/50 text-xs font-medium mb-1.5 block">
              Registration Number
            </label>
            <input
              type="text"
              value={regNum}
              onChange={(e) => setRegNum(e.target.value.toUpperCase())}
              placeholder="BL.EN.U4CSE22001"
              className="input-field uppercase"
              autoCapitalize="characters"
              required
            />
            <p className="text-white/30 text-[11px] mt-1.5">
              Format: XX.EN.U4XXX00000
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!regNum.trim() || isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
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
        </form>

        <button
          onClick={() => router.push('/login')}
          className="mt-6 text-primary text-sm hover:text-primary-light transition-colors"
        >
          ← Scan barcode instead
        </button>
      </div>
    </PageTransition>
  );
}
