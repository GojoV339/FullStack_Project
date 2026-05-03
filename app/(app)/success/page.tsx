'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, MapPin, ShoppingBag } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import { Suspense } from 'react';

function SuccessContent() {
  const [showContent, setShowContent] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');
  const orderNumber = searchParams.get('orderNumber');
  const cafeteria = searchParams.get('cafeteria');
  const orderId = searchParams.get('orderId');

  const tokenNum = parseInt(token || '0', 10);
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const displayToken = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
      spring.set(tokenNum);
    }, 800);
    return () => clearTimeout(timer);
  }, [spring, tokenNum]);

  const confettiColors = ['#b50346', '#d45c7e', '#10B981', '#E6A23C', '#8B5CF6'];

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#eeeeee] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Confetti particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{
                background: confettiColors[i % confettiColors.length],
                left: `${(i * 4.16) % 100}%`,
                top: '-5%',
              }}
              animate={{
                y: ['0vh', '110vh'],
                x: [0, (i % 2 === 0 ? 1 : -1) * (20 + (i % 30))],
                rotate: [0, 360],
                opacity: [1, 0.8, 0],
              }}
              transition={{
                duration: 2 + (i % 3) * 0.5,
                delay: (i % 8) * 0.15,
                ease: 'easeIn',
              }}
            />
          ))}
        </div>

        {/* Success checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'rgba(16,185,129,0.15)' }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
            >
              <CheckCircle2 size={56} style={{ color: '#10B981' }} />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-2xl font-bold text-[#1A1A2E] text-center"
        >
          Order Confirmed! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-[#6B7280] text-sm mt-2 text-center"
        >
          Your payment was successful
        </motion.p>

        {/* Order Number */}
        {orderNumber && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-5 glass-card px-5 py-3 text-center"
          >
            <p className="text-[#6B7280] text-xs mb-1">Order Number</p>
            <p className="font-bold text-[#b50346] font-mono text-base">{orderNumber}</p>
          </motion.div>
        )}

        {/* Token Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, type: 'spring', stiffness: 150 }}
          className="mt-4 w-full max-w-xs"
        >
          <div
            className="glass-card p-8 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #eeeeee 0%, #e0e0e0 100%)',
              border: '2px solid rgba(181,3,70,0.25)',
              boxShadow: '0 0 32px rgba(181,3,70,0.2)',
            }}
          >
            {/* Glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-20 blur-3xl"
              style={{ background: '#b50346' }}
            />

            <p className="text-[#6B7280] text-sm relative z-10">Your Token Number</p>
            <motion.p
              className="font-black relative z-10 mt-1"
              style={{
                fontSize: '72px',
                lineHeight: 1,
                letterSpacing: '-2px',
                color: '#b50346',
              }}
            >
              <motion.span>{displayToken}</motion.span>
            </motion.p>

            <div className="flex items-center justify-center gap-1.5 mt-3 relative z-10">
              <MapPin size={13} className="text-[#6B7280]" />
              <span className="text-[#6B7280] text-sm">
                {cafeteria || 'Canteen'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Status pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: '#FEF3C7' }}
        >
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ background: '#F59E0B' }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-sm font-semibold" style={{ color: '#92400E' }}>
            Preparing your order...
          </span>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="mt-8 w-full max-w-xs space-y-3"
        >
          {orderId && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(`/tracker/${orderId}`)}
              className="btn-primary w-full h-[52px] flex items-center justify-center gap-2 text-base"
            >
              Track My Order
              <ArrowRight size={18} />
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/menu')}
            className="btn-secondary w-full h-[48px] flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            Order More Items
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-xs text-[#9CA3AF] mt-4 text-center"
        >
          Order saved to My Orders
        </motion.p>
      </div>
    </PageTransition>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#eeeeee] flex items-center justify-center">
          <div className="w-12 h-12 border-3 border-[rgba(181,3,70,0.2)] border-t-[#b50346] rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
