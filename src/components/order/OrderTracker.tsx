'use client';

import { motion } from 'framer-motion';
import { useRealtimeOrder } from '@/hooks/useRealtimeOrder';
import { CheckCircle2, Clock, ChefHat, Bell, Package } from 'lucide-react';
import type { OrderData } from '@/types';

interface OrderTrackerProps {
  orderId: string;
}

type OrderStatus = OrderData['orderStatus'];

interface StatusStage {
  status: OrderStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const STATUS_STAGES: StatusStage[] = [
  {
    status: 'AWAITING_PAYMENT',
    label: 'Awaiting Payment',
    description: 'Complete payment to confirm order',
    icon: <Clock size={22} />,
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  {
    status: 'CONFIRMED',
    label: 'Order Confirmed',
    description: 'Your order has been received',
    icon: <CheckCircle2 size={22} />,
    color: '#10B981',
    bg: '#D1FAE5',
  },
  {
    status: 'PREPARING',
    label: 'Preparing',
    description: 'Your food is being prepared in the kitchen',
    icon: <ChefHat size={22} />,
    color: '#FF6B35',
    bg: '#FFF0E8',
  },
  {
    status: 'READY',
    label: 'Ready for Pickup',
    description: 'Your order is ready! Head to the counter',
    icon: <Bell size={22} />,
    color: '#10B981',
    bg: '#D1FAE5',
  },
  {
    status: 'COLLECTED',
    label: 'Collected',
    description: 'Enjoy your meal! 😊',
    icon: <Package size={22} />,
    color: '#6B7280',
    bg: '#F9FAFB',
  },
];

export default function OrderTracker({ orderId }: OrderTrackerProps) {
  const { order, isLoading, error } = useRealtimeOrder(orderId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 rounded-full border-4 border-[rgba(255,107,53,0.15)] border-t-[#FF6B35] mb-4"
        />
        <p className="text-[#6B7280] text-sm">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="glass-card p-6 text-center">
        <span className="text-4xl">😕</span>
        <p className="text-[#EF4444] font-semibold mt-3 mb-1">Failed to load order</p>
        <p className="text-[#6B7280] text-sm">{error?.message || 'Order not found'}</p>
      </div>
    );
  }

  const currentStageIndex = STATUS_STAGES.findIndex(
    (stage) => stage.status === order.orderStatus
  );
  const isReady = order.orderStatus === 'READY';

  return (
    <div className="space-y-5">
      {/* Ready Banner */}
      {isReady && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 text-center"
          style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)' }}
        >
          <p className="text-white font-bold text-base">
            🔔 Your order is ready! Head to the counter now.
          </p>
        </motion.div>
      )}

      {/* Order Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 space-y-4"
      >
        <div className="text-center">
          <p className="text-[#6B7280] text-xs mb-1">Order Number</p>
          <p className="text-[#1A1A2E] text-lg font-bold tracking-wide font-mono">
            {order.orderNumber || order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Token Number */}
        <motion.div
          animate={
            isReady
              ? {
                  boxShadow: [
                    '0 0 20px rgba(16,185,129,0.2)',
                    '0 0 40px rgba(16,185,129,0.4)',
                    '0 0 20px rgba(16,185,129,0.2)',
                  ],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-center py-6 rounded-xl"
          style={{
            background: isReady ? '#D1FAE5' : '#FFF0E8',
            border: isReady ? '2px solid #10B981' : '1px solid rgba(255,107,53,0.15)',
          }}
        >
          <p className="text-[#6B7280] text-sm mb-1">Token Number</p>
          <motion.p
            animate={isReady ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="font-black"
            style={{
              fontSize: '56px',
              lineHeight: 1,
              color: isReady ? '#10B981' : '#FF6B35',
            }}
          >
            #{order.tokenNumber}
          </motion.p>
          {isReady && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-semibold mt-2"
              style={{ color: '#065F46' }}
            >
              🎉 Ready for pickup!
            </motion.p>
          )}
        </motion.div>

        <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,107,53,0.1)]">
          <span className="text-[#6B7280] text-sm">Cafeteria</span>
          <span className="text-[#1A1A2E] font-semibold text-sm">{order.cafeteria.name}</span>
        </div>
      </motion.div>

      {/* Status Stepper */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-6"
      >
        <h3 className="text-[#1A1A2E] font-semibold mb-6">Order Status</h3>

        <div className="relative">
          {/* Background line */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-[rgba(255,107,53,0.1)]" />

          {/* Active progress line */}
          <motion.div
            className="absolute left-6 top-6 w-0.5"
            style={{ background: 'linear-gradient(180deg, #FF6B35, #FFB347)' }}
            initial={{ height: 0 }}
            animate={{
              height: `${(currentStageIndex / (STATUS_STAGES.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          <div className="space-y-8">
            {STATUS_STAGES.map((stage, index) => {
              const isActive = index === currentStageIndex;
              const isCompleted = index < currentStageIndex;
              const isPending = index > currentStageIndex;

              return (
                <motion.div
                  key={stage.status}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: isPending ? 0.5 : 1, x: 0 }}
                  transition={{ delay: 0.08 * index }}
                  className="relative flex items-start gap-4"
                >
                  {/* Icon circle */}
                  <motion.div
                    animate={
                      isActive
                        ? {
                            scale: [1, 1.1, 1],
                            boxShadow: [
                              `0 0 0 0 ${stage.color}30`,
                              `0 0 0 8px ${stage.color}20`,
                              `0 0 0 0 ${stage.color}30`,
                            ],
                          }
                        : {}
                    }
                    transition={
                      isActive
                        ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                        : {}
                    }
                    className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isCompleted
                        ? '#10B981'
                        : isActive
                        ? stage.color
                        : '#FFF0E8',
                    }}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        <CheckCircle2 size={22} className="text-white" />
                      </motion.div>
                    ) : (
                      <motion.div
                        animate={
                          isActive
                            ? { rotate: [0, 8, -8, 0] }
                            : {}
                        }
                        transition={
                          isActive
                            ? { duration: 2, repeat: Infinity }
                            : {}
                        }
                        style={{ color: isActive ? '#FFFFFF' : '#9CA3AF' }}
                      >
                        {stage.icon}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h4
                      className="font-semibold mb-0.5"
                      style={{
                        color: isActive ? '#1A1A2E' : isCompleted ? '#4B5563' : '#9CA3AF',
                        fontSize: '15px',
                      }}
                    >
                      {stage.label}
                    </h4>
                    <p
                      className="text-sm"
                      style={{
                        color: isActive ? '#6B7280' : isCompleted ? '#9CA3AF' : '#D1D5DB',
                      }}
                    >
                      {stage.description}
                    </p>

                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-2 h-2 rounded-full"
                          style={{ background: stage.color }}
                        />
                        <span className="text-xs font-semibold" style={{ color: stage.color }}>
                          In Progress
                        </span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Order Items */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-[#1A1A2E] font-semibold mb-4">Order Items</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 border-b border-[rgba(255,107,53,0.08)] last:border-0"
            >
              <div className="flex items-center gap-3">
                <span
                  className="text-sm font-bold w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: '#FFF0E8', color: '#FF6B35' }}
                >
                  {item.quantity}×
                </span>
                <span className="text-[#1A1A2E] text-sm font-medium">{item.menuItem.name}</span>
              </div>
              <span className="text-[#6B7280] text-sm font-semibold">
                ₹{(item.unitPrice * item.quantity).toFixed(0)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[rgba(255,107,53,0.1)]">
          <span className="text-[#1A1A2E] font-semibold">Total</span>
          <span className="text-[#FF6B35] text-lg font-extrabold">
            ₹{order.totalAmount.toFixed(0)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
