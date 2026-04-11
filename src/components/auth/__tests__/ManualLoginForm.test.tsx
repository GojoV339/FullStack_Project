/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ManualLoginForm from '../ManualLoginForm';
import { useAuthStore } from '@/store/authStore';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('ManualLoginForm', () => {
  const mockPush = jest.fn();
  const mockSetStudent = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useAuthStore as unknown as jest.Mock).mockReturnValue(mockSetStudent);
  });

  it('should render when isOpen is true', () => {
    render(<ManualLoginForm isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Manual Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('BL.EN.U4CSE22001')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<ManualLoginForm isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Manual Login')).not.toBeInTheDocument();
  });

  it('should auto-uppercase input text', () => {
    render(<ManualLoginForm isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('BL.EN.U4CSE22001') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'bl.en.u4cse22001' } });
    
    expect(input.value).toBe('BL.EN.U4CSE22001');
  });

  it('should display validation error for invalid format', async () => {
    render(<ManualLoginForm isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('BL.EN.U4CSE22001');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(input, { target: { value: 'INVALID' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid registration number format')).toBeInTheDocument();
    });
  });

  it('should disable submit button when input is empty', () => {
    render(<ManualLoginForm isOpen={true} onClose={mockOnClose} />);
    const submitButton = screen.getByRole('button', { name: /login/i }) as HTMLButtonElement;
    
    // Button should be disabled when input is empty
    expect(submitButton.disabled).toBe(true);
  });

  it('should call manual login API with valid registration number', async () => {
    const mockStudent = {
      id: 'student-123',
      registrationNumber: 'BL.EN.U4CSE22001',
      name: null,
      phone: null,
      subscriptionStatus: 'INACTIVE',
      subscriptionExpiry: null,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ student: mockStudent }),
    });

    render(<ManualLoginForm isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('BL.EN.U4CSE22001');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(input, { target: { value: 'BL.EN.U4CSE22001' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/manual-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: 'BL.EN.U4CSE22001' }),
      });
    });

    await waitFor(() => {
      expect(mockSetStudent).toHaveBeenCalledWith(mockStudent);
      expect(toast.success).toHaveBeenCalledWith('Login successful!');
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/cafeteria');
    });
  });

  it('should display error message when API returns error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid registration number format' }),
    });

    render(<ManualLoginForm isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('BL.EN.U4CSE22001');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(input, { target: { value: 'BL.EN.U4CSE22001' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid registration number format')).toBeInTheDocument();
    });
  });

  it('should display network error on fetch failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<ManualLoginForm isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('BL.EN.U4CSE22001');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(input, { target: { value: 'BL.EN.U4CSE22001' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
    });
  });

  it('should close form when backdrop is clicked', () => {
    render(<ManualLoginForm isOpen={true} onClose={mockOnClose} />);
    const backdrop = document.querySelector('.bg-black\\/60');
    
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should close form when X button is clicked', () => {
    render(<ManualLoginForm isOpen={true} onClose={mockOnClose} />);
    const closeButton = screen.getByRole('button', { name: '' }); // X button has no text
    
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should disable submit button when input is empty', () => {
    render(<ManualLoginForm isOpen={true} onClose={mockOnClose} />);
    const submitButton = screen.getByRole('button', { name: /login/i }) as HTMLButtonElement;
    
    expect(submitButton.disabled).toBe(true);
  });

  it('should show loading state during submission', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<ManualLoginForm isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('BL.EN.U4CSE22001');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(input, { target: { value: 'BL.EN.U4CSE22001' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
    });
  });

  it('should clear validation error when user types', async () => {
    render(<ManualLoginForm isOpen={true} onClose={mockOnClose} />);
    const input = screen.getByPlaceholderText('BL.EN.U4CSE22001');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    // Trigger validation error
    fireEvent.change(input, { target: { value: 'INVALID' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid registration number format')).toBeInTheDocument();
    });
    
    // Type again to clear error
    fireEvent.change(input, { target: { value: 'BL.EN.U4CSE22001' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Invalid registration number format')).not.toBeInTheDocument();
    });
  });
});
