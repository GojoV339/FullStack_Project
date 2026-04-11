'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Lock } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import type { MenuItemData } from '@/types';

interface FoodCardProps {
  item: MenuItemData;
  isLocked?: boolean;
}

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

export default function FoodCard({ item, isLocked = false }: FoodCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const quantity = useCartStore((s) => s.getItemQuantity(item.id));

  const handleAdd = () => {
    addItem(item);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={!isLocked ? { scale: 0.97 } : {}}
      className="glass-card overflow-hidden relative flex flex-col"
    >
      {isLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
          <div className="text-center px-3">
            <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center mx-auto mb-2">
              <Lock size={18} className="text-[#92400E]" />
            </div>
            <p className="text-xs font-semibold text-[#92400E]">Priority Pass</p>
            <p className="text-[10px] text-[#6B7280] mt-0.5">Only for subscribers</p>
          </div>
        </div>
      )}

      {/* Food Image / Emoji */}
      <div className="h-28 bg-gradient-to-br from-[#FFF0E8] to-[#FFE4D0] flex items-center justify-center relative overflow-hidden">
        <span className="text-5xl">
          {categoryEmoji[item.category] || '🍽️'}
        </span>

        {/* Section badge */}
        {item.isCombo ? (
          <div className="absolute top-2 left-2 section-badge-combo text-[10px] py-0.5">
            COMBO
          </div>
        ) : item.section === 'SNACK' ? (
          <div className="absolute top-2 left-2 section-badge-snack text-[10px] py-0.5">
            READY
          </div>
        ) : (
          <div className="absolute top-2 left-2 section-badge-cook text-[10px] py-0.5">
            COOK
          </div>
        )}

        {item.etaMinutes > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded-full text-[10px] text-[#1E40AF] font-medium shadow-sm">
            ~{item.etaMinutes}m
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-[#1A1A2E] leading-tight line-clamp-2 flex-1">
          {item.name}
        </h3>
        <p className="text-[10px] text-[#6B7280] mt-0.5">{item.category}</p>

        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-extrabold text-[#FF6B35]">₹{item.price}</span>

          {!isLocked && (
            <AnimatePresence mode="wait">
              {quantity === 0 ? (
                <motion.button
                  key="add"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={handleAdd}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B35, #FFB347)',
                    boxShadow: '0 2px 8px rgba(255,107,53,0.35)',
                  }}
                >
                  <Plus size={16} className="text-white" />
                </motion.button>
              ) : (
                <motion.div
                  key="controls"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  layout
                  className="flex items-center gap-1.5 bg-[#FFF0E8] rounded-lg px-1.5 py-0.5 border border-[rgba(255,107,53,0.2)]"
                >
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => updateQuantity(item.id, quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center text-[#FF6B35]"
                  >
                    <Minus size={13} />
                  </motion.button>
                  <motion.span
                    key={quantity}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-sm font-bold text-[#FF6B35] min-w-[16px] text-center"
                  >
                    {quantity}
                  </motion.span>
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => updateQuantity(item.id, quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center text-[#FF6B35]"
                  >
                    <Plus size={13} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}
