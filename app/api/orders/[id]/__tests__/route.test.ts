import { NextRequest } from 'next/server';
import { GET } from '../route';
import { prisma } from '@/lib/prisma';
import { getStudentSession } from '@/lib/jwt';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/lib/jwt', () => ({
  getStudentSession: jest.fn(),
}));

describe('GET /api/orders/[id]', () => {
  const mockStudentId = 'student-123';
  const mockOrderId = 'order-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/orders/order-456');
    const response = await GET(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 404 if order not found', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/orders/order-456');
    const response = await GET(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Order not found');
  });

  it('should return 403 if order belongs to different student', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findUnique as jest.Mock).mockResolvedValue({
      id: mockOrderId,
      studentId: 'different-student',
      tokenNumber: 42,
      totalAmount: 150.5,
      orderStatus: 'CONFIRMED',
      cafeteria: { id: 'caf-1', name: 'Samridhi', location: 'Main Block' },
      items: [],
    });

    const request = new NextRequest('http://localhost:3000/api/orders/order-456');
    const response = await GET(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('should return order data if authenticated and authorized', async () => {
    const mockOrder = {
      id: mockOrderId,
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
        isOpen: true,
        avgWaitMinutes: 10,
      },
      items: [
        {
          id: 'item-1',
          menuItem: {
            id: 'menu-1',
            name: 'Masala Dosa',
            imageUrl: '/dosa.jpg',
            category: 'South Indian',
          },
          quantity: 2,
          unitPrice: 75.25,
        },
      ],
    };

    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

    const request = new NextRequest('http://localhost:3000/api/orders/order-456');
    const response = await GET(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order).toBeDefined();
    expect(data.order.id).toBe(mockOrderId);
    expect(data.order.tokenNumber).toBe(42);
    expect(data.order.totalAmount).toBe(150.5);
    expect(data.order.items[0].unitPrice).toBe(75.25);
  });
});
