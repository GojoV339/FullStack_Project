/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePushNotifications } from '../usePushNotifications';

// Mock fetch
global.fetch = jest.fn();

// Mock Notification API
global.Notification = {
  requestPermission: jest.fn(),
} as any;

// Mock PushManager
(global as any).PushManager = class PushManager {};

// Mock navigator.serviceWorker
const mockGetSubscription = jest.fn();
const mockSubscribe = jest.fn();
const mockUnsubscribe = jest.fn();

const mockServiceWorker = {
  ready: Promise.resolve({
    pushManager: {
      getSubscription: mockGetSubscription,
      subscribe: mockSubscribe,
    },
  }),
};

Object.defineProperty(global.navigator, 'serviceWorker', {
  writable: true,
  configurable: true,
  value: mockServiceWorker,
});

describe('usePushNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'BNthisIsATestVapidKey';
    mockGetSubscription.mockResolvedValue(null);
  });

  describe('Browser Support', () => {
    it('should detect push notification support', async () => {
      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true);
      });
    });

    it('should detect when push notifications are not supported', async () => {
      Object.defineProperty(global.navigator, 'serviceWorker', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.isSupported).toBe(false);
      });

      // Restore
      Object.defineProperty(global.navigator, 'serviceWorker', {
        writable: true,
        configurable: true,
        value: mockServiceWorker,
      });
    });
  });

  describe('Subscription Status', () => {
    it('should check existing subscription on mount', async () => {
      const mockSubscription = { endpoint: 'https://example.com/push' };
      mockGetSubscription.mockResolvedValue(mockSubscription);

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.isSubscribed).toBe(true);
      });
    });

    it('should set isSubscribed to false when no existing subscription', async () => {
      mockGetSubscription.mockResolvedValue(null);

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.isSubscribed).toBe(false);
      });
    });
  });

  describe('subscribe', () => {
    it('should request notification permission', async () => {
      (global.Notification.requestPermission as jest.Mock).mockResolvedValue('granted');
      mockSubscribe.mockResolvedValue({ endpoint: 'https://example.com/push' });

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true);
      });

      await act(async () => {
        await result.current.subscribe();
      });

      expect(global.Notification.requestPermission).toHaveBeenCalled();
    });

    it('should create push subscription with VAPID key', async () => {
      (global.Notification.requestPermission as jest.Mock).mockResolvedValue('granted');
      mockSubscribe.mockResolvedValue({ endpoint: 'https://example.com/push' });

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true);
      });

      await act(async () => {
        await result.current.subscribe();
      });

      expect(mockSubscribe).toHaveBeenCalledWith({
        userVisibleOnly: true,
        applicationServerKey: expect.any(Uint8Array),
      });
    });

    it('should send subscription to API', async () => {
      (global.Notification.requestPermission as jest.Mock).mockResolvedValue('granted');
      const mockSubscription = { endpoint: 'https://example.com/push' };
      mockSubscribe.mockResolvedValue(mockSubscription);

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true);
      });

      await act(async () => {
        await result.current.subscribe();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: mockSubscription }),
      });
    });

    it('should update isSubscribed to true on success', async () => {
      (global.Notification.requestPermission as jest.Mock).mockResolvedValue('granted');
      mockSubscribe.mockResolvedValue({ endpoint: 'https://example.com/push' });

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true);
      });

      await act(async () => {
        await result.current.subscribe();
      });

      expect(result.current.isSubscribed).toBe(true);
    });

    it('should throw error when permission is denied', async () => {
      (global.Notification.requestPermission as jest.Mock).mockResolvedValue('denied');

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.subscribe();
        });
      }).rejects.toThrow('Notification permission denied');
    });

    it('should throw error when VAPID key is not configured', async () => {
      delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      (global.Notification.requestPermission as jest.Mock).mockResolvedValue('granted');

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.subscribe();
        });
      }).rejects.toThrow('VAPID public key not configured');
    });

    it('should use existing subscription if already subscribed', async () => {
      const existingSubscription = { endpoint: 'https://example.com/existing' };
      mockGetSubscription.mockResolvedValue(existingSubscription);
      (global.Notification.requestPermission as jest.Mock).mockResolvedValue('granted');

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true);
      });

      await act(async () => {
        await result.current.subscribe();
      });

      expect(mockSubscribe).not.toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: existingSubscription }),
      });
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from push notifications', async () => {
      const mockSubscription = {
        endpoint: 'https://example.com/push',
        unsubscribe: mockUnsubscribe,
      };
      mockGetSubscription.mockResolvedValue(mockSubscription);
      mockUnsubscribe.mockResolvedValue(true);

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.isSubscribed).toBe(true);
      });

      await act(async () => {
        await result.current.unsubscribe();
      });

      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(result.current.isSubscribed).toBe(false);
    });

    it('should handle unsubscribe when no subscription exists', async () => {
      mockGetSubscription.mockResolvedValue(null);

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.isSupported).toBe(true);
      });

      await act(async () => {
        await result.current.unsubscribe();
      });

      expect(mockUnsubscribe).not.toHaveBeenCalled();
    });

    it('should throw error when not supported', async () => {
      Object.defineProperty(global.navigator, 'serviceWorker', {
        writable: true,
        configurable: true,
        value: undefined,
      });

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.isSupported).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.unsubscribe();
        });
      }).rejects.toThrow('Push notifications are not supported in this browser');

      // Restore
      Object.defineProperty(global.navigator, 'serviceWorker', {
        writable: true,
        configurable: true,
        value: mockServiceWorker,
      });
    });
  });
});
