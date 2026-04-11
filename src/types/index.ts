export interface StudentProfile {
  id: string;
  registrationNumber: string;
  name: string | null;
  phone: string | null;
  subscriptionStatus: 'ACTIVE' | 'INACTIVE';
  subscriptionExpiry: string | null;
}

export interface CafeteriaInfo {
  id: string;
  name: string;
  location: string;
  isOpen: boolean;
  avgWaitMinutes: number;
}

export interface MenuItemData {
  id: string;
  name: string;
  section: 'SNACK' | 'COOK_TO_ORDER';
  category: string;
  price: number;
  imageUrl: string | null;
  etaMinutes: number;
  isCombo: boolean;
  isPriorityOnly: boolean;
  isAvailable: boolean;
}

export interface CartItem {
  menuItem: MenuItemData;
  quantity: number;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  tokenNumber: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  orderStatus: 'AWAITING_PAYMENT' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COLLECTED' | 'CANCELLED';
  expiresAt: string;
  createdAt: string;
  cafeteria: CafeteriaInfo;
  items: OrderItemData[];
}

export interface OrderItemData {
  id: string;
  menuItem: {
    name: string;
    imageUrl: string | null;
  };
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderResponse {
  orderId: string;
  cashfreeSessionId: string;
  expiresAt: string;
  tokenNumber: number;
  totalAmount: number;
}
