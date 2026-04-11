import { NextRequest } from 'next/server';
import { GET } from '../route';
import { prisma } from '@/lib/prisma';
import { getStudentSession } from '@/lib/jwt';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/jwt', () => ({
  getStudentSession: jest.fn(),
}));

describe('GET /api/orders/my', () => {
  const mockStudentId = 'student-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/orders/my');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should fetch orders for authenticated student', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        studentId: mockStudentId,
        tokenNumber: 42,
        totalAmount: 150.5,
        paymentStatus: 'PAID',
        orderStatus: 'CONFIRMED',
        expiresAt: new Date('2024-01-01T12:00:00Z'),
        createdAt: new Date('2024-01-01T11:55:00Z'),
        cafeteria: {
          id: 'caf-1',
          name: 'Samridhi',
          location: 'Main Block',
        },
        items: [
          {
            id: 'item-1',
            menuItem: {
              name: 'Masala Dosa',
              imageUrl: '/dosa.jpg',
            },
            quantity: 2,
            unitPrice: 75.25,
          },
        ],
      },
    ];

    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders);

    const request = new NextRequest('http://localhost:3000/api/orders/my');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.orders).toBeDefined();
    expect(data.orders).toHaveLength(1);
    expect(data.orders[0].id).toBe('order-1');
    expect(data.orders[0].totalAmount).toBe(150.5);
    expect(data.orders[0].items[0].unitPrice).toBe(75.25);
  });

  it('should sort orders by createdAt descending', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/orders/my');
    await GET(request);

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    );
  });

  it('should implement pagination with 20 items per page by default', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/orders/my');
    await GET(request);

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 20,
        skip: 0,
      })
    );
  });

  it('should handle page parameter for pagination', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/orders/my?page=2');
    await GET(request);

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 20,
        skip: 20,
      })
    );
  });

  it('should handle page 3 parameter correctly', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/orders/my?page=3');
    await GET(request);

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 20,
        skip: 40,
      })
    );
  });

  it('should include cafeteria relation', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/orders/my');
    await GET(request);

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          cafeteria: {
            select: { id: true, name: true, location: true },
          },
        }),
      })
    );
  });

  it('should include items relation with menuItem details', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/orders/my');
    await GET(request);

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          items: {
            include: {
              menuItem: {
                select: { name: true, imageUrl: true },
              },
            },
          },
        }),
      })
    );
  });

  it('should filter orders by authenticated student ID', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/orders/my');
    await GET(request);

    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { studentId: mockStudentId },
      })
    );
  });

  it('should return empty array when no orders exist', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/orders/my');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.orders).toEqual([]);
  });

  it('should handle database errors gracefully', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findMany as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    );

    const request = new NextRequest('http://localhost:3000/api/orders/my');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('should serialize Decimal fields to numbers', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        studentId: mockStudentId,
        tokenNumber: 42,
        totalAmount: 150.5,
        paymentStatus: 'PAID',
        orderStatus: 'CONFIRMED',
        expiresAt: new Date('2024-01-01T12:00:00Z'),
        createdAt: new Date('2024-01-01T11:55:00Z'),
        cafeteria: {
          id: 'caf-1',
          name: 'Samridhi',
          location: 'Main Block',
        },
        items: [
          {
            id: 'item-1',
            menuItem: {
              name: 'Masala Dosa',
              imageUrl: '/dosa.jpg',
            },
            quantity: 2,
            unitPrice: 75.25,
          },
        ],
      },
    ];

    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders);

    const request = new NextRequest('http://localhost:3000/api/orders/my');
    const response = await GET(request);
    const data = await response.json();

    expect(typeof data.orders[0].totalAmount).toBe('number');
    expect(typeof data.orders[0].items[0].unitPrice).toBe('number');
  });
});
