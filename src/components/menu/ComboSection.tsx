'use client';

import { motion } from 'framer-motion';
import FoodCard from './FoodCard';
import type { MenuItemData } from '@/types';

interface ComboSectionProps {
  items: MenuItemData[];
  isVisible: boolean;
}

export default function ComboSection({ items, isVisible }: ComboSectionProps) {
  if (!isVisible || items.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="px-4 mt-4"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="section-badge-combo">🎁 COMBOS</span>
        <span className="text-[#2D2D2D]/30 text-xs">Save more!</span>
      </div>

      {/* Horizontal Scrollable Container */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
        {items.map((combo) => (
          <div key={combo.id} className="min-w-[200px] max-w-[200px]">
            <FoodCard item={combo} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
