'use client';

import { useState, useEffect, useCallback } from 'react';

export function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
        return;
      }
      setTimeLeft(Math.ceil(diff / 1000));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const percentage = targetDate
    ? Math.max(0, (timeLeft / 300) * 100) // 300 seconds = 5 minutes
    : 0;

  const urgency = timeLeft > 120 ? 'normal' : timeLeft > 30 ? 'warning' : 'critical';

  return {
    timeLeft,
    isExpired,
    formatted: formatTime(timeLeft),
    percentage,
    urgency,
  };
}
