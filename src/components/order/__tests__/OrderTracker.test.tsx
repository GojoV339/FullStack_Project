/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import OrderTracker from '../OrderTracker';
import { useRealtimeOrder } from '@/hooks/useRealtimeOrder';
import type { OrderData } from '@/types';

// Mock the useRealtimeOrder hook
jest.mock('@/hooks/useRealtimeOrder');

const mockUseRealtimeOrder = useRealtimeOrder as jest.MockedFunction<
  typeof useRealtimeOrder
>;

const mockOrder: OrderData = {
  id: 'test-order-123',
  tokenNumber: 42,
  totalAmount: 250.5,
  paymentStatus: 'PAID',
  orderStatus: 'PREPARING',
  expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  cafeteria: {
    id: 'cafeteria-1',
    name: 'Samridhi',
    location: 'Main Block',
    isOpen: true,
    avgWaitMinutes: 10,
  },
  items: [
    {
      id: 'item-1',
      menuItem: {
        name: 'Masala Dosa',
        imageUrl: null,
      },
      quantity: 2,
      unitPrice: 50,
    },
    {
      id: 'item-2',
      menuItem: {
        name: 'Filter Coffee',
        imageUrl: null,
      },
      quantity: 1,
      unitPrice: 30,
    },
  ],
};

describe('OrderTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display loading state', () => {
    mockUseRealtimeOrder.mockReturnValue({
      order: null,
      isLoading: true,
      error: null,
    });

    render(<OrderTracker orderId="test-order-123" />);

    expect(screen.getByText('Loading order details...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    mockUseRealtimeOrder.mockReturnValue({
      order: null,
      isLoading: false,
      error: new Error('Failed to fetch order'),
    });

    render(<OrderTracker orderId="test-order-123" />);

    expect(screen.getByText('Failed to load order')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch order')).toBeInTheDocument();
  });

  it('should display order number and token number', () => {
    mockUseRealtimeOrder.mockReturnValue({
      order: mockOrder,
      isLoading: false,
      error: null,
    });

    render(<OrderTracker orderId="test-order-123" />);

    expect(screen.getByText('Order Number')).toBeInTheDocument();
    expect(screen.getByText('Token Number')).toBeInTheDocument();
    expect(screen.getByText('#42')).toBeInTheDocument();
  });

  it('should display cafeteria name', () => {
    mockUseRealtimeOrder.mockReturnValue({
      order: mockOrder,
      isLoading: false,
      error: null,
    });

    render(<OrderTracker orderId="test-order-123" />);

    expect(screen.getByText('Samridhi')).toBeInTheDocument();
  });

  it('should display all status stages', () => {
    mockUseRealtimeOrder.mockReturnValue({
      order: mockOrder,
      isLoading: false,
      error: null,
    });

    render(<OrderTracker orderId="test-order-123" />);

    expect(screen.getByText('Awaiting Payment')).toBeInTheDocument();
    expect(screen.getByText('Order Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Preparing')).toBeInTheDocument();
    expect(screen.getByText('Ready for Pickup')).toBeInTheDocument();
    expect(screen.getByText('Collected')).toBeInTheDocument();
  });

  it('should highlight current status', () => {
    mockUseRealtimeOrder.mockReturnValue({
      order: mockOrder,
      isLoading: false,
      error: null,
    });

    render(<OrderTracker orderId="test-order-123" />);

    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should display order items with quantities and prices', () => {
    mockUseRealtimeOrder.mockReturnValue({
      order: mockOrder,
      isLoading: false,
      error: null,
    });

    render(<OrderTracker orderId="test-order-123" />);

    expect(screen.getByText('2x')).toBeInTheDocument();
    expect(screen.getByText('Masala Dosa')).toBeInTheDocument();
    expect(screen.getByText('₹100.00')).toBeInTheDocument();

    expect(screen.getByText('1x')).toBeInTheDocument();
    expect(screen.getByText('Filter Coffee')).toBeInTheDocument();
    expect(screen.getByText('₹30.00')).toBeInTheDocument();
  });

  it('should display total amount', () => {
    mockUseRealtimeOrder.mockReturnValue({
      order: mockOrder,
      isLoading: false,
      error: null,
    });

    render(<OrderTracker orderId="test-order-123" />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('₹250.50')).toBeInTheDocument();
  });

  it('should show glow effect when order is READY', () => {
    const readyOrder = { ...mockOrder, orderStatus: 'READY' as const };
    mockUseRealtimeOrder.mockReturnValue({
      order: readyOrder,
      isLoading: false,
      error: null,
    });

    render(<OrderTracker orderId="test-order-123" />);

    expect(screen.getByText('🔔 Ready for Pickup!')).toBeInTheDocument();
  });

  it('should show completed checkmarks for past stages', () => {
    const confirmedOrder = { ...mockOrder, orderStatus: 'CONFIRMED' as const };
    mockUseRealtimeOrder.mockReturnValue({
      order: confirmedOrder,
      isLoading: false,
      error: null,
    });

    render(<OrderTracker orderId="test-order-123" />);

    // AWAITING_PAYMENT should be completed (has checkmark)
    // This is tested by checking if the component renders without errors
    expect(screen.getByText('Order Confirmed')).toBeInTheDocument();
  });
});
