'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Crown, Check, ArrowLeft, Sparkles } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import { toast } from 'sonner';

const benefits = [
  'Exclusive combo deals (save up to ₹20 per order)',
  'Priority queue — your order goes first',
  'Special weekend offers',
  'No waiting in digital queue',
];

export default function PriorityPassPage() {
  const student = useAuthStore((s) => s.student);
  const isActive = student?.subscriptionStatus === 'ACTIVE';
  const router = useRouter();

  const handleActivate = () => {
    toast.info('Priority Pass activation requires Cashfree setup. Coming soon!');
  };

  return (
    <PageTransition>
      <div className="min-h-screen p-6 safe-top">
        <div className="flex items-center gap-3 mb-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()} className="text-white/50">
            <ArrowLeft size={22} />
          </motion.button>
          <h1 className="text-xl font-bold text-white">Priority Pass</h1>
        </div>

        {/* Hero Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6 mb-6">
          <div className="absolute inset-0 gradient-gold" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
          }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={24} className="text-white" />
              <Sparkles size={16} className="text-white/70" />
            </div>
            <h2 className="text-2xl font-bold text-white">Priority Pass</h2>
            <p className="text-white/70 text-sm mt-1">Skip queues. Save more. Eat first.</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">₹99</span>
              <span className="text-white/50 text-sm">/month</span>
              <span className="text-white/40 text-xs line-through ml-2">₹149</span>
            </div>
          </div>
        </motion.div>

        {isActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card p-3 mb-6 flex items-center gap-2 border-success/30">
            <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
              <Check size={14} className="text-success" />
            </div>
            <span className="text-success text-sm font-medium">Active</span>
            {student?.subscriptionExpiry && (
              <span className="text-white/30 text-xs ml-auto">
                Expires {new Date(student.subscriptionExpiry).toLocaleDateString()}
              </span>
            )}
          </motion.div>
        )}

        {/* Benefits */}
        <div className="space-y-3 mb-8">
          {benefits.map((benefit, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                <Check size={14} className="text-amber-400" />
              </div>
              <span className="text-white/70 text-sm">{benefit}</span>
            </motion.div>
          ))}
        </div>

        {!isActive && (
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleActivate}
            className="w-full py-4 rounded-2xl gradient-gold text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2">
            <Crown size={20} /> Activate Priority Pass — ₹99/month
          </motion.button>
        )}
      </div>
    </PageTransition>
  );
}
