'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * EmptyState component displays when there's no content to show
 * 
 * Features:
 * - Icon display (relevant to the context)
 * - Message text explaining the empty state
 * - Optional call-to-action button
 * - Used for: empty cart, no orders, no search results
 * - Warm color palette and glassmorphism effects
 * - Centered and visually appealing
 * 
 * @param icon - Lucide icon component to display
 * @param title - Main heading text
 * @param message - Descriptive message text
 * @param action - Optional action button with label and onClick handler
 */
export default function EmptyState({ 
  icon: Icon, 
  title, 
  message, 
  action 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center py-12 px-6"
    >
      {/* Icon Container */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-[#eeeeee]/5 flex items-center justify-center mb-6 relative"
      >
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
        <Icon size={36} className="text-[#2D2D2D]/30 relative z-10" />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-[#2D2D2D]/70 mb-2"
      >
        {title}
      </motion.h3>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-[#2D2D2D]/40 max-w-xs"
      >
        {message}
      </motion.p>

      {/* Optional Action Button */}
      {action && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="btn-primary mt-6"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
