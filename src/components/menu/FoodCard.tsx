'use client';

import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import type { MenuItemData } from '@/types';

interface FoodCardProps {
  item: MenuItemData;
  isLocked?: boolean;
}

export default function FoodCard({ item, isLocked = false }: FoodCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const quantity = useCartStore((s) => s.getItemQuantity(item.id));

  const categoryEmoji: Record<string, string> = {
    'Snacks': '🥟',
    'Beverages': '☕',
    'Packaged': '🍪',
    'Fruits': '🍌',
    'South Indian': '🥘',
    'Rice': '🍚',
    'North Indian': '🫓',
    'Kerala': '🥙',
    'Combo': '🎁',
  };

  return (
    <motion.div
      layout
      whileTap={{ scale: 0.98 }}
      className={`glass-card overflow-hidden relative ${
        isLocked ? 'opacity-60' : ''
      }`}
    >
      {isLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-secondary/60 backdrop-blur-sm rounded-2xl">
          <div className="text-center">
            <span className="text-2xl">🔒</span>
            <p className="text-xs text-white/60 mt-1">Priority Pass</p>
          </div>
        </div>
      )}

      {/* Food Image / Emoji */}
      <div className="h-28 bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center relative overflow-hidden">
        <span className="text-5xl">
          {categoryEmoji[item.category] || '🍽️'}
        </span>
        {item.isCombo && (
          <div className="absolute top-2 left-2 section-badge-combo text-[10px]">
            COMBO
          </div>
        )}
        {item.etaMinutes > 0 && (
          <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] text-white/70">
            ~{item.etaMinutes}m
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-white/90 leading-tight line-clamp-2">
          {item.name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-bold">₹{item.price}</span>

          {!isLocked && (
            <div>
              {quantity === 0 ? (
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => addItem(item)}
                  className="bg-primary/20 text-primary rounded-lg w-8 h-8 flex items-center justify-center hover:bg-primary/30 transition-colors"
                >
                  <Plus size={18} />
                </motion.button>
              ) : (
                <motion.div
                  layout
                  className="flex items-center gap-2 bg-primary/20 rounded-lg px-1"
                >
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => updateQuantity(item.id, quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-primary"
                  >
                    <Minus size={14} />
                  </motion.button>
                  <motion.span
                    key={quantity}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="text-sm font-bold text-primary min-w-[16px] text-center"
                  >
                    {quantity}
                  </motion.span>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => updateQuantity(item.id, quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-primary"
                  >
                    <Plus size={14} />
                  </motion.button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
