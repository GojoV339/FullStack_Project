/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import CartItem from '../CartItem';
import { useCartStore } from '@/store/cartStore';
import type { CartItem as CartItemType } from '@/types';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

// Mock cart store
jest.mock('@/store/cartStore', () => ({
  useCartStore: jest.fn(),
}));

const mockUpdateQuantity = jest.fn();

const mockCartItem: CartItemType = {
  menuItem: {
    id: 'item-1',
    name: 'Masala Dosa',
    section: 'COOK_TO_ORDER',
    category: 'South Indian',
    price: 50,
    imageUrl: null,
    etaMinutes: 10,
    isCombo: false,
    isPriorityOnly: false,
    isAvailable: true,
  },
  quantity: 2,
};

describe('CartItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCartStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ updateQuantity: mockUpdateQuantity })
    );
  });

  it('should render item name, price, and quantity', () => {
    render(<CartItem item={mockCartItem} />);

    expect(screen.getByText('Masala Dosa')).toBeInTheDocument();
    expect(screen.getByText('₹50')).toBeInTheDocument();
    // Quantity appears twice (in breakdown and in controls), so use getAllByText
    const quantityElements = screen.getAllByText('2');
    expect(quantityElements.length).toBeGreaterThanOrEqual(1);
  });

  it('should display correct subtotal', () => {
    render(<CartItem item={mockCartItem} />);

    // Subtotal should be price * quantity = 50 * 2 = 100
    expect(screen.getByText('₹100')).toBeInTheDocument();
  });

  it('should call updateQuantity with decremented value when minus button is clicked', () => {
    render(<CartItem item={mockCartItem} />);

    const decrementButton = screen.getByLabelText('Decrease quantity');
    fireEvent.click(decrementButton);

    expect(mockUpdateQuantity).toHaveBeenCalledWith('item-1', 1);
  });

  it('should call updateQuantity with incremented value when plus button is clicked', () => {
    render(<CartItem item={mockCartItem} />);

    const incrementButton = screen.getByLabelText('Increase quantity');
    fireEvent.click(incrementButton);

    expect(mockUpdateQuantity).toHaveBeenCalledWith('item-1', 3);
  });

  it('should remove item when quantity is decremented to 0', () => {
    const singleItemCart: CartItemType = {
      ...mockCartItem,
      quantity: 1,
    };

    render(<CartItem item={singleItemCart} />);

    const decrementButton = screen.getByLabelText('Decrease quantity');
    fireEvent.click(decrementButton);

    // updateQuantity with 0 should trigger removeItem in the store
    expect(mockUpdateQuantity).toHaveBeenCalledWith('item-1', 0);
  });

  it('should display unit price and quantity breakdown', () => {
    render(<CartItem item={mockCartItem} />);

    // Check for the breakdown display
    expect(screen.getByText('₹50')).toBeInTheDocument(); // unit price
    expect(screen.getByText('×')).toBeInTheDocument(); // multiplication symbol
    // Quantity appears twice (in breakdown and in controls)
    const quantityElements = screen.getAllByText('2');
    expect(quantityElements.length).toBe(2); // once in breakdown, once in controls
  });

  it('should handle items with different prices correctly', () => {
    const expensiveItem: CartItemType = {
      menuItem: {
        ...mockCartItem.menuItem,
        name: 'Special Thali',
        price: 120,
      },
      quantity: 3,
    };

    render(<CartItem item={expensiveItem} />);

    expect(screen.getByText('Special Thali')).toBeInTheDocument();
    expect(screen.getByText('₹120')).toBeInTheDocument();
    expect(screen.getByText('₹360')).toBeInTheDocument(); // 120 * 3
  });
});
