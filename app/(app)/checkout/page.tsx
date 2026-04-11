'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import { ArrowLeft } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';
import PaymentTimer from '@/components/payment/PaymentTimer';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import type { CreateOrderResponse } from '@/types';

export default function CheckoutPage() {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderData, setOrderData] = useState<CreateOrderResponse | null>(null);

  const items = useCartStore((s) => s.items);
  const cafeteriaId = useCartStore((s) => s.cafeteriaId);
  const cafeteriaName = useCartStore((s) => s.cafeteriaName);
  const clearCart = useCartStore((s) => s.clearCart);
  const setCurrentOrder = useOrderStore((s) => s.setCurrentOrder);
  const clearCurrentOrder = useOrderStore((s) => s.clearCurrentOrder);

  const router = useRouter();

  useEffect(() => {
    if (items.length === 0 && !orderData) {
      toast.error('Your cart is empty');
      router.replace('/menu');
    }
  }, [items, orderData, router]);

  useEffect(() => {
    if (orderData || items.length === 0) return;

    const createOrder = async () => {
      setIsCreatingOrder(true);
      try {
        const data = await api.post<{ order: any; cashfreeSessionId: string }>(
          '/api/orders',
          {
            cafeteriaId,
            items: items.map((i) => ({
              menuItemId: i.menuItem.id,
              quantity: i.quantity,
            })),
          },
          {
            showSuccessToast: false,
          }
        );

        const orderResponse: CreateOrderResponse = {
          orderId: data.order.id,
          cashfreeSessionId: data.cashfreeSessionId,
          expiresAt: data.order.expiresAt,
          tokenNumber: data.order.tokenNumber,
          totalAmount: data.order.totalAmount,
        };

        setOrderData(orderResponse);
        setCurrentOrder(data.order);
      } catch (error) {
        console.error('Order creation error:', error);
        toast.error('Failed to create order. Please try again.');
        router.replace('/menu');
      } finally {
        setIsCreatingOrder(false);
      }
    };

    createOrder();
  }, [cafeteriaId, items, orderData, router, setCurrentOrder]);

  const handleExpire = async () => {
    if (!orderData) return;

    try {
      await api.post(`/api/orders/${orderData.orderId}/expire`, undefined, {
        showErrorToast: false,
      });
    } catch (error) {
      console.error('Failed to expire order:', error);
    }

    clearCurrentOrder();
    clearCart();
    toast.error('Order expired. Please try again.');
    router.push('/menu');
  };

  const handleProceedToPayment = () => {
    if (!orderData) return;

    const currentOrder = useOrderStore.getState().currentOrder;
    const orderNumber =
      currentOrder?.orderNumber ||
      `AF-${new Date().getFullYear()}-${orderData.tokenNumber.toString().padStart(4, '0')}`;

    clearCart();
    clearCurrentOrder();

    const params = new URLSearchParams({
      orderId: orderData.orderId,
      amount: String(Math.round(orderData.totalAmount * 1.05)),
      orderNumber,
      token: orderData.tokenNumber.toString(),
      cafeteria: cafeteriaName || 'Cafeteria',
    });

    router.push(`/payment?${params.toString()}`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FFF8F4] p-6 safe-top pb-28">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#FFF0E8] text-[#FF6B35]"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A2E]">Checkout</h1>
            <p className="text-xs text-[#6B7280]">Review & pay</p>
          </div>
        </div>

        {/* Loading State */}
        {isCreatingOrder && (
          <div className="flex flex-col items-center justify-center py-24">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-[rgba(255,107,53,0.15)] border-t-[#FF6B35] rounded-full"
            />
            <p className="text-[#6B7280] mt-4 text-sm">Creating your order...</p>
          </div>
        )}

        {/* Order Created */}
        {!isCreatingOrder && orderData && (
          <div className="space-y-5">
            {/* Timer */}
            <PaymentTimer
              expiresAt={orderData.expiresAt}
              onExpire={handleExpire}
            />

            {/* Order Summary */}
            <CheckoutSummary
              orderNumber={`AF-${new Date().getFullYear()}-${orderData.tokenNumber.toString().padStart(4, '0')}`}
              onProceedToPayment={handleProceedToPayment}
            />
          </div>
        )}
      </div>
    </PageTransition>
  );
}
