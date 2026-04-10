import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItemData, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  cafeteriaId: string | null;
  cafeteriaName: string | null;

  addItem: (menuItem: MenuItemData) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  setCafeteria: (id: string, name: string) => void;

  getTotal: () => number;
  getItemCount: () => number;
  getItemQuantity: (menuItemId: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cafeteriaId: null,
      cafeteriaName: null,

      addItem: (menuItem: MenuItemData) => {
        const { items } = get();
        const existing = items.find((i) => i.menuItem.id === menuItem.id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.menuItem.id === menuItem.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { menuItem, quantity: 1 }] });
        }

        // Haptic feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(50);
        }
      },

      removeItem: (menuItemId: string) => {
        set({
          items: get().items.filter((i) => i.menuItem.id !== menuItemId),
        });
      },

      updateQuantity: (menuItemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.menuItem.id === menuItemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [], cafeteriaId: null, cafeteriaName: null });
      },

      setCafeteria: (id: string, name: string) => {
        const { cafeteriaId, items } = get();
        // Clear cart if switching cafeteria
        if (cafeteriaId && cafeteriaId !== id && items.length > 0) {
          set({ items: [], cafeteriaId: id, cafeteriaName: name });
        } else {
          set({ cafeteriaId: id, cafeteriaName: name });
        }
      },

      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.menuItem.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getItemQuantity: (menuItemId: string) => {
        const item = get().items.find((i) => i.menuItem.id === menuItemId);
        return item?.quantity ?? 0;
      },
    }),
    {
      name: 'amrita-feast-cart',
    }
  )
);
