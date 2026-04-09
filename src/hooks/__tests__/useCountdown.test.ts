/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useCountdown } from '../useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with correct values for future expiry', () => {
      const futureDate = new Date(Date.now() + 300000); // 5 minutes from now
      const { result } = renderHook(() => useCountdown(futureDate));

      expect(result.current.timeLeft).toBeGreaterThan(0);
      expect(result.current.isExpired).toBe(false);
      expect(result.current.minutes).toBeGreaterThanOrEqual(0);
      expect(result.current.seconds).toBeGreaterThanOrEqual(0);
      expect(result.current.progress).toBeGreaterThan(0);
      expect(result.current.progress).toBeLessThanOrEqual(100);
    });

    it('should handle null expiry date', () => {
      const { result } = renderHook(() => useCountdown(null));

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isExpired).toBe(true);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(0);
      expect(result.current.progress).toBe(0);
    });

    it('should handle past expiry date', () => {
      const pastDate = new Date(Date.now() - 10000); // 10 seconds ago
      const { result } = renderHook(() => useCountdown(pastDate));

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isExpired).toBe(true);
      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(0);
      expect(result.current.progress).toBe(0);
    });

    it('should accept string date format', () => {
      const futureDate = new Date(Date.now() + 120000); // 2 minutes from now
      const { result } = renderHook(() => useCountdown(futureDate.toISOString()));

      expect(result.current.timeLeft).toBeGreaterThan(0);
      expect(result.current.isExpired).toBe(false);
    });
  });

  describe('countdown updates', () => {
    it('should update every second', () => {
      const futureDate = new Date(Date.now() + 10000); // 10 seconds from now
      const { result } = renderHook(() => useCountdown(futureDate));

      const initialTimeLeft = result.current.timeLeft;

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timeLeft).toBe(initialTimeLeft - 1);
    });

    it('should countdown to zero', () => {
      const futureDate = new Date(Date.now() + 3000); // 3 seconds from now
      const { result } = renderHook(() => useCountdown(futureDate));

      expect(result.current.isExpired).toBe(false);

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isExpired).toBe(true);
    });

    it('should not go below zero', () => {
      const futureDate = new Date(Date.now() + 2000); // 2 seconds from now
      const { result } = renderHook(() => useCountdown(futureDate));

      act(() => {
        jest.advanceTimersByTime(5000); // Advance beyond expiry
      });

      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isExpired).toBe(true);
    });
  });

  describe('minutes and seconds calculation', () => {
    it('should calculate minutes and seconds correctly for 5 minutes', () => {
      const futureDate = new Date(Date.now() + 300000); // 5 minutes
      const { result } = renderHook(() => useCountdown(futureDate));

      expect(result.current.minutes).toBe(5);
      expect(result.current.seconds).toBe(0);
    });

    it('should calculate minutes and seconds correctly for 2:30', () => {
      const futureDate = new Date(Date.now() + 150000); // 2 minutes 30 seconds
      const { result } = renderHook(() => useCountdown(futureDate));

      expect(result.current.minutes).toBe(2);
      expect(result.current.seconds).toBe(30);
    });

    it('should calculate minutes and seconds correctly for 0:45', () => {
      const futureDate = new Date(Date.now() + 45000); // 45 seconds
      const { result } = renderHook(() => useCountdown(futureDate));

      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(45);
    });

    it('should update minutes and seconds as time passes', () => {
      const futureDate = new Date(Date.now() + 61000); // 1 minute 1 second
      const { result } = renderHook(() => useCountdown(futureDate));

      expect(result.current.minutes).toBe(1);
      expect(result.current.seconds).toBe(1);

      act(() => {
        jest.advanceTimersByTime(2000); // Advance 2 seconds
      });

      expect(result.current.minutes).toBe(0);
      expect(result.current.seconds).toBe(59);
    });
  });

  describe('progress calculation', () => {
    it('should return 100% progress for full 5 minutes', () => {
      const futureDate = new Date(Date.now() + 300000); // 5 minutes
      const { result } = renderHook(() => useCountdown(futureDate));

      expect(result.current.progress).toBeCloseTo(100, 0);
    });

    it('should return 50% progress for 2.5 minutes', () => {
      const futureDate = new Date(Date.now() + 150000); // 2.5 minutes
      const { result } = renderHook(() => useCountdown(futureDate));

      expect(result.current.progress).toBeCloseTo(50, 0);
    });

    it('should return 0% progress when expired', () => {
      const pastDate = new Date(Date.now() - 1000);
      const { result } = renderHook(() => useCountdown(pastDate));

      expect(result.current.progress).toBe(0);
    });

    it('should cap progress at 100% for times over 5 minutes', () => {
      const futureDate = new Date(Date.now() + 600000); // 10 minutes
      const { result } = renderHook(() => useCountdown(futureDate));

      expect(result.current.progress).toBe(100);
    });

    it('should decrease progress as time passes', () => {
      const futureDate = new Date(Date.now() + 300000); // 5 minutes
      const { result } = renderHook(() => useCountdown(futureDate));

      const initialProgress = result.current.progress;

      act(() => {
        jest.advanceTimersByTime(60000); // Advance 1 minute
      });

      expect(result.current.progress).toBeLessThan(initialProgress);
      expect(result.current.progress).toBeCloseTo(80, 0);
    });
  });

  describe('cleanup', () => {
    it('should clear interval on unmount', () => {
      const futureDate = new Date(Date.now() + 10000);
      const { unmount } = renderHook(() => useCountdown(futureDate));

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('should not update state after unmount', () => {
      const futureDate = new Date(Date.now() + 10000);
      const { result, unmount } = renderHook(() => useCountdown(futureDate));

      const timeLeftBeforeUnmount = result.current.timeLeft;
      unmount();

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // State should not change after unmount
      expect(result.current.timeLeft).toBe(timeLeftBeforeUnmount);
    });
  });

  describe('expiry detection', () => {
    it('should set isExpired to true when countdown reaches zero', () => {
      const futureDate = new Date(Date.now() + 2000); // 2 seconds
      const { result } = renderHook(() => useCountdown(futureDate));

      expect(result.current.isExpired).toBe(false);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.isExpired).toBe(true);
    });

    it('should maintain isExpired state after expiry', () => {
      const futureDate = new Date(Date.now() + 1000); // 1 second
      const { result } = renderHook(() => useCountdown(futureDate));

      act(() => {
        jest.advanceTimersByTime(3000); // Advance well past expiry
      });

      expect(result.current.isExpired).toBe(true);
      expect(result.current.timeLeft).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle very short durations (< 1 second)', () => {
      const futureDate = new Date(Date.now() + 500); // 0.5 seconds
      const { result } = renderHook(() => useCountdown(futureDate));

      // With 0.5 seconds, Math.floor(0.5) = 0, but it's not expired yet
      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isExpired).toBe(false);

      act(() => {
        jest.advanceTimersByTime(1000); // Advance past expiry
      });

      expect(result.current.isExpired).toBe(true);
    });

    it('should handle date changes', () => {
      const futureDate1 = new Date(Date.now() + 10000);
      const { result, rerender } = renderHook(
        ({ date }) => useCountdown(date),
        { initialProps: { date: futureDate1 } }
      );

      const initialTimeLeft = result.current.timeLeft;

      const futureDate2 = new Date(Date.now() + 20000);
      rerender({ date: futureDate2 });

      expect(result.current.timeLeft).toBeGreaterThan(initialTimeLeft);
    });
  });
});
