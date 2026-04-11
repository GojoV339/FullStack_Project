'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import CartItem from './CartItem';
import { useRouter } from 'next/navigation';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSheet({ isOpen, onClose }: CartSheetProps) {
  const items = useCartStore((s) => s.items);
  const cafeteriaName = useCartStore((s) => s.cafeteriaName);
  const getTotal = useCartStore((s) => s.getTotal);
  const router = useRouter();

  const total = getTotal();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const gst = Math.round(total * 0.05);
  const grandTotal = total + gst;

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet (Mobile) / Sidebar (Desktop) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-0 md:left-auto md:right-0 md:w-[400px] md:translate-y-0"
            style={{
              background: '#FFFFFF',
            }}
          >
            <div
              className="h-full max-h-[85vh] md:max-h-full rounded-t-3xl md:rounded-none flex flex-col"
              style={{
                boxShadow: '0 -8px 32px rgba(255,107,53,0.12)',
                border: '1px solid rgba(255,107,53,0.1)',
              }}
            >
              {/* Drag handle (mobile only) */}
              <div className="flex justify-center pt-3 pb-1 md:hidden">
                <div className="w-10 h-1 bg-[#FFE4D0] rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,107,53,0.1)]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)' }}
                  >
                    <ShoppingBag size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1A1A2E]">Your Order</h2>
                    {cafeteriaName && (
                      <p className="text-xs text-[#6B7280]">{cafeteriaName}</p>
                    )}
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-[#FFF0E8] flex items-center justify-center"
                >
                  <X size={18} className="text-[#FF6B35]" />
                </motion.button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-[#FFF0E8] flex items-center justify-center mb-4">
                      <span className="text-4xl">🍽️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-sm text-[#6B7280]">
                      Add delicious items from the menu
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <CartItem key={item.menuItem.id} item={item} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="px-5 py-5 border-t border-[rgba(255,107,53,0.1)] space-y-3 bg-[#FFF8F4]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6B7280]">Subtotal</span>
                    <span className="text-[#1A1A2E] font-medium">₹{total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6B7280]">GST (5%)</span>
                    <span className="text-[#1A1A2E] font-medium">₹{gst}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[rgba(255,107,53,0.1)] pt-3">
                    <div>
                      <p className="text-sm text-[#6B7280]">Grand Total</p>
                      <p className="text-xs text-[#9CA3AF]">
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <motion.div
                      key={grandTotal}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-extrabold text-[#FF6B35]"
                    >
                      ₹{grandTotal}
                    </motion.div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCheckout}
                    className="w-full btn-primary h-[52px] text-base"
                  >
                    Proceed to Pay ₹{grandTotal}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
