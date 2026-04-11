// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Set up test environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock ResizeObserver for React Three Fiber
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    // Mock implementation
  }
  unobserve() {
    // Mock implementation
  }
  disconnect() {
    // Mock implementation
  }
};

