/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useAuthStore } from '@/store/authStore';
import PriorityPassSection from '../PriorityPassSection';
import type { MenuItemData } from '@/types';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock FoodCard component
jest.mock('../FoodCard', () => {
  return function MockFoodCard({ item, isLocked }: any) {
    return (
      <div data-testid={`food-card-${item.id}`} data-locked={isLocked}>
        {item.name}
      </div>
    );
  };
});

// Mock auth store
jest.mock('@/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as unknown as jest.Mock;

const mockPriorityItems: MenuItemData[] = [
  {
    id: 'priority-1',
    name: 'Premium Biryani',
    section: 'COOK_TO_ORDER',
    category: 'Rice',
    price: 150,
    imageUrl: null,
    etaMinutes: 15,
    isCombo: false,
    isPriorityOnly: true,
    isAvailable: true,
  },
  {
    id: 'priority-2',
    name: 'Special Thali',
    section: 'COOK_TO_ORDER',
    category: 'North Indian',
    price: 180,
    imageUrl: null,
    etaMinutes: 20,
    isCombo: false,
    isPriorityOnly: true,
    isAvailable: true,
  },
];

describe('PriorityPassSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isVisible is false', () => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        student: {
          id: 'student-1',
          registrationNumber: 'AM.EN.U4CSE21001',
          name: 'Test Student',
          phone: null,
          subscriptionStatus: 'ACTIVE' as const,
          subscriptionExpiry: null,
        },
      })
    );

    const { container } = render(
      <PriorityPassSection items={mockPriorityItems} isVisible={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render when items array is empty', () => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        student: {
          id: 'student-1',
          registrationNumber: 'AM.EN.U4CSE21001',
          name: 'Test Student',
          phone: null,
          subscriptionStatus: 'ACTIVE' as const,
          subscriptionExpiry: null,
        },
      })
    );

    const { container } = render(
      <PriorityPassSection items={[]} isVisible={true} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should display gold gradient badge with star emoji', () => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        student: {
          id: 'student-1',
          registrationNumber: 'AM.EN.U4CSE21001',
          name: 'Test Student',
          phone: null,
          subscriptionStatus: 'ACTIVE' as const,
          subscriptionExpiry: null,
        },
      })
    );

    render(<PriorityPassSection items={mockPriorityItems} isVisible={true} />);

    const badge = screen.getByText(/⭐ PRIORITY PASS/);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('gradient-gold');
  });

  it('should render items without blur when subscription is ACTIVE', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    const mockStudent = {
      id: 'student-1',
      registrationNumber: 'AM.EN.U4CSE21001',
      name: 'Test Student',
      phone: null,
      subscriptionStatus: 'ACTIVE' as const,
      subscriptionExpiry: futureDate.toISOString(),
    };
    
    mockUseAuthStore.mockImplementation((selector) =>
      selector({ student: mockStudent })
    );

    const { container } = render(<PriorityPassSection items={mockPriorityItems} isVisible={true} />);
    
    // Debug: log the HTML
    // console.log(container.innerHTML);

    const grid = screen.getByText('Premium Biryani').closest('.grid');
    expect(grid).not.toHaveClass('blur-sm');
    expect(grid).not.toHaveClass('pointer-events-none');

    // Items should not be locked
    const foodCard1 = screen.getByTestId('food-card-priority-1');
    const foodCard2 = screen.getByTestId('food-card-priority-2');
    expect(foodCard1).toHaveAttribute('data-locked', 'false');
    expect(foodCard2).toHaveAttribute('data-locked', 'false');
  });

  it('should render items with blur when subscription is INACTIVE', () => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        student: {
          id: 'student-1',
          registrationNumber: 'AM.EN.U4CSE21001',
          name: 'Test Student',
          phone: null,
          subscriptionStatus: 'INACTIVE' as const,
          subscriptionExpiry: null,
        },
      })
    );

    render(<PriorityPassSection items={mockPriorityItems} isVisible={true} />);

    const grid = screen.getByText('Premium Biryani').closest('.grid');
    expect(grid).toHaveClass('blur-sm');
    expect(grid).toHaveClass('pointer-events-none');

    // Items should be locked
    const foodCard1 = screen.getByTestId('food-card-priority-1');
    const foodCard2 = screen.getByTestId('food-card-priority-2');
    expect(foodCard1).toHaveAttribute('data-locked', 'true');
    expect(foodCard2).toHaveAttribute('data-locked', 'true');
  });

  it('should display subscription prompt when subscription is INACTIVE', () => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        student: {
          id: 'student-1',
          registrationNumber: 'AM.EN.U4CSE21001',
          name: 'Test Student',
          phone: null,
          subscriptionStatus: 'INACTIVE' as const,
          subscriptionExpiry: null,
        },
      })
    );

    render(<PriorityPassSection items={mockPriorityItems} isVisible={true} />);

    expect(
      screen.getByText('Get Priority Pass to unlock exclusive menu items')
    ).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  it('should not display subscription prompt when subscription is ACTIVE', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        student: {
          id: 'student-1',
          registrationNumber: 'AM.EN.U4CSE21001',
          name: 'Test Student',
          phone: null,
          subscriptionStatus: 'ACTIVE' as const,
          subscriptionExpiry: futureDate.toISOString(),
        },
      })
    );

    render(<PriorityPassSection items={mockPriorityItems} isVisible={true} />);

    expect(
      screen.queryByText('Get Priority Pass to unlock exclusive menu items')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Learn More')).not.toBeInTheDocument();
  });

  it('should display "Exclusive items" text when subscription is INACTIVE', () => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        student: {
          id: 'student-1',
          registrationNumber: 'AM.EN.U4CSE21001',
          name: 'Test Student',
          phone: null,
          subscriptionStatus: 'INACTIVE' as const,
          subscriptionExpiry: null,
        },
      })
    );

    render(<PriorityPassSection items={mockPriorityItems} isVisible={true} />);

    expect(screen.getByText('Exclusive items')).toBeInTheDocument();
  });

  it('should render all priority items in a 2-column grid', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        student: {
          id: 'student-1',
          registrationNumber: 'AM.EN.U4CSE21001',
          name: 'Test Student',
          phone: null,
          subscriptionStatus: 'ACTIVE' as const,
          subscriptionExpiry: futureDate.toISOString(),
        },
      })
    );

    render(<PriorityPassSection items={mockPriorityItems} isVisible={true} />);

    const grid = screen.getByText('Premium Biryani').closest('.grid');
    expect(grid).toHaveClass('grid-cols-2');

    expect(screen.getByTestId('food-card-priority-1')).toBeInTheDocument();
    expect(screen.getByTestId('food-card-priority-2')).toBeInTheDocument();
  });

  it('should handle null student gracefully', () => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({ student: null })
    );

    render(<PriorityPassSection items={mockPriorityItems} isVisible={true} />);

    // Should treat as inactive subscription
    const grid = screen.getByText('Premium Biryani').closest('.grid');
    expect(grid).toHaveClass('blur-sm');
    expect(
      screen.getByText('Get Priority Pass to unlock exclusive menu items')
    ).toBeInTheDocument();
  });

  it('should treat expired subscription as inactive', () => {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        student: {
          id: 'student-1',
          registrationNumber: 'AM.EN.U4CSE21001',
          name: 'Test Student',
          phone: null,
          subscriptionStatus: 'ACTIVE' as const,
          subscriptionExpiry: pastDate.toISOString(),
        },
      })
    );

    render(<PriorityPassSection items={mockPriorityItems} isVisible={true} />);

    // Should treat as inactive subscription even though status is ACTIVE
    const grid = screen.getByText('Premium Biryani').closest('.grid');
    expect(grid).toHaveClass('blur-sm');
    expect(
      screen.getByText('Get Priority Pass to unlock exclusive menu items')
    ).toBeInTheDocument();
  });
});
