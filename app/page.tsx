'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { ChefHat, ArrowRight, Scan } from 'lucide-react';

export default function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/cafeteria');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen gradient-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 gradient-primary rounded-3xl flex items-center justify-center shadow-primary mb-8"
      >
        <ChefHat size={48} className="text-white" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-bold text-white text-center"
      >
        Amrita{' '}
        <span className="text-gradient">Feast</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-white/50 text-center mt-3 text-base max-w-xs"
      >
        Skip the canteen queue. Order from your classroom.
      </motion.p>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-10 space-y-3 w-full max-w-xs"
      >
        {[
          { emoji: '📷', text: 'Scan your college ID to log in' },
          { emoji: '🍽️', text: 'Browse menu & add to cart' },
          { emoji: '💳', text: 'Pay via UPI in seconds' },
          { emoji: '🎫', text: 'Get a token — skip the queue!' },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            className="flex items-center gap-3 glass-card p-3"
          >
            <span className="text-xl">{feature.emoji}</span>
            <span className="text-sm text-white/70">{feature.text}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-10 w-full max-w-xs space-y-3"
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/login')}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Scan size={20} />
          Scan ID & Login
          <ArrowRight size={18} />
        </motion.button>

        <button
          onClick={() => router.push('/manual-login')}
          className="w-full text-center text-white/40 text-sm hover:text-white/60 transition-colors py-2"
        >
          Enter registration number manually
        </button>
      </motion.div>

      {/* Staff link */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={() => router.push('/staff/login')}
        className="absolute bottom-6 text-white/20 text-xs hover:text-white/40 transition-colors"
      >
        Staff Login →
      </motion.button>
    </div>
  );
}
