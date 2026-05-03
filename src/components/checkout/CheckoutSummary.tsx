'use client';

import { motion } from 'framer-motion';
import { Receipt, Store } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface CheckoutSummaryProps {
  orderNumber?: string;
  onProceedToPayment: () => void;
}

export default function CheckoutSummary({ orderNumber, onProceedToPayment }: CheckoutSummaryProps) {
  const items = useCartStore((s) => s.items);
  const cafeteriaName = useCartStore((s) => s.cafeteriaName);
  const getTotal = useCartStore((s) => s.getTotal);

  const total = getTotal();
  const gst = Math.round(total * 0.05);
  const grandTotal = total + gst;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[rgba(181,3,70,0.1)]">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #b50346, #d45c7e)' }}
        >
          <Receipt size={24} className="text-[#2D2D2D]" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#2D2D2D]">Order Summary</h2>
          {orderNumber && (
            <p className="text-sm text-[#b50346] font-mono mt-0.5">#{orderNumber}</p>
          )}
        </div>
      </div>

      {/* Cafeteria Info */}
      {cafeteriaName && (
        <div className="flex items-center gap-2 px-4 py-3 bg-[#e0e0e0] rounded-xl border border-[rgba(181,3,70,0.15)]">
          <Store size={18} className="text-[#b50346]" />
          <div>
            <p className="text-xs text-[#8A8A8A]">Cafeteria</p>
            <p className="text-sm font-semibold text-[#2D2D2D]">{cafeteriaName}</p>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wide">
          Items ({itemCount})
        </h3>
        <div className="space-y-2">
          {items.map((item) => {
            const subtotal = item.menuItem.price * item.quantity;
            return (
              <motion.div
                key={item.menuItem.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start justify-between gap-3 p-3 bg-[#eeeeee] rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-[#2D2D2D] leading-tight">
                    {item.menuItem.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#8A8A8A]">₹{item.menuItem.price}</span>
                    <span className="text-xs text-[#ABABAB]">×</span>
                    <span className="text-xs text-[#8A8A8A]">{item.quantity}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#8a0235]">₹{subtotal}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Totals */}
      <div className="pt-4 border-t border-[rgba(181,3,70,0.1)] space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#8A8A8A]">Subtotal</span>
          <span className="text-[#2D2D2D] font-medium">₹{total}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#8A8A8A]">GST (5%)</span>
          <span className="text-[#2D2D2D] font-medium">₹{gst}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[rgba(181,3,70,0.1)]">
          <span className="text-base font-semibold text-[#2D2D2D]">Grand Total</span>
          <motion.div
            key={grandTotal}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-3xl font-extrabold text-[#8a0235]"
          >
            ₹{grandTotal}
          </motion.div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onProceedToPayment}
          className="w-full btn-primary h-[52px] text-base mt-2"
        >
          Pay ₹{grandTotal} with UPI
        </motion.button>
      </div>
    </motion.div>
  );
}
