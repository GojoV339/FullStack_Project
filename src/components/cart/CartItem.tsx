'use client';

import { motion } from 'framer-motion';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import type { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const { menuItem, quantity } = item;

  const subtotal = menuItem.price * quantity;

  const handleDecrement = () => {
    updateQuantity(menuItem.id, quantity - 1);
  };

  const handleIncrement = () => {
    updateQuantity(menuItem.id, quantity + 1);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 py-3 border-b border-[#eeeeee]/5 last:border-0"
    >
      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-[#2D2D2D]/90 leading-tight line-clamp-2">
          {menuItem.name}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[#2D2D2D]/50">₹{menuItem.price}</span>
          <span className="text-xs text-[#2D2D2D]/30">×</span>
          <span className="text-xs text-[#2D2D2D]/50">{quantity}</span>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <motion.div
          layout
          className="flex items-center gap-2 bg-[#eeeeee]/5 rounded-lg px-1"
        >
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleDecrement}
            className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/10 rounded transition-colors"
            aria-label="Decrease quantity"
          >
            <MinusCircle size={14} />
          </motion.button>
          <motion.span
            key={quantity}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-sm font-bold text-[#2D2D2D] min-w-[16px] text-center"
          >
            {quantity}
          </motion.span>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleIncrement}
            className="w-7 h-7 flex items-center justify-center text-primary hover:bg-primary/10 rounded transition-colors"
            aria-label="Increase quantity"
          >
            <PlusCircle size={14} />
          </motion.button>
        </motion.div>

        {/* Subtotal */}
        <span className="text-sm font-bold text-primary min-w-[60px] text-right">
          ₹{subtotal}
        </span>
      </div>
    </motion.div>
  );
}
