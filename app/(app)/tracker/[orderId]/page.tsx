'use client';

import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import OrderTracker from '@/components/order/OrderTracker';

export default function TrackerPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const router = useRouter();

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#eeeeee] p-6 safe-top pb-28">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/orders')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#e0e0e0] text-[#b50346]"
            aria-label="Back to orders"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">Order Tracker</h1>
            <p className="text-xs text-[#6B7280]">Live updates</p>
          </div>
        </div>

        <OrderTracker orderId={orderId} />
      </div>
    </PageTransition>
  );
}
