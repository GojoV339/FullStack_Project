'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { OrderData } from '@/types';

interface UseRealtimeOrderReturn {
  order: OrderData | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook for real-time order tracking
 * 
 * Implements Requirement 18: Real-Time Order Updates
 * - Initial fetch from API
 * - Subscribe to Supabase Realtime for live updates
 * - Auto-unsubscribe on unmount
 * 
 * @param orderId - The unique order ID to track
 * @returns Object containing order data, loading state, and error state
 */
export function useRealtimeOrder(orderId: string | null): UseRealtimeOrderReturn {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Initial fetch from API
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/orders/${orderId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch order: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (isMounted) {
          setOrder(data.order);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setIsLoading(false);
        }
      }
    };

    fetchOrder();

    // Subscribe to Supabase Realtime for order updates
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
          if (!isMounted) return;

          // Update order with new data from realtime event
          const updatedFields = payload.new as Partial<OrderData>;
          
          setOrder((prevOrder) => {
            if (!prevOrder) return prevOrder;
            
            return {
              ...prevOrder,
              ...updatedFields,
            };
          });

          // Vibrate on READY status
          if (updatedFields.orderStatus === 'READY' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        }
      )
      .subscribe();

    // Cleanup function - unsubscribe on unmount
    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return { order, isLoading, error };
}
