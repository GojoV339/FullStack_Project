'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Clock, MapPin, ArrowRight, ShoppingBag } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import { SectionErrorBoundary } from '@/components/error';
import { api } from '@/lib/api-client';
import type { OrderData } from '@/types';

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  AWAITING_PAYMENT: { bg: '#FEF3C7', text: '#92400E', label: 'Awaiting Payment' },
  CONFIRMED: { bg: '#DBEAFE', text: '#1E40AF', label: 'Confirmed' },
  PREPARING: { bg: '#FEF3C7', text: '#92400E', label: 'Preparing' },
  READY: { bg: '#D1FAE5', text: '#065F46', label: '🔔 Ready!' },
  COLLECTED: { bg: '#F3E8FF', text: '#6B21A8', label: 'Collected' },
  CANCELLED: { bg: '#FEE2E2', text: '#991B1B', label: 'Cancelled' },
};

export default function OrdersPage() {
  return (
    <SectionErrorBoundary section="Orders">
      <OrdersPageContent />
    </SectionErrorBoundary>
  );
}

function OrdersPageContent() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.get<{ orders: OrderData[] }>('/api/orders/my');
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FFF8F4] p-6 safe-top pb-28">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">
          My <span className="text-gradient">Orders</span>
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-[#FFF0E8] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={36} className="text-[#FF6B35]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">No orders yet</h3>
            <p className="text-[#6B7280] text-sm mb-5">Start ordering from the canteen!</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/cafeteria')}
              className="btn-primary"
            >
              Order Now
            </motion.button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, index) => {
              const status = statusConfig[order.orderStatus] || {
                bg: '#F3F4F6', text: '#6B7280', label: order.orderStatus,
              };
              const isActive = ['CONFIRMED', 'PREPARING', 'READY'].includes(order.orderStatus);

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  onClick={() => isActive && router.push(`/tracker/${order.id}`)}
                  className={`glass-card p-4 ${isActive ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-[#FF6B35]">
                          #{order.tokenNumber}
                        </span>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{ background: status.bg, color: status.text }}
                        >
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <MapPin size={11} className="text-[#9CA3AF]" />
                        <span className="text-[#9CA3AF] text-xs">
                          {order.cafeteria?.name || 'Canteen'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[#FF6B35] font-bold text-base">₹{order.totalAmount}</span>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <Clock size={11} className="text-[#9CA3AF]" />
                        <span className="text-[#9CA3AF] text-[10px]">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[#6B7280] text-xs">
                    {order.items?.map((item) => item.menuItem?.name).slice(0, 3).join(', ')}
                    {order.items?.length > 3 && ` +${order.items.length - 3} more`}
                  </div>

                  {isActive && (
                    <div className="flex items-center justify-end mt-3 text-[#FF6B35] text-xs font-medium">
                      Track order <ArrowRight size={13} className="ml-1" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
