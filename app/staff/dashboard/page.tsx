'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, ArrowRight, RefreshCw, Sparkles, Flame, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '@/components/layout/PageTransition';
import { SectionErrorBoundary } from '@/components/error';

interface StaffOrder {
  id: string;
  tokenNumber: number;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
  student: { registrationNumber: string; name: string | null };
  items: { menuItem: { name: string }; quantity: number }[];
}

const columns = [
  {
    status: 'CONFIRMED',
    label: 'New Orders',
    headerBg: '#EEF4FF',
    headerText: '#1E40AF',
    actionBg: '#DBEAFE',
    actionText: '#1E40AF',
    action: 'Start Preparing',
    icon: Sparkles,
  },
  {
    status: 'PREPARING',
    label: 'Preparing',
    headerBg: '#FFFBEB',
    headerText: '#92400E',
    actionBg: '#FEF3C7',
    actionText: '#92400E',
    action: 'Mark Ready',
    icon: Flame,
  },
  {
    status: 'READY',
    label: 'Ready',
    headerBg: '#ECFDF5',
    headerText: '#065F46',
    actionBg: '#D1FAE5',
    actionText: '#065F46',
    action: 'Collected',
    icon: PackageCheck,
  },
];

export default function StaffDashboard() {
  return (
    <SectionErrorBoundary section="Staff Dashboard">
      <StaffDashboardContent />
    </SectionErrorBoundary>
  );
}

function StaffDashboardContent() {
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders/my');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Status update failed:', errorData);
        toast.error(errorData.error || 'Failed to update status');
        return;
      }
      
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (err) {
      console.error('Status update error:', err);
      toast.error('Network error while updating status');
    }
  };

  const getNextStatus = (current: string) => {
    if (current === 'CONFIRMED') return 'PREPARING';
    if (current === 'PREPARING') return 'READY';
    if (current === 'READY') return 'COLLECTED';
    return null;
  };

  const timeSince = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    return mins < 1 ? 'Just now' : `${mins}m ago`;
  };

  const newOrderCount = orders.filter((o) => o.orderStatus === 'CONFIRMED').length;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#eeeeee] p-4 safe-top">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2">
              <ChefHat size={24} className="text-[#b50346]" /> Kitchen Dashboard
            </h1>
            <p className="text-[#6B7280] text-xs mt-0.5">
              {newOrderCount > 0
                ? `${newOrderCount} new order${newOrderCount > 1 ? 's' : ''} waiting`
                : 'All caught up!'}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={fetchOrders}
            className="w-10 h-10 bg-[#eeeeee] rounded-xl flex items-center justify-center shadow-sm border border-[rgba(181,3,70,0.1)]"
          >
            <RefreshCw size={17} className="text-[#b50346]" />
          </motion.button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-64" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((col) => {
              const colOrders = orders.filter((o) => o.orderStatus === col.status);
              return (
                <div key={col.status}>
                  {/* Column header */}
                  <div
                    className="flex items-center gap-2 mb-3 px-4 py-2.5 rounded-xl"
                    style={{ background: col.headerBg }}
                  >
                    <col.icon size={16} style={{ color: col.headerText }} />
                    <span
                      className="text-sm font-bold"
                      style={{ color: col.headerText }}
                    >
                      {col.label}
                    </span>
                    <span
                      className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(238,238,238,0.8)', color: col.headerText }}
                    >
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Orders */}
                  <div className="space-y-3">
                    <AnimatePresence>
                      {colOrders.map((order) => (
                        <motion.div
                          key={order.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="glass-card p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="text-2xl font-black"
                              style={{ color: '#b50346' }}
                            >
                              #{order.tokenNumber}
                            </span>
                            <div className="flex items-center gap-1 text-[#9CA3AF]">
                              <Clock size={11} />
                              <span className="text-[10px]">{timeSince(order.createdAt)}</span>
                            </div>
                          </div>

                          <p className="text-[#6B7280] text-xs mb-2 font-medium">
                            {order.student?.name || order.student?.registrationNumber}
                          </p>

                          <div className="space-y-1 mb-3">
                            {order.items?.map((item, i) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-[#1A1A2E] font-medium">{item.menuItem.name}</span>
                                <span className="text-[#6B7280]">×{item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between mb-3 pt-2 border-t border-[rgba(181,3,70,0.1)]">
                            <span className="text-xs text-[#6B7280]">Total</span>
                            <span className="text-sm font-bold text-[#b50346]">₹{order.totalAmount}</span>
                          </div>

                          <div className="flex gap-2">
                            {getNextStatus(order.orderStatus) && (
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  updateStatus(order.id, getNextStatus(order.orderStatus)!)
                                }
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                                style={{
                                  background: col.actionBg,
                                  color: col.actionText,
                                }}
                              >
                                {col.action} <ArrowRight size={13} />
                              </motion.button>
                            )}

                            {order.orderStatus !== 'COLLECTED' && (
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateStatus(order.id, 'COLLECTED')}
                                className="px-3 py-2.5 rounded-xl text-xs font-semibold text-[#6B7280] bg-[#F3F4F6] border border-[#E5E7EB] hover:bg-[#D1D5DB] transition-all"
                                title="Skip to Collected"
                              >
                                Finish
                              </motion.button>
                            )}
                          </div>

                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {colOrders.length === 0 && (
                      <div
                        className="text-center py-10 rounded-xl"
                        style={{ background: '#FFF8F4' }}
                      >
                        <span className="text-2xl">☀️</span>
                        <p className="text-[#9CA3AF] text-xs mt-2">No orders here</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
