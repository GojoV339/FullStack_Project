'use client';

import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBasket } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartButton() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const total = useCartStore((s) => s.getTotal());
  const router = useRouter();

  if (itemCount === 0) return null;

  return (
    <motion.button
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push('/checkout')}
      className="fixed bottom-20 left-4 right-4 z-30 md:bottom-4 md:left-auto md:right-4 md:max-w-sm"
    >
      <div className="gradient-primary rounded-2xl py-4 px-5 shadow-primary flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBasket size={22} className="text-[#2D2D2D]" />
            <motion.span
              key={itemCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-[#eeeeee] text-primary text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {itemCount}
            </motion.span>
          </div>
          <span className="text-[#2D2D2D] font-medium text-sm">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#2D2D2D] font-bold">₹{total}</span>
          <span className="text-[#2D2D2D]/70 text-sm">→</span>
        </div>
      </div>
    </motion.button>
  );
}
