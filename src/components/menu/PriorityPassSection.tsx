'use client';

import { motion } from 'framer-motion';
import FoodCard from './FoodCard';
import { useAuthStore } from '@/store/authStore';
import type { MenuItemData } from '@/types';

interface PriorityPassSectionProps {
  items: MenuItemData[];
  isVisible: boolean;
}

export default function PriorityPassSection({ items, isVisible }: PriorityPassSectionProps) {
  const student = useAuthStore((s) => s.student);
  
  // Check if subscription is active and not expired
  const hasActiveSubscription = 
    student?.subscriptionStatus === 'ACTIVE' &&
    student?.subscriptionExpiry &&
    new Date(student.subscriptionExpiry) > new Date();

  if (!isVisible || items.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="px-4 mt-6"
    >
      {/* Section Header with Gold Gradient Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="gradient-gold px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg">
          ⭐ PRIORITY PASS
        </span>
        {!hasActiveSubscription && (
          <span className="text-white/30 text-xs">Exclusive items</span>
        )}
      </div>

      {/* Items Grid with Blur Effect for Inactive Subscriptions */}
      <div
        className={`grid grid-cols-2 gap-3 ${
          !hasActiveSubscription ? 'blur-sm pointer-events-none' : ''
        }`}
      >
        {items.map((item) => (
          <FoodCard key={item.id} item={item} isLocked={!hasActiveSubscription} />
        ))}
      </div>

      {/* Subscription Prompt for Inactive Users */}
      {!hasActiveSubscription && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 glass-card p-4 text-center"
        >
          <p className="text-sm text-white/70 mb-2">
            Get Priority Pass to unlock exclusive menu items
          </p>
          <button className="btn-primary text-sm py-2 px-4">
            Learn More
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
