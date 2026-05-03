/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import MenuTabs from '../MenuTabs';
import type { MenuItemData } from '@/types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

const mockSnackItem: MenuItemData = {
  id: '1',
  name: 'Samosa',
  section: 'SNACK',
  category: 'Snacks',
  price: 20,
  imageUrl: null,
  etaMinutes: 0,
  isCombo: false,
  isPriorityOnly: false,
  isAvailable: true,
};

const mockCookToOrderItem: MenuItemData = {
  id: '2',
  name: 'Dosa',
  section: 'COOK_TO_ORDER',
  category: 'South Indian',
  price: 50,
  imageUrl: null,
  etaMinutes: 15,
  isCombo: false,
  isPriorityOnly: false,
  isAvailable: true,
};

describe('MenuTabs', () => {
  const mockOnTabChange = jest.fn();

  beforeEach(() => {
    mockOnTabChange.mockClear();
  });

  it('should render both tabs with correct labels', () => {
    render(
      <MenuTabs
        activeTab="SNACK"
        onTabChange={mockOnTabChange}
        items={[mockSnackItem, mockCookToOrderItem]}
      />
    );

    expect(screen.getByText('Ready Now')).toBeInTheDocument();
    expect(screen.getByText('Cook to Order')).toBeInTheDocument();
  });

  it('should display correct item counts for each tab', () => {
    const items = [
      mockSnackItem,
      { ...mockSnackItem, id: '3' },
      mockCookToOrderItem,
    ];

    render(
      <MenuTabs
        activeTab="SNACK"
        onTabChange={mockOnTabChange}
        items={items}
      />
    );

    // Should show 2 snack items and 1 cook-to-order item
    const badges = screen.getAllByText(/\d+/);
    expect(badges[0]).toHaveTextContent('2');
    expect(badges[1]).toHaveTextContent('1');
  });

  it('should call onTabChange when clicking a tab', () => {
    render(
      <MenuTabs
        activeTab="SNACK"
        onTabChange={mockOnTabChange}
        items={[mockSnackItem, mockCookToOrderItem]}
      />
    );

    const cookToOrderTab = screen.getByText('Cook to Order');
    fireEvent.click(cookToOrderTab);

    expect(mockOnTabChange).toHaveBeenCalledWith('COOK_TO_ORDER');
    expect(mockOnTabChange).toHaveBeenCalledTimes(1);
  });

  it('should highlight the active tab', () => {
    const { rerender } = render(
      <MenuTabs
        activeTab="SNACK"
        onTabChange={mockOnTabChange}
        items={[mockSnackItem, mockCookToOrderItem]}
      />
    );

    const readyNowButton = screen.getByText('Ready Now').closest('button');
    const cookToOrderButton = screen.getByText('Cook to Order').closest('button');

    // Check active tab has white text
    expect(readyNowButton?.querySelector('span[class*="text-[#2D2D2D]"]')).toBeInTheDocument();

    // Switch to Cook to Order tab
    rerender(
      <MenuTabs
        activeTab="COOK_TO_ORDER"
        onTabChange={mockOnTabChange}
        items={[mockSnackItem, mockCookToOrderItem]}
      />
    );

    expect(cookToOrderButton?.querySelector('span[class*="text-[#2D2D2D]"]')).toBeInTheDocument();
  });

  it('should not display count badge when count is 0', () => {
    render(
      <MenuTabs
        activeTab="SNACK"
        onTabChange={mockOnTabChange}
        items={[mockSnackItem]}
      />
    );

    // Only one badge should be visible (for SNACK with count 1)
    const badges = screen.queryAllByText(/\d+/);
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveTextContent('1');
  });

  it('should display emojis for each tab', () => {
    render(
      <MenuTabs
        activeTab="SNACK"
        onTabChange={mockOnTabChange}
        items={[mockSnackItem, mockCookToOrderItem]}
      />
    );

    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('🍳')).toBeInTheDocument();
  });

  it('should handle empty items array', () => {
    render(
      <MenuTabs
        activeTab="SNACK"
        onTabChange={mockOnTabChange}
        items={[]}
      />
    );

    expect(screen.getByText('Ready Now')).toBeInTheDocument();
    expect(screen.getByText('Cook to Order')).toBeInTheDocument();
    
    // No count badges should be visible
    const badges = screen.queryAllByText(/\d+/);
    expect(badges).toHaveLength(0);
  });
});
