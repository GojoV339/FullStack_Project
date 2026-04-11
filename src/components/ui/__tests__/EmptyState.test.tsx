/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { ShoppingBag } from 'lucide-react';
import EmptyState from '../EmptyState';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

describe('EmptyState', () => {
  it('renders with icon, title, and message', () => {
    render(
      <EmptyState
        icon={ShoppingBag}
        title="No items found"
        message="Try adding some items to your cart"
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Try adding some items to your cart')).toBeInTheDocument();
  });

  it('renders without action button when not provided', () => {
    render(
      <EmptyState
        icon={ShoppingBag}
        title="Empty cart"
        message="Your cart is empty"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders with action button when provided', () => {
    const mockAction = jest.fn();
    
    render(
      <EmptyState
        icon={ShoppingBag}
        title="Empty cart"
        message="Your cart is empty"
        action={{
          label: 'Browse Menu',
          onClick: mockAction,
        }}
      />
    );

    const button = screen.getByRole('button', { name: 'Browse Menu' });
    expect(button).toBeInTheDocument();
  });

  it('calls action onClick when button is clicked', () => {
    const mockAction = jest.fn();
    
    render(
      <EmptyState
        icon={ShoppingBag}
        title="Empty cart"
        message="Your cart is empty"
        action={{
          label: 'Browse Menu',
          onClick: mockAction,
        }}
      />
    );

    const button = screen.getByRole('button', { name: 'Browse Menu' });
    fireEvent.click(button);
    
    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it('displays the correct icon', () => {
    const { container } = render(
      <EmptyState
        icon={ShoppingBag}
        title="Empty"
        message="No content"
      />
    );

    // Check that the icon container exists
    const iconContainer = container.querySelector('.w-20.h-20');
    expect(iconContainer).toBeInTheDocument();
  });
});
