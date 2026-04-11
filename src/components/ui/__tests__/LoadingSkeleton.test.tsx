/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import LoadingSkeleton from '../LoadingSkeleton';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('LoadingSkeleton', () => {
  it('should render menu skeleton by default', () => {
    const { container } = render(<LoadingSkeleton />);
    expect(container.querySelector('.glass-card')).toBeInTheDocument();
  });

  it('should render specified number of skeletons', () => {
    const { container } = render(<LoadingSkeleton count={3} />);
    const skeletons = container.querySelectorAll('.glass-card');
    expect(skeletons).toHaveLength(3);
  });

  it('should render cafeteria variant correctly', () => {
    const { container } = render(<LoadingSkeleton variant="cafeteria" count={3} />);
    const skeletons = container.querySelectorAll('.glass-card');
    expect(skeletons).toHaveLength(3);
    // Cafeteria cards have larger image placeholders (h-40)
    expect(container.querySelector('.h-40')).toBeInTheDocument();
  });

  it('should render menu variant correctly', () => {
    const { container } = render(<LoadingSkeleton variant="menu" count={6} />);
    const skeletons = container.querySelectorAll('.glass-card');
    expect(skeletons).toHaveLength(6);
    // Menu cards have smaller image placeholders (h-28)
    expect(container.querySelector('.h-28')).toBeInTheDocument();
  });

  it('should render order variant correctly', () => {
    const { container } = render(<LoadingSkeleton variant="order" count={5} />);
    const skeletons = container.querySelectorAll('.glass-card');
    expect(skeletons).toHaveLength(5);
  });

  it('should apply shimmer animation class', () => {
    const { container } = render(<LoadingSkeleton variant="menu" />);
    const shimmerElements = container.querySelectorAll('.shimmer');
    expect(shimmerElements.length).toBeGreaterThan(0);
  });

  it('should use glassmorphism effect', () => {
    const { container } = render(<LoadingSkeleton variant="menu" />);
    expect(container.querySelector('.glass-card')).toBeInTheDocument();
  });
});
