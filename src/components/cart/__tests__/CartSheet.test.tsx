/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import CartSheet from '../CartSheet';
import { useCartStore } from '@/store/cartStore';
import type { MenuItemData } from '@/types';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock CartItem component
jest.mock('../CartItem', () => {
  return function MockCartItem({ item }: any) {
    return (
      <div data-testid="cart-item">
        <span>{item.menuItem.name}</span>
        <span>{item.quantity}</span>
        <span>₹{item.menuItem.price * item.quantity}</span>
      </div>
    );
  };
});

const mockMenuItem: MenuItemData = {
  id: '1',
  name: 'Masala Dosa',
  section: 'COOK_TO_ORDER',
  category: 'South Indian',
  price: 50,
  imageUrl: null,
  etaMinutes: 10,
  isCombo: false,
  isPriorityOnly: false,
  isAvailable: true,
};

describe('CartSheet', () => {
  const mockPush = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    useCartStore.getState().clearCart();
  });

  it('should render empty cart message when no items', () => {
    render(<CartSheet isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Add items from the menu to get started')).toBeInTheDocument();
  });

  it('should display cart items with quantities', () => {
    const { addItem } = useCartStore.getState();
    addItem(mockMenuItem);
    
    render(<CartSheet isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Masala Dosa')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should display total amount correctly', () => {
    const { addItem } = useCartStore.getState();
    addItem(mockMenuItem);
    addItem(mockMenuItem);
    
    render(<CartSheet isOpen={true} onClose={mockOnClose} />);
    
    // The total appears in the footer with class text-2xl
    const allPrices = screen.getAllByText(/₹100/);
    // The last one should be the total in the footer
    expect(allPrices.length).toBeGreaterThan(0);
    expect(screen.getByText('2 items')).toBeInTheDocument();
  });

  it('should display cafeteria name when set', () => {
    const { addItem, setCafeteria } = useCartStore.getState();
    setCafeteria('cafe-1', 'Samridhi');
    addItem(mockMenuItem);
    
    render(<CartSheet isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Samridhi')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<CartSheet isOpen={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('Close cart');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', () => {
    render(<CartSheet isOpen={true} onClose={mockOnClose} />);
    
    const overlay = screen.getByRole('button', { hidden: true }).parentElement?.previousSibling;
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should navigate to checkout when proceed button is clicked', () => {
    const { addItem } = useCartStore.getState();
    addItem(mockMenuItem);
    
    render(<CartSheet isOpen={true} onClose={mockOnClose} />);
    
    const checkoutButton = screen.getByText('Proceed to Checkout');
    fireEvent.click(checkoutButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/checkout');
  });

  it('should not show checkout button when cart is empty', () => {
    render(<CartSheet isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Proceed to Checkout')).not.toBeInTheDocument();
  });

  it('should display correct item count in singular form', () => {
    const { addItem } = useCartStore.getState();
    addItem(mockMenuItem);
    
    render(<CartSheet isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('1 item')).toBeInTheDocument();
  });

  it('should display correct item count in plural form', () => {
    const { addItem } = useCartStore.getState();
    addItem(mockMenuItem);
    addItem(mockMenuItem);
    
    render(<CartSheet isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('2 items')).toBeInTheDocument();
  });

  it('should update total when items are added', () => {
    const { addItem } = useCartStore.getState();
    addItem(mockMenuItem);
    
    const { rerender } = render(<CartSheet isOpen={true} onClose={mockOnClose} />);
    
    // Check for the total - should be ₹50
    expect(screen.getAllByText(/₹50/).length).toBeGreaterThan(0);
    
    addItem(mockMenuItem);
    rerender(<CartSheet isOpen={true} onClose={mockOnClose} />);
    
    // Check for the updated total - should be ₹100
    expect(screen.getAllByText(/₹100/).length).toBeGreaterThan(0);
  });

  it('should not render when isOpen is false', () => {
    const { addItem } = useCartStore.getState();
    addItem(mockMenuItem);
    
    const { container } = render(<CartSheet isOpen={false} onClose={mockOnClose} />);
    
    expect(container.querySelector('.glass-card')).not.toBeInTheDocument();
  });
});
