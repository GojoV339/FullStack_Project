'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook for countdown timer functionality
 * **Validates: Requirements 13**
 * 
 * @param expiresAt - The expiration date/time
 * @returns Object containing timeLeft, minutes, seconds, progress, and isExpired
 */
export function useCountdown(expiresAt: Date | string | null) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft(0);
      setIsExpired(true);
      return;
    }

    const calculateTimeLeft = () => {
      const expiryTime = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
      const diff = expiryTime.getTime() - Date.now();
      
      if (diff <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
        return;
      }
      
      setTimeLeft(Math.floor(diff / 1000));
      setIsExpired(false);
    };

    // Calculate immediately
    calculateTimeLeft();
    
    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [expiresAt]);

  // Calculate minutes and seconds
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Calculate progress (0-100) based on 5-minute timer (300 seconds)
  const progress = Math.max(0, Math.min(100, (timeLeft / 300) * 100));

  return {
    timeLeft,
    minutes,
    seconds,
    progress,
    isExpired,
  };
}
