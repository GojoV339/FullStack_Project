'use client';

import { motion } from 'framer-motion';
import { useCountdown } from '@/hooks/useCountdown';
import { Clock, AlertTriangle } from 'lucide-react';

interface PaymentTimerProps {
  expiresAt: Date | string | null;
  onExpire?: () => void;
}

export default function PaymentTimer({ expiresAt, onExpire }: PaymentTimerProps) {
  const { timeLeft, minutes, seconds, progress, isExpired } = useCountdown(expiresAt);

  if (isExpired && onExpire) {
    onExpire();
  }

  const getUrgency = () => {
    if (timeLeft <= 60) return 'critical';
    if (timeLeft <= 120) return 'warning';
    return 'normal';
  };

  const urgency = getUrgency();

  const urgencyConfig = {
    normal: { ring: '#6BAF92', text: '#2F6F73', bg: 'rgba(107,175,146,0.10)' },
    warning: { ring: '#E6A23C', text: '#92400E', bg: 'rgba(230,162,60,0.10)' },
    critical: { ring: '#D96C6C', text: '#991B1B', bg: 'rgba(217,108,108,0.10)' },
  };

  const colors = urgencyConfig[urgency];
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      className="glass-card p-5 text-center"
      style={{ background: isExpired ? '#FEF2F2' : '#eeeeee' }}
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <Clock size={15} className="text-[#8A8A8A]" />
        <p className="text-[#8A8A8A] text-sm font-medium">
          {isExpired ? 'Order expired' : 'Complete payment within'}
        </p>
      </div>

      <div className="relative w-28 h-28 mx-auto mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(181,3,70,0.12)" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={colors.ring}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={339.29}
            strokeDashoffset={339.29 * (1 - progress / 100)}
            animate={{ strokeDashoffset: 339.29 * (1 - progress / 100) }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-2xl font-extrabold"
            style={{ color: colors.text }}
            animate={urgency === 'critical' ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {formattedTime}
          </motion.span>
        </div>
      </div>

      <div className="w-full max-w-xs mx-auto mb-3">
        <div className="h-1.5 bg-[#e0e0e0] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: colors.ring, width: `${progress}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {urgency === 'critical' && !isExpired && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-sm font-medium"
          style={{ color: colors.text }}
        >
          <AlertTriangle size={15} />
          Hurry! Less than 1 minute remaining
        </motion.div>
      )}

      {isExpired && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[#D96C6C] text-sm font-semibold"
        >
          ⏰ Time&apos;s up! Order has expired
        </motion.div>
      )}
    </div>
  );
}
