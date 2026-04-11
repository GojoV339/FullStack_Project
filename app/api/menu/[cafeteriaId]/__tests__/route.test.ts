import { GET } from '../route';
import { prisma } from '@/lib/prisma';
import { getStudentSession } from '@/lib/jwt';
import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    student: {
      findUnique: jest.fn(),
    },
    menuItem: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/jwt', () => ({
  getStudentSession: jest.fn(),
}));

describe('GET /api/menu/[cafeteriaId]', () => {
  const mockCafeteriaId = 'cafeteria-123';
  const mockRequest = {} as NextRequest;
  const mockParams = { params: { cafeteriaId: mockCafeteriaId } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockMenuItem = (overrides = {}) => ({
    id: 'item-1',
    cafeteriaId: mockCafeteriaId,
    name: 'Test Item',
    section: 'SNACK',
    category: 'Snacks',
    price: 50,
    imageUrl: null,
    etaMinutes: 0,
    isCombo: false,
    isPriorityOnly: false,
    isAvailable: true,
    ...overrides,
  });

  it('should fetch menu items for specific cafeteria', async () => {
    const mockMenuItems = [
      createMockMenuItem({ id: 'item-1', name: 'Samosa' }),
      createMockMenuItem({ id: 'item-2', name: 'Chai' }),
    ];

    (getStudentSession as jest.Mock).mockResolvedValue(null);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);

    const response = await GET(mockRequest, mockParams);
    const data = await response.json();

    expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
      where: { cafeteriaId: mockCafeteriaId, isAvailable: true },
      orderBy: [{ isCombo: 'desc' }, { category: 'asc' }, { name: 'asc' }],
    });

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('snacks');
    expect(data).toHaveProperty('cookToOrder');
    expect(data).toHaveProperty('combos');
    expect(data).toHaveProperty('specialOffers');
  });

  it('should filter by isAvailable true', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue(null);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue([]);

    await GET(mockRequest, mockParams);

    expect(prisma.menuItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isAvailable: true,
        }),
      })
    );
  });

  it('should group menu items by section - SNACK', async () => {
    const mockMenuItems = [
      createMockMenuItem({ id: 'item-1', name: 'Samosa', section: 'SNACK' }),
      createMockMenuItem({ id: 'item-2', name: 'Chai', section: 'SNACK' }),
    ];

    (getStudentSession as jest.Mock).mockResolvedValue(null);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);

    const response = await GET(mockRequest, mockParams);
    const data = await response.json();

    expect(data.snacks).toHaveLength(2);
    expect(data.snacks[0].name).toBe('Samosa');
    expect(data.snacks[1].name).toBe('Chai');
  });

  it('should group menu items by section - COOK_TO_ORDER', async () => {
    const mockMenuItems = [
      createMockMenuItem({
        id: 'item-1',
        name: 'Dosa',
        section: 'COOK_TO_ORDER',
        etaMinutes: 10,
      }),
      createMockMenuItem({
        id: 'item-2',
        name: 'Idli',
        section: 'COOK_TO_ORDER',
        etaMinutes: 8,
      }),
    ];

    (getStudentSession as jest.Mock).mockResolvedValue(null);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);

    const response = await GET(mockRequest, mockParams);
    const data = await response.json();

    expect(data.cookToOrder).toHaveLength(2);
    expect(data.cookToOrder[0].name).toBe('Dosa');
    expect(data.cookToOrder[1].name).toBe('Idli');
  });

  it('should separate combo items', async () => {
    const mockMenuItems = [
      createMockMenuItem({
        id: 'combo-1',
        name: 'Meal Combo',
        isCombo: true,
        section: 'SNACK',
      }),
      createMockMenuItem({ id: 'item-1', name: 'Samosa', section: 'SNACK' }),
    ];

    (getStudentSession as jest.Mock).mockResolvedValue(null);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);

    const response = await GET(mockRequest, mockParams);
    const data = await response.json();

    expect(data.combos).toHaveLength(1);
    expect(data.combos[0].name).toBe('Meal Combo');
    expect(data.snacks).toHaveLength(1);
    expect(data.snacks[0].name).toBe('Samosa');
  });

  it('should separate priority pass items', async () => {
    const mockMenuItems = [
      createMockMenuItem({
        id: 'priority-1',
        name: 'Premium Coffee',
        isPriorityOnly: true,
        section: 'SNACK',
      }),
      createMockMenuItem({ id: 'item-1', name: 'Regular Coffee', section: 'SNACK' }),
    ];

    (getStudentSession as jest.Mock).mockResolvedValue(null);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);

    const response = await GET(mockRequest, mockParams);
    const data = await response.json();

    expect(data.specialOffers).toHaveLength(1);
    expect(data.specialOffers[0].name).toBe('Premium Coffee');
  });

  it('should convert Decimal price to number', async () => {
    const mockMenuItems = [
      createMockMenuItem({ id: 'item-1', name: 'Samosa', price: 25.5 }),
    ];

    (getStudentSession as jest.Mock).mockResolvedValue(null);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);

    const response = await GET(mockRequest, mockParams);
    const data = await response.json();

    expect(typeof data.snacks[0].price).toBe('number');
    expect(data.snacks[0].price).toBe(25.5);
  });

  it('should check subscription status when student is logged in', async () => {
    const mockSession = { sub: 'student-123', role: 'student' };
    const mockStudent = { subscriptionStatus: 'ACTIVE' };

    (getStudentSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET(mockRequest, mockParams);
    const data = await response.json();

    expect(prisma.student.findUnique).toHaveBeenCalledWith({
      where: { id: 'student-123' },
      select: { subscriptionStatus: true },
    });

    expect(data.isSubscribed).toBe(true);
  });

  it('should return isSubscribed false when student is not logged in', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue(null);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET(mockRequest, mockParams);
    const data = await response.json();

    expect(data.isSubscribed).toBe(false);
  });

  it('should return isSubscribed false when subscription is INACTIVE', async () => {
    const mockSession = { sub: 'student-123', role: 'student' };
    const mockStudent = { subscriptionStatus: 'INACTIVE' };

    (getStudentSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET(mockRequest, mockParams);
    const data = await response.json();

    expect(data.isSubscribed).toBe(false);
  });

  it('should handle database errors gracefully', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue(null);
    (prisma.menuItem.findMany as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    );

    const response = await GET(mockRequest, mockParams);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });

  it('should return empty arrays when no menu items exist', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue(null);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET(mockRequest, mockParams);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.snacks).toEqual([]);
    expect(data.cookToOrder).toEqual([]);
    expect(data.combos).toEqual([]);
    expect(data.specialOffers).toEqual([]);
  });

  it('should order items correctly - combos first, then by category and name', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue(null);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue([]);

    await GET(mockRequest, mockParams);

    expect(prisma.menuItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ isCombo: 'desc' }, { category: 'asc' }, { name: 'asc' }],
      })
    );
  });
});
