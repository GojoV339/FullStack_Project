import { create } from 'zustand';
import type { OrderData } from '@/types';

interface OrderState {
  currentOrder: OrderData | null;

  setCurrentOrder: (order: OrderData) => void;
  clearCurrentOrder: () => void;
}

export const useOrderStore = create<OrderState>()((set) => ({
  currentOrder: null,

  setCurrentOrder: (order: OrderData) => {
    set({ currentOrder: order });
  },

  clearCurrentOrder: () => {
    set({ currentOrder: null });
  },
}));
