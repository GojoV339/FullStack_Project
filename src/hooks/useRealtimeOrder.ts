'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type OrderStatus = 'AWAITING_PAYMENT' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COLLECTED' | 'CANCELLED';

export function useRealtimeOrder(orderId: string | null) {
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Order',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newStatus = (payload.new as { orderStatus: OrderStatus }).orderStatus;
          setOrderStatus(newStatus);

          // Vibrate on READY
          if (newStatus === 'READY' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return { orderStatus, setOrderStatus };
}
