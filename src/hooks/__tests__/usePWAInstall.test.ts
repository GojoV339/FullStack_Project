/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePWAInstall } from '../usePWAInstall';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('usePWAInstall', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    
    // Reset matchMedia to default
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('should initialize with isInstallable false and isInstalled false', () => {
    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isInstalled).toBe(false);
  });

  it('should detect if app is already installed', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstalled).toBe(true);
  });

  it('should set isInstallable to true when beforeinstallprompt event fires', async () => {
    const { result } = renderHook(() => usePWAInstall());

    expect(result.current.isInstallable).toBe(false);

    // Simulate beforeinstallprompt event
    const mockEvent = new Event('beforeinstallprompt') as any;
    mockEvent.preventDefault = jest.fn();
    mockEvent.prompt = jest.fn().mockResolvedValue(undefined);
    mockEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

    await act(async () => {
      window.dispatchEvent(mockEvent);
    });

    expect(result.current.isInstallable).toBe(true);
  });

  it('should trigger install prompt when promptInstall is called', async () => {
    const { result } = renderHook(() => usePWAInstall());

    const mockEvent = new Event('beforeinstallprompt') as any;
    mockEvent.preventDefault = jest.fn();
    mockEvent.prompt = jest.fn().mockResolvedValue(undefined);
    mockEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

    await act(async () => {
      window.dispatchEvent(mockEvent);
    });

    expect(result.current.isInstallable).toBe(true);

    await act(async () => {
      await result.current.promptInstall();
    });

    expect(mockEvent.prompt).toHaveBeenCalled();
    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });

  it('should store dismissal timestamp when dismissPrompt is called', async () => {
    const { result } = renderHook(() => usePWAInstall());

    const mockEvent = new Event('beforeinstallprompt') as any;
    mockEvent.preventDefault = jest.fn();
    mockEvent.prompt = jest.fn();
    mockEvent.userChoice = Promise.resolve({ outcome: 'dismissed' });

    await act(async () => {
      window.dispatchEvent(mockEvent);
    });

    expect(result.current.isInstallable).toBe(true);

    const beforeDismiss = Date.now();

    act(() => {
      result.current.dismissPrompt();
    });

    const dismissedAt = localStorageMock.getItem('pwa-install-dismissed');
    expect(dismissedAt).not.toBeNull();
    expect(parseInt(dismissedAt!, 10)).toBeGreaterThanOrEqual(beforeDismiss);
    expect(result.current.isInstallable).toBe(false);
  });

  it('should not show install prompt if dismissed within 7 days', async () => {
    // Set dismissal timestamp to 3 days ago
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    localStorageMock.setItem('pwa-install-dismissed', threeDaysAgo.toString());

    const { result } = renderHook(() => usePWAInstall());

    // The hook should set up event listeners but not set isInstallable
    expect(result.current.isInstallable).toBe(false);

    // Even if event fires, it should not become installable
    const mockEvent = new Event('beforeinstallprompt') as any;
    mockEvent.preventDefault = jest.fn();

    await act(async () => {
      window.dispatchEvent(mockEvent);
    });

    // Should remain not installable due to cooldown
    expect(result.current.isInstallable).toBe(false);
  });

  it('should show install prompt if dismissal was more than 7 days ago', async () => {
    // Set dismissal timestamp to 8 days ago
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    localStorageMock.setItem('pwa-install-dismissed', eightDaysAgo.toString());

    const { result } = renderHook(() => usePWAInstall());

    const mockEvent = new Event('beforeinstallprompt') as any;
    mockEvent.preventDefault = jest.fn();
    mockEvent.prompt = jest.fn();
    mockEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

    await act(async () => {
      window.dispatchEvent(mockEvent);
    });

    // Cooldown should have expired, should become installable
    expect(result.current.isInstallable).toBe(true);
    
    // localStorage key should be removed when the event handler runs
    expect(localStorageMock.getItem('pwa-install-dismissed')).toBeNull();
  });

  it('should set isInstalled when appinstalled event fires', async () => {
    const { result } = renderHook(() => usePWAInstall());

    const mockEvent = new Event('beforeinstallprompt') as any;
    mockEvent.preventDefault = jest.fn();
    mockEvent.prompt = jest.fn();
    mockEvent.userChoice = Promise.resolve({ outcome: 'accepted' });

    await act(async () => {
      window.dispatchEvent(mockEvent);
    });

    expect(result.current.isInstallable).toBe(true);

    await act(async () => {
      window.dispatchEvent(new Event('appinstalled'));
    });

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.isInstallable).toBe(false);
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => usePWAInstall());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'appinstalled',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });
});
