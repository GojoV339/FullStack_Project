/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MenuSearch from '../MenuSearch';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('MenuSearch', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render search input with placeholder', () => {
    const mockOnSearch = jest.fn();
    render(<MenuSearch onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search menu items...');
    expect(input).toBeInTheDocument();
  });

  it('should display search icon', () => {
    const mockOnSearch = jest.fn();
    render(<MenuSearch onSearch={mockOnSearch} />);

    // Search icon should be present (lucide-react renders as svg)
    const searchIcon = document.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should update input value when typing', () => {
    const mockOnSearch = jest.fn();
    render(<MenuSearch onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search menu items...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Dosa' } });

    expect(input.value).toBe('Dosa');
  });

  it('should debounce search callback by 300ms', async () => {
    const mockOnSearch = jest.fn();
    render(<MenuSearch onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search menu items...');
    
    // Type multiple characters quickly
    fireEvent.change(input, { target: { value: 'D' } });
    fireEvent.change(input, { target: { value: 'Do' } });
    fireEvent.change(input, { target: { value: 'Dosa' } });

    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled();

    // Fast-forward time by 300ms
    jest.advanceTimersByTime(300);

    // Should call once with the final value (lowercase and trimmed)
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('dosa');
    });
  });

  it('should perform case-insensitive search', async () => {
    const mockOnSearch = jest.fn();
    render(<MenuSearch onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search menu items...');
    fireEvent.change(input, { target: { value: 'MASALA DOSA' } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('masala dosa');
    });
  });

  it('should trim whitespace from search query', async () => {
    const mockOnSearch = jest.fn();
    render(<MenuSearch onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search menu items...');
    fireEvent.change(input, { target: { value: '  coffee  ' } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('coffee');
    });
  });

  it('should show clear button when input has value', () => {
    const mockOnSearch = jest.fn();
    render(<MenuSearch onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search menu items...');
    
    // Initially no clear button
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    // Type something
    fireEvent.change(input, { target: { value: 'Dosa' } });

    // Clear button should appear
    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('should clear input when clear button is clicked', async () => {
    const mockOnSearch = jest.fn();
    render(<MenuSearch onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search menu items...') as HTMLInputElement;
    
    // Type something
    fireEvent.change(input, { target: { value: 'Dosa' } });
    expect(input.value).toBe('Dosa');

    // Click clear button
    const clearButton = screen.getByRole('button');
    fireEvent.click(clearButton);

    // Input should be cleared
    expect(input.value).toBe('');

    // Should trigger search with empty string after debounce
    jest.advanceTimersByTime(300);
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('');
    });
  });

  it('should handle rapid typing correctly', async () => {
    const mockOnSearch = jest.fn();
    render(<MenuSearch onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search menu items...');
    
    // Rapid typing
    fireEvent.change(input, { target: { value: 'M' } });
    jest.advanceTimersByTime(100);
    
    fireEvent.change(input, { target: { value: 'Ma' } });
    jest.advanceTimersByTime(100);
    
    fireEvent.change(input, { target: { value: 'Mas' } });
    jest.advanceTimersByTime(100);
    
    fireEvent.change(input, { target: { value: 'Masala' } });
    jest.advanceTimersByTime(300);

    // Should only call once with final value
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('masala');
    });
  });

  it('should handle empty input', async () => {
    const mockOnSearch = jest.fn();
    render(<MenuSearch onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search menu items...');
    
    // Type and then clear
    fireEvent.change(input, { target: { value: 'Dosa' } });
    jest.advanceTimersByTime(300);
    
    fireEvent.change(input, { target: { value: '' } });
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenLastCalledWith('');
    });
  });

  it('should cancel previous debounce timer on new input', async () => {
    const mockOnSearch = jest.fn();
    render(<MenuSearch onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search menu items...');
    
    // First input
    fireEvent.change(input, { target: { value: 'Dosa' } });
    jest.advanceTimersByTime(200); // Not enough to trigger
    
    // Second input before debounce completes
    fireEvent.change(input, { target: { value: 'Coffee' } });
    jest.advanceTimersByTime(300);

    // Should only call with the latest value
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('coffee');
    });
  });
});
