import { create } from 'zustand';

interface OrderState {
  activeOrderId: string | null;
  tokenNumber: number | null;
  cashfreeSessionId: string | null;
  expiresAt: string | null;
  totalAmount: number | null;

  setActiveOrder: (data: {
    orderId: string;
    tokenNumber: number;
    cashfreeSessionId: string;
    expiresAt: string;
    totalAmount: number;
  }) => void;

  clearActiveOrder: () => void;
}

export const useOrderStore = create<OrderState>()((set) => ({
  activeOrderId: null,
  tokenNumber: null,
  cashfreeSessionId: null,
  expiresAt: null,
  totalAmount: null,

  setActiveOrder: (data) => {
    set({
      activeOrderId: data.orderId,
      tokenNumber: data.tokenNumber,
      cashfreeSessionId: data.cashfreeSessionId,
      expiresAt: data.expiresAt,
      totalAmount: data.totalAmount,
    });
  },

  clearActiveOrder: () => {
    set({
      activeOrderId: null,
      tokenNumber: null,
      cashfreeSessionId: null,
      expiresAt: null,
      totalAmount: null,
    });
  },
}));
