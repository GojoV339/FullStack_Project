'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { CameraOff } from 'lucide-react';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onScanSuccess: (barcodeData: string) => void;
  onCameraError?: () => void;
}

export default function BarcodeScanner({
  onScanSuccess,
  onCameraError,
}: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<any>(null);
  const hasScannedRef = useRef(false);

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      // Prevent multiple scans
      if (hasScannedRef.current) return;
      hasScannedRef.current = true;

      // Stop scanner
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch((err: Error) => console.error('Error stopping scanner:', err));
      }

      // Validate registration number pattern
      const regNumMatch = decodedText.match(/[A-Z]{2}\.EN\.U4[A-Z]{3}\d{2}\d{3}/);
      const registrationNumber = regNumMatch ? regNumMatch[0] : decodedText.trim();

      const isValid = /^[A-Z]{2}\.EN\.U4[A-Z]{3}\d{2}\d{3}$/.test(registrationNumber);

      if (!isValid) {
        toast.error('Invalid registration number format');
        hasScannedRef.current = false;
        // Restart scanner
        if (html5QrCodeRef.current) {
          html5QrCodeRef.current
            .start(
              { facingMode: 'environment' },
              {
                fps: 10,
                qrbox: { width: 280, height: 180 },
              },
              handleScanSuccess,
              () => {} // ignore scan errors
            )
            .catch(() => {});
        }
        return;
      }

      onScanSuccess(decodedText);
    },
    [onScanSuccess]
  );

  useEffect(() => {
    let scanner: any = null;
    let mounted = true;

    const initScanner = async () => {
      try {
        // Dynamically import html5-qrcode
        const { Html5Qrcode } = await import('html5-qrcode');
        
        if (!mounted) return;

        scanner = new Html5Qrcode('barcode-reader');
        html5QrCodeRef.current = scanner;

        // Activate rear camera
        await scanner.start(
          { facingMode: 'environment' }, // Use rear camera
          {
            fps: 10, // Scan 10 times per second
            qrbox: { width: 280, height: 180 },
          },
          handleScanSuccess,
          () => {} // Ignore scan errors (no barcode detected)
        );

        if (mounted) {
          setIsScanning(true);
        }
      } catch (err) {
        console.error('Scanner initialization error:', err);
        if (mounted) {
          setScanError('Camera access denied or not available.');
          onCameraError?.();
        }
      }
    };

    initScanner();

    return () => {
      mounted = false;
      if (scanner) {
        scanner
          .stop()
          .catch((err: Error) => console.error('Error stopping scanner:', err));
      }
    };
  }, [handleScanSuccess, onCameraError]);

  return (
    <div className="relative w-full h-full">
      {/* Scanner container */}
      <div id="barcode-reader" className="w-full h-full" />

      {/* Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

        {/* Scanning frame */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[180px]">
          {/* Corner brackets */}
          {[
            'top-0 left-0 border-t-2 border-l-2',
            'top-0 right-0 border-t-2 border-r-2',
            'bottom-0 left-0 border-b-2 border-l-2',
            'bottom-0 right-0 border-b-2 border-r-2',
          ].map((cls, i) => (
            <div
              key={i}
              className={`absolute w-8 h-8 border-primary ${cls} rounded-sm animate-pulse-bracket`}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}

          {/* Scanning line animation */}
          {isScanning && (
            <motion.div
              className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
              animate={{ y: [0, 160, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>

        {/* Top text */}
        <div className="absolute top-16 left-0 right-0 text-center safe-top pointer-events-auto">
          <h1 className="text-[#2D2D2D] font-bold text-xl">Scan Your ID</h1>
          <p className="text-[#2D2D2D]/50 text-sm mt-1">
            Point camera at your college ID barcode
          </p>
        </div>

        {/* Camera error display */}
        {scanError && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass-card p-6 text-center pointer-events-auto max-w-xs">
            <CameraOff size={40} className="text-primary mx-auto mb-3" />
            <p className="text-[#2D2D2D]/70 text-sm">{scanError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
