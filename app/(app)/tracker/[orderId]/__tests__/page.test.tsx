/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import TrackerPage from '../page';
import { useRealtimeOrder } from '@/hooks/useRealtimeOrder';
import { useParams, useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@/hooks/useRealtimeOrder');
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

const mockUseRealtimeOrder = useRealtimeOrder as jest.MockedFunction<
  typeof useRealtimeOrder
>;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('TrackerPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ orderId: 'test-order-123' });
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  it('should render the page with header', () => {
    mockUseRealtimeOrder.mockReturnValue({
      order: null,
      isLoading: true,
      error: null,
    });

    render(<TrackerPage />);

    expect(screen.getByText('Order Tracker')).toBeInTheDocument();
  });

  it('should pass orderId to OrderTracker component', () => {
    mockUseRealtimeOrder.mockReturnValue({
      order: null,
      isLoading: true,
      error: null,
    });

    render(<TrackerPage />);

    expect(mockUseRealtimeOrder).toHaveBeenCalledWith('test-order-123');
  });

  it('should display loading state from OrderTracker', () => {
    mockUseRealtimeOrder.mockReturnValue({
      order: null,
      isLoading: true,
      error: null,
    });

    render(<TrackerPage />);

    expect(screen.getByText('Loading order details...')).toBeInTheDocument();
  });
});
