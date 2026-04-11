/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import CheckoutSummary from '../CheckoutSummary';
import { useCartStore } from '@/store/cartStore';
import type { MenuItemData } from '@/types';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

// Mock cart store
jest.mock('@/store/cartStore', () => ({
  useCartStore: jest.fn(),
}));

const mockMenuItem1: MenuItemData = {
  id: 'item-1',
  name: 'Masala Dosa',
  section: 'COOK_TO_ORDER',
  category: 'South Indian',
  price: 50,
  imageUrl: null,
  etaMinutes: 15,
  isCombo: false,
  isPriorityOnly: false,
  isAvailable: true,
};

const mockMenuItem2: MenuItemData = {
  id: 'item-2',
  name: 'Coffee',
  section: 'SNACK',
  category: 'Beverages',
  price: 20,
  imageUrl: null,
  etaMinutes: 0,
  isCombo: false,
  isPriorityOnly: false,
  isAvailable: true,
};

describe('CheckoutSummary', () => {
  const mockOnProceedToPayment = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render order summary with items', () => {
    (useCartStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        items: [
          { menuItem: mockMenuItem1, quantity: 2 },
          { menuItem: mockMenuItem2, quantity: 1 },
        ],
        cafeteriaName: 'Samridhi',
        getTotal: () => 120,
      })
    );

    render(
      <CheckoutSummary onProceedToPayment={mockOnProceedToPayment} />
    );

    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Masala Dosa')).toBeInTheDocument();
    expect(screen.getByText('Coffee')).toBeInTheDocument();
    expect(screen.getByText('₹120')).toBeInTheDocument();
  });

  it('should display cafeteria name', () => {
    (useCartStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        items: [{ menuItem: mockMenuItem1, quantity: 1 }],
        cafeteriaName: 'Samridhi',
        getTotal: () => 50,
      })
    );

    render(
      <CheckoutSummary onProceedToPayment={mockOnProceedToPayment} />
    );

    expect(screen.getByText('Cafeteria')).toBeInTheDocument();
    expect(screen.getByText('Samridhi')).toBeInTheDocument();
  });

  it('should display order number when provided', () => {
    (useCartStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        items: [{ menuItem: mockMenuItem1, quantity: 1 }],
        cafeteriaName: 'Samridhi',
        getTotal: () => 50,
      })
    );

    render(
      <CheckoutSummary
        orderNumber="AF-2024-0001"
        onProceedToPayment={mockOnProceedToPayment}
      />
    );

    expect(screen.getByText('Order #AF-2024-0001')).toBeInTheDocument();
  });

  it('should calculate item count correctly', () => {
    (useCartStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        items: [
          { menuItem: mockMenuItem1, quantity: 2 },
          { menuItem: mockMenuItem2, quantity: 3 },
        ],
        cafeteriaName: 'Samridhi',
        getTotal: () => 160,
      })
    );

    render(
      <CheckoutSummary onProceedToPayment={mockOnProceedToPayment} />
    );

    expect(screen.getByText('Items (5)')).toBeInTheDocument();
  });

  it('should display item quantities and subtotals', () => {
    (useCartStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        items: [{ menuItem: mockMenuItem1, quantity: 2 }],
        cafeteriaName: 'Samridhi',
        getTotal: () => 100,
      })
    );

    render(
      <CheckoutSummary onProceedToPayment={mockOnProceedToPayment} />
    );

    expect(screen.getByText('₹50')).toBeInTheDocument(); // Unit price
    expect(screen.getByText('2')).toBeInTheDocument(); // Quantity
    // ₹100 appears twice (subtotal and total), so use getAllByText
    const priceElements = screen.getAllByText('₹100');
    expect(priceElements.length).toBeGreaterThanOrEqual(1);
  });

  it('should call onProceedToPayment when button is clicked', () => {
    (useCartStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        items: [{ menuItem: mockMenuItem1, quantity: 1 }],
        cafeteriaName: 'Samridhi',
        getTotal: () => 50,
      })
    );

    render(
      <CheckoutSummary onProceedToPayment={mockOnProceedToPayment} />
    );

    const button = screen.getByText('Proceed to Payment');
    fireEvent.click(button);

    expect(mockOnProceedToPayment).toHaveBeenCalledTimes(1);
  });

  it('should display total amount correctly', () => {
    (useCartStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        items: [
          { menuItem: mockMenuItem1, quantity: 2 },
          { menuItem: mockMenuItem2, quantity: 1 },
        ],
        cafeteriaName: 'Samridhi',
        getTotal: () => 120,
      })
    );

    render(
      <CheckoutSummary onProceedToPayment={mockOnProceedToPayment} />
    );

    expect(screen.getByText('Total Amount')).toBeInTheDocument();
    expect(screen.getByText('₹120')).toBeInTheDocument();
  });

  it('should render without order number', () => {
    (useCartStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        items: [{ menuItem: mockMenuItem1, quantity: 1 }],
        cafeteriaName: 'Samridhi',
        getTotal: () => 50,
      })
    );

    render(
      <CheckoutSummary onProceedToPayment={mockOnProceedToPayment} />
    );

    expect(screen.queryByText(/Order #/)).not.toBeInTheDocument();
  });

  it('should render without cafeteria name', () => {
    (useCartStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        items: [{ menuItem: mockMenuItem1, quantity: 1 }],
        cafeteriaName: null,
        getTotal: () => 50,
      })
    );

    render(
      <CheckoutSummary onProceedToPayment={mockOnProceedToPayment} />
    );

    expect(screen.queryByText('Cafeteria')).not.toBeInTheDocument();
  });
});
