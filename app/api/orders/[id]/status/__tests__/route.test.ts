import { NextRequest } from 'next/server';
import { PATCH } from '../route';
import { prisma } from '@/lib/prisma';
import { getStaffSession } from '@/lib/jwt';
import { sendPushToStudent } from '@/lib/push';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/jwt', () => ({
  getStaffSession: jest.fn(),
}));

jest.mock('@/lib/push', () => ({
  sendPushToStudent: jest.fn(),
}));

describe('PATCH /api/orders/[id]/status', () => {
  const mockOrderId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const mockStudentId = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
  const mockCafeteriaId = 'c3d4e5f6-a7b8-9012-cdef-123456789012';
  const mockStaffId = 'd4e5f6a7-b8c9-0123-def1-234567890123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated as staff', async () => {
    (getStaffSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest(
      `http://localhost:3000/api/orders/${mockOrderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus: 'PREPARING' }),
      }
    );

    const response = await PATCH(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 if validation fails', async () => {
    (getStaffSession as jest.Mock).mockResolvedValue({
      sub: mockStaffId,
      role: 'staff',
    });

    const request = new NextRequest(
      `http://localhost:3000/api/orders/${mockOrderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus: 'INVALID_STATUS' }),
      }
    );

    const response = await PATCH(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 404 if order not found', async () => {
    (getStaffSession as jest.Mock).mockResolvedValue({
      sub: mockStaffId,
      role: 'staff',
    });
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest(
      `http://localhost:3000/api/orders/${mockOrderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus: 'PREPARING' }),
      }
    );

    const response = await PATCH(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Order not found');
  });

  it('should update order status to PREPARING', async () => {
    const mockOrder = {
      id: mockOrderId,
      orderNumber: 'AF-2025-0001',
      studentId: mockStudentId,
      cafeteriaId: mockCafeteriaId,
      tokenNumber: 1,
      totalAmount: 100,
      orderStatus: 'CONFIRMED',
      cafeteria: {
        id: mockCafeteriaId,
        name: 'Samridhi',
        location: 'Main Block',
      },
    };

    const mockUpdatedOrder = {
      ...mockOrder,
      orderStatus: 'PREPARING',
    };

    (getStaffSession as jest.Mock).mockResolvedValue({
      sub: mockStaffId,
      role: 'staff',
    });
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.order.update as jest.Mock).mockResolvedValue(mockUpdatedOrder);

    const request = new NextRequest(
      `http://localhost:3000/api/orders/${mockOrderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus: 'PREPARING' }),
      }
    );

    const response = await PATCH(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order.orderStatus).toBe('PREPARING');
    expect(sendPushToStudent).toHaveBeenCalledWith(
      mockStudentId,
      '👨‍🍳 Preparing Your Order',
      'Your order is now being prepared at Samridhi.'
    );
  });

  it('should update order status to READY and send push notification', async () => {
    const mockOrder = {
      id: mockOrderId,
      orderNumber: 'AF-2025-0001',
      studentId: mockStudentId,
      cafeteriaId: mockCafeteriaId,
      tokenNumber: 1,
      totalAmount: 100,
      orderStatus: 'PREPARING',
      cafeteria: {
        id: mockCafeteriaId,
        name: 'Samridhi',
        location: 'Main Block',
      },
    };

    const mockUpdatedOrder = {
      ...mockOrder,
      orderStatus: 'READY',
    };

    (getStaffSession as jest.Mock).mockResolvedValue({
      sub: mockStaffId,
      role: 'staff',
    });
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.order.update as jest.Mock).mockResolvedValue(mockUpdatedOrder);

    const request = new NextRequest(
      `http://localhost:3000/api/orders/${mockOrderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus: 'READY' }),
      }
    );

    const response = await PATCH(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order.orderStatus).toBe('READY');
    expect(sendPushToStudent).toHaveBeenCalledWith(
      mockStudentId,
      '🔔 Order Ready!',
      'Token #1 is ready for pickup at Samridhi!'
    );
  });

  it('should update order status to COLLECTED and send push notification', async () => {
    const mockOrder = {
      id: mockOrderId,
      orderNumber: 'AF-2025-0001',
      studentId: mockStudentId,
      cafeteriaId: mockCafeteriaId,
      tokenNumber: 1,
      totalAmount: 100,
      orderStatus: 'READY',
      cafeteria: {
        id: mockCafeteriaId,
        name: 'Samridhi',
        location: 'Main Block',
      },
    };

    const mockUpdatedOrder = {
      ...mockOrder,
      orderStatus: 'COLLECTED',
    };

    (getStaffSession as jest.Mock).mockResolvedValue({
      sub: mockStaffId,
      role: 'staff',
    });
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.order.update as jest.Mock).mockResolvedValue(mockUpdatedOrder);

    const request = new NextRequest(
      `http://localhost:3000/api/orders/${mockOrderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus: 'COLLECTED' }),
      }
    );

    const response = await PATCH(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order.orderStatus).toBe('COLLECTED');
    expect(sendPushToStudent).toHaveBeenCalledWith(
      mockStudentId,
      '✨ Order Collected',
      'Thank you for using Amrita Feast! Enjoy your meal!'
    );
  });

  it('should assign token number when status changes to CONFIRMED', async () => {
    const mockOrder = {
      id: mockOrderId,
      orderNumber: 'AF-2025-0001',
      studentId: mockStudentId,
      cafeteriaId: mockCafeteriaId,
      tokenNumber: 0, // No token number yet
      totalAmount: 100,
      orderStatus: 'AWAITING_PAYMENT',
      cafeteria: {
        id: mockCafeteriaId,
        name: 'Samridhi',
        location: 'Main Block',
      },
    };

    const mockLastOrder = {
      tokenNumber: 5,
    };

    const mockUpdatedOrder = {
      ...mockOrder,
      orderStatus: 'CONFIRMED',
      tokenNumber: 6,
    };

    (getStaffSession as jest.Mock).mockResolvedValue({
      sub: mockStaffId,
      role: 'staff',
    });
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.order.findFirst as jest.Mock).mockResolvedValue(mockLastOrder);
    (prisma.order.update as jest.Mock).mockResolvedValue(mockUpdatedOrder);

    const request = new NextRequest(
      `http://localhost:3000/api/orders/${mockOrderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus: 'CONFIRMED' }),
      }
    );

    const response = await PATCH(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order.orderStatus).toBe('CONFIRMED');
    expect(data.order.tokenNumber).toBe(6);
    expect(sendPushToStudent).toHaveBeenCalledWith(
      mockStudentId,
      '✅ Order Confirmed!',
      'Token #6 is being prepared at Samridhi.'
    );
  });

  it('should not reassign token number if already exists when status changes to CONFIRMED', async () => {
    const mockOrder = {
      id: mockOrderId,
      orderNumber: 'AF-2025-0001',
      studentId: mockStudentId,
      cafeteriaId: mockCafeteriaId,
      tokenNumber: 3, // Already has token number
      totalAmount: 100,
      orderStatus: 'AWAITING_PAYMENT',
      cafeteria: {
        id: mockCafeteriaId,
        name: 'Samridhi',
        location: 'Main Block',
      },
    };

    const mockUpdatedOrder = {
      ...mockOrder,
      orderStatus: 'CONFIRMED',
    };

    (getStaffSession as jest.Mock).mockResolvedValue({
      sub: mockStaffId,
      role: 'staff',
    });
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.order.update as jest.Mock).mockResolvedValue(mockUpdatedOrder);

    const request = new NextRequest(
      `http://localhost:3000/api/orders/${mockOrderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus: 'CONFIRMED' }),
      }
    );

    const response = await PATCH(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order.orderStatus).toBe('CONFIRMED');
    expect(data.order.tokenNumber).toBe(3);
    expect(prisma.order.findFirst).not.toHaveBeenCalled();
  });

  it('should handle push notification failure gracefully', async () => {
    const mockOrder = {
      id: mockOrderId,
      orderNumber: 'AF-2025-0001',
      studentId: mockStudentId,
      cafeteriaId: mockCafeteriaId,
      tokenNumber: 1,
      totalAmount: 100,
      orderStatus: 'PREPARING',
      cafeteria: {
        id: mockCafeteriaId,
        name: 'Samridhi',
        location: 'Main Block',
      },
    };

    const mockUpdatedOrder = {
      ...mockOrder,
      orderStatus: 'READY',
    };

    (getStaffSession as jest.Mock).mockResolvedValue({
      sub: mockStaffId,
      role: 'staff',
    });
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.order.update as jest.Mock).mockResolvedValue(mockUpdatedOrder);
    (sendPushToStudent as jest.Mock).mockRejectedValue(
      new Error('Push notification failed')
    );

    const request = new NextRequest(
      `http://localhost:3000/api/orders/${mockOrderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus: 'READY' }),
      }
    );

    const response = await PATCH(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order.orderStatus).toBe('READY');
  });

  it('should handle database errors gracefully', async () => {
    (getStaffSession as jest.Mock).mockResolvedValue({
      sub: mockStaffId,
      role: 'staff',
    });
    (prisma.order.findUnique as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    );

    const request = new NextRequest(
      `http://localhost:3000/api/orders/${mockOrderId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus: 'PREPARING' }),
      }
    );

    const response = await PATCH(request, { params: { id: mockOrderId } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
