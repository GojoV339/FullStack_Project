/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import BarcodeScanner from '../BarcodeScanner';
import { toast } from 'sonner';

// Mock html5-qrcode
const mockStop = jest.fn().mockResolvedValue(undefined);
const mockStart = jest.fn().mockResolvedValue(undefined);

jest.mock('html5-qrcode', () => ({
  Html5Qrcode: jest.fn().mockImplementation(() => ({
    start: mockStart,
    stop: mockStop,
  })),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('BarcodeScanner', () => {
  const mockOnScanSuccess = jest.fn();
  const mockOnCameraError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render scanner container', () => {
    render(<BarcodeScanner onScanSuccess={mockOnScanSuccess} />);
    
    const scannerContainer = document.getElementById('barcode-reader');
    expect(scannerContainer).toBeInTheDocument();
  });

  it('should display scanning instructions', () => {
    render(<BarcodeScanner onScanSuccess={mockOnScanSuccess} />);
    
    expect(screen.getByText('Scan Your ID')).toBeInTheDocument();
    expect(screen.getByText('Point camera at your college ID barcode')).toBeInTheDocument();
  });

  it('should activate rear camera on mount', async () => {
    render(<BarcodeScanner onScanSuccess={mockOnScanSuccess} />);

    await waitFor(() => {
      expect(mockStart).toHaveBeenCalledWith(
        { facingMode: 'environment' },
        expect.objectContaining({
          fps: 10,
          qrbox: { width: 280, height: 180 },
        }),
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  it('should call onScanSuccess with valid registration number', async () => {
    render(<BarcodeScanner onScanSuccess={mockOnScanSuccess} />);

    await waitFor(() => {
      expect(mockStart).toHaveBeenCalled();
    });

    // Get the success callback passed to start()
    const successCallback = mockStart.mock.calls[0][2];
    
    // Simulate successful scan with valid registration number
    successCallback('AM.EN.U4CSE21001');

    await waitFor(() => {
      expect(mockOnScanSuccess).toHaveBeenCalledWith('AM.EN.U4CSE21001');
      expect(mockStop).toHaveBeenCalled();
    });
  });

  it('should validate registration number pattern', async () => {
    render(<BarcodeScanner onScanSuccess={mockOnScanSuccess} />);

    await waitFor(() => {
      expect(mockStart).toHaveBeenCalled();
    });

    const successCallback = mockStart.mock.calls[0][2];
    
    // Simulate scan with invalid registration number
    successCallback('INVALID_BARCODE');

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid registration number format');
      expect(mockOnScanSuccess).not.toHaveBeenCalled();
    });
  });

  it('should extract registration number from barcode data', async () => {
    render(<BarcodeScanner onScanSuccess={mockOnScanSuccess} />);

    await waitFor(() => {
      expect(mockStart).toHaveBeenCalled();
    });

    const successCallback = mockStart.mock.calls[0][2];
    
    // Simulate scan with barcode containing registration number
    successCallback('SOME_PREFIX_BL.EN.U4CSE22001_SOME_SUFFIX');

    await waitFor(() => {
      expect(mockOnScanSuccess).toHaveBeenCalledWith('SOME_PREFIX_BL.EN.U4CSE22001_SOME_SUFFIX');
      expect(mockStop).toHaveBeenCalled();
    });
  });

  it('should handle camera access denied error', async () => {
    mockStart.mockRejectedValueOnce(new Error('Camera access denied'));

    render(
      <BarcodeScanner
        onScanSuccess={mockOnScanSuccess}
        onCameraError={mockOnCameraError}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Camera access denied or not available.')).toBeInTheDocument();
      expect(mockOnCameraError).toHaveBeenCalled();
    });
  });

  it('should stop scanner on unmount', async () => {
    const { unmount } = render(<BarcodeScanner onScanSuccess={mockOnScanSuccess} />);

    await waitFor(() => {
      expect(mockStart).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(mockStop).toHaveBeenCalled();
    });
  });

  it('should prevent multiple scans', async () => {
    render(<BarcodeScanner onScanSuccess={mockOnScanSuccess} />);

    await waitFor(() => {
      expect(mockStart).toHaveBeenCalled();
    });

    const successCallback = mockStart.mock.calls[0][2];
    
    // Simulate multiple rapid scans
    successCallback('AM.EN.U4CSE21001');
    successCallback('BL.EN.U4CSE22002');

    await waitFor(() => {
      // Should only call onScanSuccess once
      expect(mockOnScanSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnScanSuccess).toHaveBeenCalledWith('AM.EN.U4CSE21001');
    });
  });

  it('should decode barcode within 500ms', async () => {
    const startTime = Date.now();
    
    render(<BarcodeScanner onScanSuccess={mockOnScanSuccess} />);

    await waitFor(() => {
      expect(mockStart).toHaveBeenCalled();
    });

    const successCallback = mockStart.mock.calls[0][2];
    successCallback('AM.EN.U4CSE21001');

    await waitFor(() => {
      expect(mockOnScanSuccess).toHaveBeenCalled();
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Decoding should happen within 500ms
    expect(duration).toBeLessThan(500);
  });
});
