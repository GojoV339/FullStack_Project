/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Header from '../Header';
import { useCartStore } from '@/store/cartStore';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/menu'),
}));

// Mock cart store
jest.mock('@/store/cartStore', () => ({
  useCartStore: jest.fn(),
}));

describe('Header', () => {
  const mockRouter = {
    back: jest.fn(),
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useCartStore as unknown as jest.Mock).mockReturnValue(0);
  });

  it('renders title when provided', () => {
    render(<Header title="Test Page" />);
    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  it('renders back button by default', () => {
    render(<Header title="Test Page" />);
    const backButton = screen.getByLabelText('Go back');
    expect(backButton).toBeInTheDocument();
  });

  it('calls router.back when back button is clicked', () => {
    render(<Header title="Test Page" />);
    const backButton = screen.getByLabelText('Go back');
    fireEvent.click(backButton);
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it('hides back button when showBack is false', () => {
    render(<Header title="Test Page" showBack={false} />);
    const backButton = screen.queryByLabelText('Go back');
    expect(backButton).not.toBeInTheDocument();
  });

  it('renders search bar when showSearch is true', () => {
    render(<Header title="Menu" showSearch />);
    const searchInput = screen.getByPlaceholderText('Search menu...');
    expect(searchInput).toBeInTheDocument();
  });

  it('calls onSearchChange when search input changes', () => {
    const handleSearchChange = jest.fn();
    render(
      <Header
        title="Menu"
        showSearch
        searchQuery=""
        onSearchChange={handleSearchChange}
      />
    );
    const searchInput = screen.getByPlaceholderText('Search menu...');
    fireEvent.change(searchInput, { target: { value: 'pizza' } });
    expect(handleSearchChange).toHaveBeenCalledWith('pizza');
  });

  it('renders cart button when showCart is true and cart has items', () => {
    (useCartStore as unknown as jest.Mock).mockReturnValue(3);
    render(<Header title="Menu" showCart />);
    const cartButton = screen.getByLabelText('Cart with 3 items');
    expect(cartButton).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not render cart button when cart is empty', () => {
    (useCartStore as unknown as jest.Mock).mockReturnValue(0);
    render(<Header title="Menu" showCart />);
    const cartButton = screen.queryByLabelText(/Cart with/);
    expect(cartButton).not.toBeInTheDocument();
  });

  it('calls onCartClick when cart button is clicked', () => {
    (useCartStore as unknown as jest.Mock).mockReturnValue(2);
    const handleCartClick = jest.fn();
    render(<Header title="Menu" showCart onCartClick={handleCartClick} />);
    const cartButton = screen.getByLabelText('Cart with 2 items');
    fireEvent.click(cartButton);
    expect(handleCartClick).toHaveBeenCalledTimes(1);
  });

  it('applies glassmorphism and safe area styles', () => {
    const { container } = render(<Header title="Test" />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('glass', 'safe-top');
  });
});
