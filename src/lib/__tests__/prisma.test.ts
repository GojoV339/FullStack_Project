/**
 * Tests for Prisma client singleton
 * Validates: Requirements 36
 */

import { prisma } from '../prisma';

describe('Prisma Client Singleton', () => {
  it('should export a PrismaClient instance', () => {
    expect(prisma).toBeDefined();
    expect(prisma).toHaveProperty('$connect');
    expect(prisma).toHaveProperty('$disconnect');
  });

  it('should have all required models', () => {
    expect(prisma).toHaveProperty('student');
    expect(prisma).toHaveProperty('cafeteria');
    expect(prisma).toHaveProperty('menuItem');
    expect(prisma).toHaveProperty('order');
    expect(prisma).toHaveProperty('orderItem');
    expect(prisma).toHaveProperty('payment');
    expect(prisma).toHaveProperty('staff');
    expect(prisma).toHaveProperty('pushSubscription');
  });

  it('should return the same instance on multiple imports', () => {
    // In development, the singleton should be stored in globalThis
    // This test verifies the singleton pattern is working
    const { prisma: prisma1 } = require('../prisma');
    const { prisma: prisma2 } = require('../prisma');
    
    expect(prisma1).toBe(prisma2);
  });
});
