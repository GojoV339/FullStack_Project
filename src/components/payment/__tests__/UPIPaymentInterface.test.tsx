/**
 * Unit tests for UPIPaymentInterface component
 * **Validates: Requirements 14, 15**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UPIPaymentInterface from '../UPIPaymentInterface';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@cashfreepayments/cashfree-js', () => ({
  load: jest.fn(() => Promise.resolve({
    checkout: jest.fn(() => Promise.resolve({
      paymentDetails: { status: 'SUCCESS' },
    })),
  })),
}));

describe('UPIPaymentInterface', () => {
  const mockProps = {
    orderId: 'test-order-123',
    tokenNumber: 42,
    totalAmount: 250,
    cafeteriaName: 'Samridhi (Main Block)',
    cashfreeSessionId: null,
    onSuccess: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render UPI app grid with all apps', () => {
      render(<UPIPaymentInterface {...mockProps} />);

      expect(screen.getByText('GPay')).toBeInTheDocument();
      expect(screen.getByText('PhonePe')).toBeInTheDocument();
      expect(screen.getByText('Paytm')).toBeInTheDocument();
      expect(screen.getByText('BHIM')).toBeInTheDocument();
    });

    it('should render UPI ID input field', () => {
      render(<UPIPaymentInterface {...mockProps} />);

      const input = screen.getByPlaceholderText('yourname@upi');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('input-field');
    });

    it('should render QR code button', () => {
      render(<UPIPaymentInterface {...mockProps} />);

      expect(screen.getByText('Show QR Code')).toBeInTheDocument();
    });

    it('should render payment amount in UPI ID submit button', () => {
      render(<UPIPaymentInterface {...mockProps} />);

      expect(screen.getByText(`Pay ₹${mockProps.totalAmount}`)).toBeInTheDocument();
    });
  });

  describe('UPI App Selection', () => {
    it('should handle UPI app click', async () => {
      jest.useFakeTimers();
      render(<UPIPaymentInterface {...mockProps} />);

      const gpayButton = screen.getByText('GPay').closest('button');
      fireEvent.click(gpayButton!);

      // Should show processing state
      await waitFor(() => {
        expect(screen.getByText('Processing payment...')).toBeInTheDocument();
      });

      // Fast-forward time to complete processing
      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should call onSuccess after successful payment', async () => {
      jest.useFakeTimers();
      render(<UPIPaymentInterface {...mockProps} />);

      const gpayButton = screen.getByText('GPay').closest('button');
      fireEvent.click(gpayButton!);

      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
      });

      // Wait for redirect delay
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockProps.onSuccess).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });
  });

  describe('UPI ID Input', () => {
    it('should update UPI ID input value', () => {
      render(<UPIPaymentInterface {...mockProps} />);

      const input = screen.getByPlaceholderText('yourname@upi') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'test@upi' } });

      expect(input.value).toBe('test@upi');
    });

    it('should disable submit button when UPI ID is empty', () => {
      render(<UPIPaymentInterface {...mockProps} />);

      const submitButton = screen.getByText(`Pay ₹${mockProps.totalAmount}`);
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when UPI ID is entered', () => {
      render(<UPIPaymentInterface {...mockProps} />);

      const input = screen.getByPlaceholderText('yourname@upi');
      fireEvent.change(input, { target: { value: 'test@upi' } });

      const submitButton = screen.getByText(`Pay ₹${mockProps.totalAmount}`);
      expect(submitButton).not.toBeDisabled();
    });

    it('should handle UPI ID form submission', async () => {
      jest.useFakeTimers();
      render(<UPIPaymentInterface {...mockProps} />);

      const input = screen.getByPlaceholderText('yourname@upi');
      fireEvent.change(input, { target: { value: 'test@upi' } });

      const form = input.closest('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('Processing payment...')).toBeInTheDocument();
      });

      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('QR Code Modal', () => {
    it('should open QR code modal when button clicked', () => {
      render(<UPIPaymentInterface {...mockProps} />);

      const qrButton = screen.getByText('Show QR Code');
      fireEvent.click(qrButton);

      expect(screen.getByText('Scan QR Code')).toBeInTheDocument();
      expect(screen.getByText('Scan this QR code with any UPI app to complete payment')).toBeInTheDocument();
    });

    it('should close QR code modal when close button clicked', async () => {
      render(<UPIPaymentInterface {...mockProps} />);

      const qrButton = screen.getByText('Show QR Code');
      fireEvent.click(qrButton);

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Scan QR Code')).not.toBeInTheDocument();
      });
    });

    it('should display amount in QR code modal', () => {
      render(<UPIPaymentInterface {...mockProps} />);

      const qrButton = screen.getByText('Show QR Code');
      fireEvent.click(qrButton);

      expect(screen.getByText(`₹${mockProps.totalAmount}`)).toBeInTheDocument();
    });
  });

  describe('Success Overlay', () => {
    it('should display order details in success overlay', async () => {
      jest.useFakeTimers();
      render(<UPIPaymentInterface {...mockProps} />);

      const gpayButton = screen.getByText('GPay').closest('button');
      fireEvent.click(gpayButton!);

      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
        expect(screen.getByText(`#${mockProps.tokenNumber}`)).toBeInTheDocument();
        expect(screen.getByText(mockProps.cafeteriaName)).toBeInTheDocument();
        expect(screen.getByText(`₹${mockProps.totalAmount}`)).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should show redirecting message in success overlay', async () => {
      jest.useFakeTimers();
      render(<UPIPaymentInterface {...mockProps} />);

      const gpayButton = screen.getByText('GPay').closest('button');
      fireEvent.click(gpayButton!);

      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(screen.getByText('Redirecting to order tracker...')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Processing State', () => {
    it('should show processing animation during payment', async () => {
      jest.useFakeTimers();
      render(<UPIPaymentInterface {...mockProps} />);

      const gpayButton = screen.getByText('GPay').closest('button');
      fireEvent.click(gpayButton!);

      await waitFor(() => {
        expect(screen.getByText('Processing payment...')).toBeInTheDocument();
        expect(screen.getByText('Please wait while we confirm your payment')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should hide main interface during processing', async () => {
      jest.useFakeTimers();
      render(<UPIPaymentInterface {...mockProps} />);

      const gpayButton = screen.getByText('GPay').closest('button');
      fireEvent.click(gpayButton!);

      await waitFor(() => {
        expect(screen.queryByText('Pay with UPI App')).not.toBeInTheDocument();
        expect(screen.queryByText('Enter UPI ID')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Cashfree Integration', () => {
    it('should use Cashfree when session ID is provided', async () => {
      const cashfreeModule = await import('@cashfreepayments/cashfree-js');
      const mockLoad = cashfreeModule.load as jest.Mock;

      jest.useFakeTimers();
      render(<UPIPaymentInterface {...mockProps} cashfreeSessionId="session_123" />);

      const gpayButton = screen.getByText('GPay').closest('button');
      fireEvent.click(gpayButton!);

      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(mockLoad).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });

    it('should work in demo mode without Cashfree session', async () => {
      jest.useFakeTimers();
      render(<UPIPaymentInterface {...mockProps} cashfreeSessionId={null} />);

      const gpayButton = screen.getByText('GPay').closest('button');
      fireEvent.click(gpayButton!);

      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should call onError when payment fails', async () => {
      const cashfreeModule = await import('@cashfreepayments/cashfree-js');
      const mockLoad = cashfreeModule.load as jest.Mock;
      mockLoad.mockImplementationOnce(() => Promise.resolve({
        checkout: jest.fn(() => Promise.resolve(null)),
      }));

      jest.useFakeTimers();
      render(<UPIPaymentInterface {...mockProps} cashfreeSessionId="session_123" />);

      const gpayButton = screen.getByText('GPay').closest('button');
      fireEvent.click(gpayButton!);

      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(mockProps.onError).toHaveBeenCalledWith('Payment was not completed');
      });

      jest.useRealTimers();
    });

    it('should reset processing state on error', async () => {
      const cashfreeModule = await import('@cashfreepayments/cashfree-js');
      const mockLoad = cashfreeModule.load as jest.Mock;
      mockLoad.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

      jest.useFakeTimers();
      render(<UPIPaymentInterface {...mockProps} cashfreeSessionId="session_123" />);

      const gpayButton = screen.getByText('GPay').closest('button');
      fireEvent.click(gpayButton!);

      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(mockProps.onError).toHaveBeenCalled();
        expect(screen.queryByText('Processing payment...')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });
});
