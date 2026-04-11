import { NextRequest } from 'next/server';
import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getStudentSession } from '@/lib/jwt';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/jwt', () => ({
  getStudentSession: jest.fn(),
}));

describe('POST /api/orders/[id]/expire', () => {
  const mockStudentId = 'student-123';
  const mockOrderId = 'order-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/orders/order-456/expire', {
      method: 'POST',
    });
    const response = await POST(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 404 if order not found', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/orders/order-456/expire', {
      method: 'POST',
    });
    const response = await POST(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Order not found');
  });

  it('should return 403 if order belongs to different student', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findUnique as jest.Mock).mockResolvedValue({
      id: mockOrderId,
      studentId: 'different-student',
      orderStatus: 'AWAITING_PAYMENT',
      cafeteria: { id: 'caf-1', name: 'Samridhi', location: 'Main Block' },
      items: [],
    });

    const request = new NextRequest('http://localhost:3000/api/orders/order-456/expire', {
      method: 'POST',
    });
    const response = await POST(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('should return 400 if order is not AWAITING_PAYMENT', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findUnique as jest.Mock).mockResolvedValue({
      id: mockOrderId,
      studentId: mockStudentId,
      orderStatus: 'CONFIRMED',
      cafeteria: { id: 'caf-1', name: 'Samridhi', location: 'Main Block' },
      items: [],
    });

    const request = new NextRequest('http://localhost:3000/api/orders/order-456/expire', {
      method: 'POST',
    });
    const response = await POST(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Order cannot be expired');
  });

  it('should expire order and return updated order', async () => {
    const mockOrder = {
      id: mockOrderId,
      studentId: mockStudentId,
      orderNumber: 'AF-2024-0001',
      tokenNumber: 0,
      totalAmount: 150.5,
      paymentStatus: 'PENDING',
      orderStatus: 'AWAITING_PAYMENT',
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

    const updatedOrder = {
      ...mockOrder,
      orderStatus: 'CANCELLED',
      paymentStatus: 'EXPIRED',
    };

    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.order.update as jest.Mock).mockResolvedValue(updatedOrder);

    const request = new NextRequest('http://localhost:3000/api/orders/order-456/expire', {
      method: 'POST',
    });
    const response = await POST(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order).toBeDefined();
    expect(data.order.orderStatus).toBe('CANCELLED');
    expect(data.order.paymentStatus).toBe('EXPIRED');
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: mockOrderId },
      data: {
        orderStatus: 'CANCELLED',
        paymentStatus: 'EXPIRED',
      },
      include: expect.any(Object),
    });
  });
});
