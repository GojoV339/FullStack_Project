import { useOrderStore } from '../orderStore';
import type { OrderData } from '@/types';

describe('orderStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useOrderStore.setState({
      currentOrder: null,
    });
  });

  const mockOrder: OrderData = {
    id: 'order-1',
    tokenNumber: 42,
    totalAmount: 150,
    paymentStatus: 'PAID',
    orderStatus: 'CONFIRMED',
    expiresAt: '2024-01-01T12:00:00Z',
    createdAt: '2024-01-01T11:55:00Z',
    cafeteria: {
      id: 'cafe-1',
      name: 'Samridhi',
      location: 'Main Block',
      isOpen: true,
      avgWaitMinutes: 10,
    },
    items: [
      {
        id: 'order-item-1',
        menuItem: {
          name: 'Samosa',
          imageUrl: null,
        },
        quantity: 2,
        unitPrice: 20,
      },
      {
        id: 'order-item-2',
        menuItem: {
          name: 'Chai',
          imageUrl: null,
        },
        quantity: 1,
        unitPrice: 10,
      },
    ],
  };

  describe('setCurrentOrder', () => {
    it('should set current order', () => {
      const { setCurrentOrder } = useOrderStore.getState();
      setCurrentOrder(mockOrder);

      const state = useOrderStore.getState();
      expect(state.currentOrder).toEqual(mockOrder);
      expect(state.currentOrder?.id).toBe('order-1');
      expect(state.currentOrder?.tokenNumber).toBe(42);
    });

    it('should replace existing order when setting new order', () => {
      const { setCurrentOrder } = useOrderStore.getState();
      setCurrentOrder(mockOrder);

      const newOrder: OrderData = {
        ...mockOrder,
        id: 'order-2',
        tokenNumber: 43,
      };
      setCurrentOrder(newOrder);

      const state = useOrderStore.getState();
      expect(state.currentOrder?.id).toBe('order-2');
      expect(state.currentOrder?.tokenNumber).toBe(43);
    });
  });

  describe('clearCurrentOrder', () => {
    it('should clear current order', () => {
      const { setCurrentOrder, clearCurrentOrder } = useOrderStore.getState();
      setCurrentOrder(mockOrder);
      clearCurrentOrder();

      const state = useOrderStore.getState();
      expect(state.currentOrder).toBeNull();
    });

    it('should handle clearing when no order exists', () => {
      const { clearCurrentOrder } = useOrderStore.getState();
      clearCurrentOrder();

      const state = useOrderStore.getState();
      expect(state.currentOrder).toBeNull();
    });
  });

  describe('initial state', () => {
    it('should have null currentOrder initially', () => {
      const state = useOrderStore.getState();
      expect(state.currentOrder).toBeNull();
    });
  });

  describe('no persistence', () => {
    it('should not persist to localStorage', () => {
      // The store should not use persist middleware
      // This is verified by the implementation not wrapping with persist()
      const { setCurrentOrder } = useOrderStore.getState();
      setCurrentOrder(mockOrder);

      // Verify the store is session-only by checking it doesn't have persist wrapper
      // The implementation uses create() directly without persist() middleware
      expect(useOrderStore.persist).toBeUndefined();
    });
  });
});
