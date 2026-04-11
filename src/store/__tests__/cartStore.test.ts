import { useCartStore } from '../cartStore';
import type { MenuItemData } from '@/types';

// Mock navigator.vibrate
const mockVibrate = jest.fn();
Object.defineProperty(global.navigator, 'vibrate', {
  value: mockVibrate,
  writable: true,
});

describe('cartStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCartStore.setState({
      items: [],
      cafeteriaId: null,
      cafeteriaName: null,
    });
    mockVibrate.mockClear();
  });

  const mockMenuItem: MenuItemData = {
    id: 'item-1',
    name: 'Samosa',
    section: 'SNACK',
    category: 'Snacks',
    price: 20,
    imageUrl: null,
    etaMinutes: 0,
    isCombo: false,
    isPriorityOnly: false,
    isAvailable: true,
  };

  describe('addItem', () => {
    it('should add new item to cart with quantity 1', () => {
      const { addItem, items } = useCartStore.getState();
      addItem(mockMenuItem);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].menuItem.id).toBe('item-1');
      expect(state.items[0].quantity).toBe(1);
    });

    it('should increment quantity if item already exists', () => {
      const { addItem } = useCartStore.getState();
      addItem(mockMenuItem);
      addItem(mockMenuItem);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(2);
    });

    it('should trigger haptic feedback', () => {
      const { addItem } = useCartStore.getState();
      addItem(mockMenuItem);

      expect(mockVibrate).toHaveBeenCalledWith(50);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const { addItem, removeItem } = useCartStore.getState();
      addItem(mockMenuItem);
      removeItem('item-1');

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const { addItem, updateQuantity } = useCartStore.getState();
      addItem(mockMenuItem);
      updateQuantity('item-1', 5);

      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(5);
    });

    it('should remove item when quantity is 0 or less', () => {
      const { addItem, updateQuantity } = useCartStore.getState();
      addItem(mockMenuItem);
      updateQuantity('item-1', 0);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should clear all items and cafeteria info', () => {
      const { addItem, setCafeteria, clearCart } = useCartStore.getState();
      setCafeteria('cafe-1', 'Samridhi');
      addItem(mockMenuItem);
      clearCart();

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
      expect(state.cafeteriaId).toBeNull();
      expect(state.cafeteriaName).toBeNull();
    });
  });

  describe('setCafeteria', () => {
    it('should set cafeteria info when cart is empty', () => {
      const { setCafeteria } = useCartStore.getState();
      setCafeteria('cafe-1', 'Samridhi');

      const state = useCartStore.getState();
      expect(state.cafeteriaId).toBe('cafe-1');
      expect(state.cafeteriaName).toBe('Samridhi');
    });

    it('should clear cart when switching to different cafeteria', () => {
      const { addItem, setCafeteria } = useCartStore.getState();
      setCafeteria('cafe-1', 'Samridhi');
      addItem(mockMenuItem);
      setCafeteria('cafe-2', 'Canteen Main');

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
      expect(state.cafeteriaId).toBe('cafe-2');
      expect(state.cafeteriaName).toBe('Canteen Main');
    });

    it('should not clear cart when setting same cafeteria', () => {
      const { addItem, setCafeteria } = useCartStore.getState();
      setCafeteria('cafe-1', 'Samridhi');
      addItem(mockMenuItem);
      setCafeteria('cafe-1', 'Samridhi');

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
    });
  });

  describe('getTotal', () => {
    it('should return 0 for empty cart', () => {
      const { getTotal } = useCartStore.getState();
      expect(getTotal()).toBe(0);
    });

    it('should calculate total correctly', () => {
      const { addItem, getTotal } = useCartStore.getState();
      addItem(mockMenuItem); // 20
      addItem(mockMenuItem); // 20
      addItem({ ...mockMenuItem, id: 'item-2', price: 30 }); // 30

      expect(getTotal()).toBe(70); // 20*2 + 30*1
    });
  });

  describe('getItemCount', () => {
    it('should return 0 for empty cart', () => {
      const { getItemCount } = useCartStore.getState();
      expect(getItemCount()).toBe(0);
    });

    it('should count total items correctly', () => {
      const { addItem, getItemCount } = useCartStore.getState();
      addItem(mockMenuItem);
      addItem(mockMenuItem);
      addItem({ ...mockMenuItem, id: 'item-2' });

      expect(getItemCount()).toBe(3); // 2 + 1
    });
  });

  describe('getItemQuantity', () => {
    it('should return 0 for non-existent item', () => {
      const { getItemQuantity } = useCartStore.getState();
      expect(getItemQuantity('non-existent')).toBe(0);
    });

    it('should return correct quantity for existing item', () => {
      const { addItem, getItemQuantity } = useCartStore.getState();
      addItem(mockMenuItem);
      addItem(mockMenuItem);

      expect(getItemQuantity('item-1')).toBe(2);
    });
  });
});
