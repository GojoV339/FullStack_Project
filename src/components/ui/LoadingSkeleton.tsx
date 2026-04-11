'use client';

import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  variant?: 'cafeteria' | 'menu' | 'order';
  count?: number;
}

/**
 * LoadingSkeleton component displays placeholder content while data loads
 * 
 * Features:
 * - Shimmer animation from left to right
 * - Matches the shape and size of actual content
 * - Supports multiple variants: cafeteria cards, menu items, orders
 * - Uses warm color palette and glassmorphism effects
 * 
 * @param variant - Type of skeleton to display (cafeteria, menu, order)
 * @param count - Number of skeleton items to render
 */
export default function LoadingSkeleton({ 
  variant = 'menu', 
  count = 1 
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (variant === 'cafeteria') {
    return (
      <>
        {skeletons.map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 space-y-4"
          >
            {/* Image placeholder */}
            <div className="h-40 bg-white/5 rounded-lg shimmer" />
            
            {/* Title placeholder */}
            <div className="space-y-2">
              <div className="h-6 bg-white/5 rounded-lg shimmer w-3/4" />
              <div className="h-4 bg-white/5 rounded-lg shimmer w-1/2" />
            </div>
            
            {/* Status badges */}
            <div className="flex gap-2">
              <div className="h-6 bg-white/5 rounded-full shimmer w-20" />
              <div className="h-6 bg-white/5 rounded-full shimmer w-24" />
            </div>
          </motion.div>
        ))}
      </>
    );
  }

  if (variant === 'menu') {
    return (
      <>
        {skeletons.map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card overflow-hidden"
          >
            {/* Food image placeholder */}
            <div className="h-28 bg-white/5 shimmer" />
            
            {/* Info section */}
            <div className="p-3 space-y-2">
              {/* Name placeholder */}
              <div className="h-4 bg-white/5 rounded shimmer w-full" />
              <div className="h-4 bg-white/5 rounded shimmer w-2/3" />
              
              {/* Price and button placeholder */}
              <div className="flex items-center justify-between mt-2">
                <div className="h-5 bg-white/5 rounded shimmer w-12" />
                <div className="h-8 w-8 bg-white/5 rounded-lg shimmer" />
              </div>
            </div>
          </motion.div>
        ))}
      </>
    );
  }

  if (variant === 'order') {
    return (
      <>
        {skeletons.map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4 space-y-3"
          >
            {/* Order header */}
            <div className="flex items-center justify-between">
              <div className="h-5 bg-white/5 rounded shimmer w-32" />
              <div className="h-6 bg-white/5 rounded-full shimmer w-20" />
            </div>
            
            {/* Order details */}
            <div className="space-y-2">
              <div className="h-4 bg-white/5 rounded shimmer w-full" />
              <div className="h-4 bg-white/5 rounded shimmer w-3/4" />
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="h-4 bg-white/5 rounded shimmer w-24" />
              <div className="h-5 bg-white/5 rounded shimmer w-16" />
            </div>
          </motion.div>
        ))}
      </>
    );
  }

  return null;
}
