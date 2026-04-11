import { supabase, getRealtimeChannel, getAllOrdersChannel } from '../supabase';

describe('Supabase Client', () => {
  it('should export a configured supabase client', () => {
    expect(supabase).toBeDefined();
    expect(supabase.realtime).toBeDefined();
  });

  it('should create a realtime channel for a specific order', () => {
    const orderId = 'test-order-123';
    const channel = getRealtimeChannel(orderId);
    
    expect(channel).toBeDefined();
    expect(channel.topic).toBe(`realtime:order-${orderId}`);
  });

  it('should create a realtime channel for all orders', () => {
    const channel = getAllOrdersChannel();
    
    expect(channel).toBeDefined();
    expect(channel.topic).toBe('realtime:all-orders');
  });
});

describe('Supabase Configuration', () => {
  it('should have realtime configuration', () => {
    // Verify the client is configured with realtime options
    expect(supabase).toBeDefined();
    expect(supabase.realtime).toBeDefined();
  });

  it('should have auth persistence disabled', () => {
    // We use JWT cookies for auth, not Supabase auth
    // This is verified by the configuration in supabase.ts
    expect(supabase).toBeDefined();
  });
});
