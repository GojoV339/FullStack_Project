import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

/**
 * Supabase client configured for Realtime subscriptions
 * 
 * This client is used for:
 * - Real-time order status updates (Requirement 18)
 * - Real-time kitchen dashboard updates (Requirement 24)
 * - WebSocket-based database change notifications
 * 
 * Configuration:
 * - Realtime enabled for Order table subscriptions
 * - Auto-reconnection on connection loss
 * - Channel-based subscriptions for efficient updates
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    persistSession: false, // We use JWT cookies for auth, not Supabase auth
  },
});

/**
 * Creates a Realtime channel for order updates
 * 
 * @param orderId - The unique order ID to subscribe to
 * @returns Configured Supabase channel ready for subscription
 * 
 * Usage:
 * ```typescript
 * const channel = getRealtimeChannel(orderId)
 *   .on('postgres_changes', { ... }, (payload) => {
 *     // Handle update
 *   })
 *   .subscribe();
 * ```
 */
export function getRealtimeChannel(orderId: string) {
  return supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'Order',
        filter: `id=eq.${orderId}`,
      },
      (payload) => payload
    );
}

/**
 * Creates a Realtime channel for all order updates (for kitchen dashboard)
 * 
 * @returns Configured Supabase channel for all orders
 * 
 * Usage:
 * ```typescript
 * const channel = getAllOrdersChannel()
 *   .on('postgres_changes', { ... }, (payload) => {
 *     // Handle new order or status change
 *   })
 *   .subscribe();
 * ```
 */
export function getAllOrdersChannel() {
  return supabase.channel('all-orders');
}
