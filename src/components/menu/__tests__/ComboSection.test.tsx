/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import ComboSection from '../ComboSection';
import type { MenuItemData } from '@/types';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock FoodCard component
jest.mock('../FoodCard', () => {
  return function MockFoodCard({ item }: { item: MenuItemData }) {
    return <div data-testid={`food-card-${item.id}`}>{item.name}</div>;
  };
});

// Mock cart store
jest.mock('@/store/cartStore', () => ({
  useCartStore: jest.fn(() => ({
    addItem: jest.fn(),
    updateQuantity: jest.fn(),
    getItemQuantity: jest.fn(() => 0),
  })),
}));

describe('ComboSection', () => {
  const mockComboItems: MenuItemData[] = [
    {
      id: 'combo-1',
      name: 'Breakfast Combo',
      section: 'SNACK',
      category: 'Combo',
      price: 80,
      imageUrl: null,
      etaMinutes: 0,
      isCombo: true,
      isPriorityOnly: false,
      isAvailable: true,
    },
    {
      id: 'combo-2',
      name: 'Lunch Special',
      section: 'COOK_TO_ORDER',
      category: 'Combo',
      price: 120,
      imageUrl: null,
      etaMinutes: 15,
      isCombo: true,
      isPriorityOnly: false,
      isAvailable: true,
    },
    {
      id: 'combo-3',
      name: 'Snack Pack',
      section: 'SNACK',
      category: 'Combo',
      price: 60,
      imageUrl: null,
      etaMinutes: 0,
      isCombo: true,
      isPriorityOnly: false,
      isAvailable: true,
    },
  ];

  it('should render combo section when visible with items', () => {
    render(<ComboSection items={mockComboItems} isVisible={true} />);

    // Check for section header
    expect(screen.getByText('🎁 COMBOS')).toBeInTheDocument();
    expect(screen.getByText('Save more!')).toBeInTheDocument();

    // Check that all combo items are rendered
    expect(screen.getByTestId('food-card-combo-1')).toBeInTheDocument();
    expect(screen.getByTestId('food-card-combo-2')).toBeInTheDocument();
    expect(screen.getByTestId('food-card-combo-3')).toBeInTheDocument();
  });

  it('should not render when isVisible is false', () => {
    render(<ComboSection items={mockComboItems} isVisible={false} />);

    // Section should not be rendered
    expect(screen.queryByText('🎁 COMBOS')).not.toBeInTheDocument();
    expect(screen.queryByText('Save more!')).not.toBeInTheDocument();
  });

  it('should not render when items array is empty', () => {
    render(<ComboSection items={[]} isVisible={true} />);

    // Section should not be rendered
    expect(screen.queryByText('🎁 COMBOS')).not.toBeInTheDocument();
    expect(screen.queryByText('Save more!')).not.toBeInTheDocument();
  });

  it('should render single combo item', () => {
    const singleItem = [mockComboItems[0]];
    render(<ComboSection items={singleItem} isVisible={true} />);

    expect(screen.getByText('🎁 COMBOS')).toBeInTheDocument();
    expect(screen.getByTestId('food-card-combo-1')).toBeInTheDocument();
    expect(screen.queryByTestId('food-card-combo-2')).not.toBeInTheDocument();
  });

  it('should apply correct styling classes for horizontal scroll', () => {
    const { container } = render(<ComboSection items={mockComboItems} isVisible={true} />);

    // Find the scrollable container
    const scrollContainer = container.querySelector('.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();
    expect(scrollContainer).toHaveClass('no-scrollbar');
  });

  it('should render combo cards with fixed 200px width', () => {
    const { container } = render(<ComboSection items={mockComboItems} isVisible={true} />);

    // Check that cards have the correct width classes
    const cardWrappers = container.querySelectorAll('.min-w-\\[200px\\]');
    expect(cardWrappers).toHaveLength(mockComboItems.length);
  });

  it('should display section badge with correct styling', () => {
    render(<ComboSection items={mockComboItems} isVisible={true} />);

    const badge = screen.getByText('🎁 COMBOS');
    expect(badge).toHaveClass('section-badge-combo');
  });

  it('should handle items with different properties', () => {
    const mixedItems: MenuItemData[] = [
      {
        id: 'combo-priority',
        name: 'Premium Combo',
        section: 'COOK_TO_ORDER',
        category: 'Combo',
        price: 150,
        imageUrl: 'https://example.com/image.jpg',
        etaMinutes: 20,
        isCombo: true,
        isPriorityOnly: true,
        isAvailable: true,
      },
      {
        id: 'combo-unavailable',
        name: 'Sold Out Combo',
        section: 'SNACK',
        category: 'Combo',
        price: 90,
        imageUrl: null,
        etaMinutes: 0,
        isCombo: true,
        isPriorityOnly: false,
        isAvailable: false,
      },
    ];

    render(<ComboSection items={mixedItems} isVisible={true} />);

    expect(screen.getByTestId('food-card-combo-priority')).toBeInTheDocument();
    expect(screen.getByTestId('food-card-combo-unavailable')).toBeInTheDocument();
  });
});
