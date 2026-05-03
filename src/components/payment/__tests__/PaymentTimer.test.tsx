/**
 * Unit tests for PaymentTimer component
 * **Validates: Requirements 13**
 * @jest-environment jsdom
 */

import { render, screen, act } from '@testing-library/react';
import PaymentTimer from '../PaymentTimer';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    circle: ({ children, ...props }: any) => <circle {...props}>{children}</circle>,
  },
}));

describe('PaymentTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Timer Display', () => {
    it('should display countdown timer with correct format', () => {
      const futureDate = new Date(Date.now() + 300000); // 5 minutes from now
      render(<PaymentTimer expiresAt={futureDate} />);

      expect(screen.getByText(/Complete payment within/i)).toBeInTheDocument();
      expect(screen.getByText(/05:00/)).toBeInTheDocument();
    });

    it('should format time correctly for single digit minutes and seconds', () => {
      const futureDate = new Date(Date.now() + 125000); // 2 minutes 5 seconds
      render(<PaymentTimer expiresAt={futureDate} />);

      expect(screen.getByText(/02:05/)).toBeInTheDocument();
    });

    it('should update every second', () => {
      const futureDate = new Date(Date.now() + 10000); // 10 seconds
      render(<PaymentTimer expiresAt={futureDate} />);

      const initialTime = screen.getByText(/00:10/);
      expect(initialTime).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText(/00:09/)).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should display circular progress ring', () => {
      const futureDate = new Date(Date.now() + 300000);
      const { container } = render(<PaymentTimer expiresAt={futureDate} />);

      const circles = container.querySelectorAll('circle');
      expect(circles.length).toBeGreaterThanOrEqual(2); // Background + progress ring
    });

    it('should display linear progress bar', () => {
      const futureDate = new Date(Date.now() + 300000);
      const { container } = render(<PaymentTimer expiresAt={futureDate} />);

      const progressBar = container.querySelector('.h-2.bg-[#eeeeee]\\/5');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Urgency States', () => {
    it('should show normal state for more than 2 minutes remaining', () => {
      const futureDate = new Date(Date.now() + 180000); // 3 minutes
      render(<PaymentTimer expiresAt={futureDate} />);

      expect(screen.queryByText(/Hurry!/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Please complete your payment soon/i)).not.toBeInTheDocument();
    });

    it('should show warning state for 1-2 minutes remaining', () => {
      const futureDate = new Date(Date.now() + 90000); // 1.5 minutes
      render(<PaymentTimer expiresAt={futureDate} />);

      expect(screen.getByText(/Please complete your payment soon/i)).toBeInTheDocument();
    });

    it('should show critical state for less than 1 minute remaining', () => {
      const futureDate = new Date(Date.now() + 45000); // 45 seconds
      render(<PaymentTimer expiresAt={futureDate} />);

      expect(screen.getByText(/Hurry! Less than 1 minute remaining/i)).toBeInTheDocument();
    });

    it('should display warning icon in critical state', () => {
      const futureDate = new Date(Date.now() + 30000); // 30 seconds
      const { container } = render(<PaymentTimer expiresAt={futureDate} />);

      // Check for AlertTriangle icon (lucide-react renders as svg)
      const warningMessage = screen.getByText(/Hurry! Less than 1 minute remaining/i);
      expect(warningMessage).toBeInTheDocument();
    });
  });

  describe('Expiry Handling', () => {
    it('should display expired message when timer reaches zero', () => {
      const pastDate = new Date(Date.now() - 1000); // Already expired
      render(<PaymentTimer expiresAt={pastDate} />);

      expect(screen.getByText(/Order expired/i)).toBeInTheDocument();
      expect(screen.getByText(/Time's up! Order has expired/i)).toBeInTheDocument();
    });

    it('should call onExpire callback when timer expires', () => {
      const onExpire = jest.fn();
      const pastDate = new Date(Date.now() - 1000);
      render(<PaymentTimer expiresAt={pastDate} onExpire={onExpire} />);

      expect(onExpire).toHaveBeenCalled();
    });

    it('should transition to expired state when countdown reaches zero', () => {
      const futureDate = new Date(Date.now() + 2000); // 2 seconds
      const onExpire = jest.fn();
      render(<PaymentTimer expiresAt={futureDate} onExpire={onExpire} />);

      expect(screen.queryByText(/Time's up!/i)).not.toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(screen.getByText(/Time's up! Order has expired/i)).toBeInTheDocument();
    });
  });

  describe('Null Expiry Handling', () => {
    it('should handle null expiresAt gracefully', () => {
      render(<PaymentTimer expiresAt={null} />);

      expect(screen.getByText(/Order expired/i)).toBeInTheDocument();
      expect(screen.getByText(/00:00/)).toBeInTheDocument();
    });
  });

  describe('Visual Feedback', () => {
    it('should apply pulse animation in critical state', () => {
      const futureDate = new Date(Date.now() + 30000); // 30 seconds
      const { container } = render(<PaymentTimer expiresAt={futureDate} />);

      const timeDisplay = screen.getByText(/00:30/);
      expect(timeDisplay.className).toContain('animate-pulse');
    });

    it('should not apply pulse animation in normal state', () => {
      const futureDate = new Date(Date.now() + 180000); // 3 minutes
      const { container } = render(<PaymentTimer expiresAt={futureDate} />);

      const timeDisplay = screen.getByText(/03:00/);
      expect(timeDisplay.className).not.toContain('animate-pulse');
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive text for screen readers', () => {
      const futureDate = new Date(Date.now() + 300000);
      render(<PaymentTimer expiresAt={futureDate} />);

      expect(screen.getByText(/Complete payment within/i)).toBeInTheDocument();
    });

    it('should display time in readable format', () => {
      const futureDate = new Date(Date.now() + 125000); // 2:05
      render(<PaymentTimer expiresAt={futureDate} />);

      const timeDisplay = screen.getByText(/02:05/);
      expect(timeDisplay).toBeInTheDocument();
    });
  });
});
