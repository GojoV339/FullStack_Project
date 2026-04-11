/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import SuccessPage from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock PageTransition
jest.mock('@/components/layout/PageTransition', () => {
  return function PageTransition({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

describe('Success Page', () => {
  const mockPush = jest.fn();
  const mockSearchParams = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  it('should display success message', () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'token') return '42';
      if (key === 'orderNumber') return 'AF-2025-0001';
      if (key === 'cafeteria') return 'Samridhi';
      if (key === 'orderId') return 'order-123';
      return null;
    });

    render(<SuccessPage />);

    expect(screen.getByText(/Order Confirmed!/i)).toBeInTheDocument();
  });

  it('should display order number when provided', () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'token') return '42';
      if (key === 'orderNumber') return 'AF-2025-0001';
      if (key === 'cafeteria') return 'Samridhi';
      if (key === 'orderId') return 'order-123';
      return null;
    });

    render(<SuccessPage />);

    expect(screen.getByText('Order Number')).toBeInTheDocument();
    expect(screen.getByText('AF-2025-0001')).toBeInTheDocument();
  });

  it('should display token number', () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'token') return '42';
      if (key === 'orderNumber') return 'AF-2025-0001';
      if (key === 'cafeteria') return 'Samridhi';
      if (key === 'orderId') return 'order-123';
      return null;
    });

    render(<SuccessPage />);

    expect(screen.getByText(/Your Token Number/i)).toBeInTheDocument();
    expect(screen.getByText('#42')).toBeInTheDocument();
  });

  it('should display cafeteria name', () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'token') return '42';
      if (key === 'orderNumber') return 'AF-2025-0001';
      if (key === 'cafeteria') return 'Samridhi';
      if (key === 'orderId') return 'order-123';
      return null;
    });

    render(<SuccessPage />);

    expect(screen.getByText('Samridhi')).toBeInTheDocument();
  });

  it('should display track order button when orderId is provided', () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'token') return '42';
      if (key === 'orderNumber') return 'AF-2025-0001';
      if (key === 'cafeteria') return 'Samridhi';
      if (key === 'orderId') return 'order-123';
      return null;
    });

    render(<SuccessPage />);

    expect(screen.getByText('Track My Order')).toBeInTheDocument();
  });

  it('should display order more button', () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'token') return '42';
      if (key === 'orderNumber') return 'AF-2025-0001';
      if (key === 'cafeteria') return 'Samridhi';
      if (key === 'orderId') return 'order-123';
      return null;
    });

    render(<SuccessPage />);

    expect(screen.getByText('Order More')).toBeInTheDocument();
  });

  it('should not display order number section when orderNumber is not provided', () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'token') return '42';
      if (key === 'cafeteria') return 'Samridhi';
      if (key === 'orderId') return 'order-123';
      return null;
    });

    render(<SuccessPage />);

    expect(screen.queryByText('Order Number')).not.toBeInTheDocument();
  });

  it('should handle missing parameters gracefully', () => {
    mockSearchParams.get.mockReturnValue(null);

    render(<SuccessPage />);

    expect(screen.getByText(/Order Confirmed!/i)).toBeInTheDocument();
    expect(screen.getByText('#?')).toBeInTheDocument();
    expect(screen.getByText('Canteen')).toBeInTheDocument();
  });
});
