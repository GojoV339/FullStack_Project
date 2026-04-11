import { NextRequest } from 'next/server';
import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getStudentSession } from '@/lib/jwt';
import { createCashfreeOrder } from '@/lib/cashfree';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    cafeteria: {
      findUnique: jest.fn(),
    },
    menuItem: {
      findMany: jest.fn(),
    },
    order: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/lib/jwt', () => ({
  getStudentSession: jest.fn(),
}));

jest.mock('@/lib/cashfree', () => ({
  createCashfreeOrder: jest.fn(),
}));

describe('POST /api/orders', () => {
  const mockStudentId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const mockCafeteriaId = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
  const mockMenuItemId1 = 'c3d4e5f6-a7b8-9012-cdef-123456789012';
  const mockMenuItemId2 = 'd4e5f6a7-b8c9-0123-def1-234567890123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        cafeteriaId: mockCafeteriaId,
        items: [{ menuItemId: mockMenuItemId1, quantity: 1 }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 if validation fails', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        cafeteriaId: 'invalid-uuid',
        items: [],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 if cafeteria is not available', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.cafeteria.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        cafeteriaId: mockCafeteriaId,
        items: [{ menuItemId: mockMenuItemId1, quantity: 1 }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Cafeteria is not available');
  });

  it('should return 400 if cafeteria is closed', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.cafeteria.findUnique as jest.Mock).mockResolvedValue({
      id: mockCafeteriaId,
      isOpen: false,
    });

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        cafeteriaId: mockCafeteriaId,
        items: [{ menuItemId: mockMenuItemId1, quantity: 1 }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Cafeteria is not available');
  });

  it('should return 400 if some menu items are not available', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.cafeteria.findUnique as jest.Mock).mockResolvedValue({
      id: mockCafeteriaId,
      isOpen: true,
    });
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue([
      {
        id: mockMenuItemId1,
        price: 50,
        cafeteriaId: mockCafeteriaId,
        isAvailable: true,
      },
    ]);

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        cafeteriaId: mockCafeteriaId,
        items: [
          { menuItemId: mockMenuItemId1, quantity: 1 },
          { menuItemId: mockMenuItemId2, quantity: 1 },
        ],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Some menu items are not available');
  });

  it('should create order with correct Order_Number format', async () => {
    const mockCafeteria = {
      id: mockCafeteriaId,
      name: 'Samridhi',
      location: 'Main Block',
      isOpen: true,
    };

    const mockMenuItems = [
      {
        id: mockMenuItemId1,
        name: 'Masala Dosa',
        category: 'South Indian',
        price: 50,
        imageUrl: '/dosa.jpg',
        cafeteriaId: mockCafeteriaId,
        isAvailable: true,
      },
    ];

    const mockStudent = {
      id: mockStudentId,
      registrationNumber: 'CB.EN.U4CSE21001',
      name: 'Test Student',
      phone: '9999999999',
    };

    const mockOrder = {
      id: 'order-123',
      orderNumber: 'AF-2025-0001',
      studentId: mockStudentId,
      cafeteriaId: mockCafeteriaId,
      tokenNumber: 1,
      totalAmount: 50,
      paymentStatus: 'PENDING',
      orderStatus: 'AWAITING_PAYMENT',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      createdAt: new Date(),
      items: [
        {
          id: 'order-item-1',
          quantity: 1,
          unitPrice: 50,
          menuItem: mockMenuItems[0],
        },
      ],
      cafeteria: mockCafeteria,
    };

    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.cafeteria.findUnique as jest.Mock).mockResolvedValue(mockCafeteria);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);
    (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.payment.create as jest.Mock).mockResolvedValue({});
    (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
    (createCashfreeOrder as jest.Mock).mockResolvedValue({
      payment_session_id: 'session-123',
    });

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        cafeteriaId: mockCafeteriaId,
        items: [{ menuItemId: mockMenuItemId1, quantity: 1 }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order.orderNumber).toMatch(/^AF-\d{4}-\d{4}$/);
    expect(data.order.orderNumber).toBe('AF-2025-0001');
  });

  it('should generate sequential Order_Number for same day', async () => {
    const mockCafeteria = {
      id: mockCafeteriaId,
      name: 'Samridhi',
      location: 'Main Block',
      isOpen: true,
    };

    const mockMenuItems = [
      {
        id: mockMenuItemId1,
        name: 'Masala Dosa',
        category: 'South Indian',
        price: 50,
        imageUrl: '/dosa.jpg',
        cafeteriaId: mockCafeteriaId,
        isAvailable: true,
      },
    ];

    const mockStudent = {
      id: mockStudentId,
      registrationNumber: 'CB.EN.U4CSE21001',
      name: 'Test Student',
      phone: '9999999999',
    };

    const mockLastOrder = {
      orderNumber: 'AF-2025-0005',
    };

    const mockOrder = {
      id: 'order-123',
      orderNumber: 'AF-2025-0006',
      studentId: mockStudentId,
      cafeteriaId: mockCafeteriaId,
      tokenNumber: 2,
      totalAmount: 50,
      paymentStatus: 'PENDING',
      orderStatus: 'AWAITING_PAYMENT',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      createdAt: new Date(),
      items: [
        {
          id: 'order-item-1',
          quantity: 1,
          unitPrice: 50,
          menuItem: mockMenuItems[0],
        },
      ],
      cafeteria: mockCafeteria,
    };

    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.cafeteria.findUnique as jest.Mock).mockResolvedValue(mockCafeteria);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);
    (prisma.order.findFirst as jest.Mock)
      .mockResolvedValueOnce({ tokenNumber: 1 })
      .mockResolvedValueOnce(mockLastOrder);
    (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.payment.create as jest.Mock).mockResolvedValue({});
    (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
    (createCashfreeOrder as jest.Mock).mockResolvedValue({
      payment_session_id: 'session-123',
    });

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        cafeteriaId: mockCafeteriaId,
        items: [{ menuItemId: mockMenuItemId1, quantity: 1 }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order.orderNumber).toBe('AF-2025-0006');
  });

  it('should create order with AWAITING_PAYMENT status', async () => {
    const mockCafeteria = {
      id: mockCafeteriaId,
      name: 'Samridhi',
      location: 'Main Block',
      isOpen: true,
    };

    const mockMenuItems = [
      {
        id: mockMenuItemId1,
        name: 'Masala Dosa',
        category: 'South Indian',
        price: 50,
        imageUrl: '/dosa.jpg',
        cafeteriaId: mockCafeteriaId,
        isAvailable: true,
      },
    ];

    const mockStudent = {
      id: mockStudentId,
      registrationNumber: 'CB.EN.U4CSE21001',
      name: 'Test Student',
      phone: '9999999999',
    };

    const mockOrder = {
      id: 'order-123',
      orderNumber: 'AF-2025-0001',
      studentId: mockStudentId,
      cafeteriaId: mockCafeteriaId,
      tokenNumber: 1,
      totalAmount: 50,
      paymentStatus: 'PENDING',
      orderStatus: 'AWAITING_PAYMENT',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      createdAt: new Date(),
      items: [
        {
          id: 'order-item-1',
          quantity: 1,
          unitPrice: 50,
          menuItem: mockMenuItems[0],
        },
      ],
      cafeteria: mockCafeteria,
    };

    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.cafeteria.findUnique as jest.Mock).mockResolvedValue(mockCafeteria);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);
    (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.payment.create as jest.Mock).mockResolvedValue({});
    (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
    (createCashfreeOrder as jest.Mock).mockResolvedValue({
      payment_session_id: 'session-123',
    });

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        cafeteriaId: mockCafeteriaId,
        items: [{ menuItemId: mockMenuItemId1, quantity: 1 }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order.orderStatus).toBe('AWAITING_PAYMENT');
  });

  it('should set expiresAt to 5 minutes from now', async () => {
    const mockCafeteria = {
      id: mockCafeteriaId,
      name: 'Samridhi',
      location: 'Main Block',
      isOpen: true,
    };

    const mockMenuItems = [
      {
        id: mockMenuItemId1,
        name: 'Masala Dosa',
        category: 'South Indian',
        price: 50,
        imageUrl: '/dosa.jpg',
        cafeteriaId: mockCafeteriaId,
        isAvailable: true,
      },
    ];

    const mockStudent = {
      id: mockStudentId,
      registrationNumber: 'CB.EN.U4CSE21001',
      name: 'Test Student',
      phone: '9999999999',
    };

    const now = Date.now();
    const expiresAt = new Date(now + 5 * 60 * 1000);

    const mockOrder = {
      id: 'order-123',
      orderNumber: 'AF-2025-0001',
      studentId: mockStudentId,
      cafeteriaId: mockCafeteriaId,
      tokenNumber: 1,
      totalAmount: 50,
      paymentStatus: 'PENDING',
      orderStatus: 'AWAITING_PAYMENT',
      expiresAt,
      createdAt: new Date(now),
      items: [
        {
          id: 'order-item-1',
          quantity: 1,
          unitPrice: 50,
          menuItem: mockMenuItems[0],
        },
      ],
      cafeteria: mockCafeteria,
    };

    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.cafeteria.findUnique as jest.Mock).mockResolvedValue(mockCafeteria);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);
    (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.payment.create as jest.Mock).mockResolvedValue({});
    (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
    (createCashfreeOrder as jest.Mock).mockResolvedValue({
      payment_session_id: 'session-123',
    });

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        cafeteriaId: mockCafeteriaId,
        items: [{ menuItemId: mockMenuItemId1, quantity: 1 }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    const expiresAtTime = new Date(data.order.expiresAt).getTime();
    const createdAtTime = new Date(data.order.createdAt).getTime();
    const diffMinutes = (expiresAtTime - createdAtTime) / (1000 * 60);
    expect(diffMinutes).toBeCloseTo(5, 0);
  });

  it('should return order with items', async () => {
    const mockCafeteria = {
      id: mockCafeteriaId,
      name: 'Samridhi',
      location: 'Main Block',
      isOpen: true,
    };

    const mockMenuItems = [
      {
        id: mockMenuItemId1,
        name: 'Masala Dosa',
        category: 'South Indian',
        price: 50,
        imageUrl: '/dosa.jpg',
        cafeteriaId: mockCafeteriaId,
        isAvailable: true,
      },
      {
        id: mockMenuItemId2,
        name: 'Filter Coffee',
        category: 'Beverages',
        price: 20,
        imageUrl: '/coffee.jpg',
        cafeteriaId: mockCafeteriaId,
        isAvailable: true,
      },
    ];

    const mockStudent = {
      id: mockStudentId,
      registrationNumber: 'CB.EN.U4CSE21001',
      name: 'Test Student',
      phone: '9999999999',
    };

    const mockOrder = {
      id: 'order-123',
      orderNumber: 'AF-2025-0001',
      studentId: mockStudentId,
      cafeteriaId: mockCafeteriaId,
      tokenNumber: 1,
      totalAmount: 120,
      paymentStatus: 'PENDING',
      orderStatus: 'AWAITING_PAYMENT',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      createdAt: new Date(),
      items: [
        {
          id: 'order-item-1',
          quantity: 2,
          unitPrice: 50,
          menuItem: mockMenuItems[0],
        },
        {
          id: 'order-item-2',
          quantity: 1,
          unitPrice: 20,
          menuItem: mockMenuItems[1],
        },
      ],
      cafeteria: mockCafeteria,
    };

    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.cafeteria.findUnique as jest.Mock).mockResolvedValue(mockCafeteria);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);
    (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.payment.create as jest.Mock).mockResolvedValue({});
    (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
    (createCashfreeOrder as jest.Mock).mockResolvedValue({
      payment_session_id: 'session-123',
    });

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        cafeteriaId: mockCafeteriaId,
        items: [
          { menuItemId: mockMenuItemId1, quantity: 2 },
          { menuItemId: mockMenuItemId2, quantity: 1 },
        ],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order.items).toHaveLength(2);
    expect(data.order.items[0].quantity).toBe(2);
    expect(data.order.items[0].unitPrice).toBe(50);
    expect(data.order.items[0].menuItem.name).toBe('Masala Dosa');
    expect(data.order.items[1].quantity).toBe(1);
    expect(data.order.items[1].unitPrice).toBe(20);
    expect(data.order.items[1].menuItem.name).toBe('Filter Coffee');
  });

  it('should calculate total amount from database prices', async () => {
    const mockCafeteria = {
      id: mockCafeteriaId,
      name: 'Samridhi',
      location: 'Main Block',
      isOpen: true,
    };

    const mockMenuItems = [
      {
        id: mockMenuItemId1,
        name: 'Masala Dosa',
        category: 'South Indian',
        price: 50,
        imageUrl: '/dosa.jpg',
        cafeteriaId: mockCafeteriaId,
        isAvailable: true,
      },
    ];

    const mockStudent = {
      id: mockStudentId,
      registrationNumber: 'CB.EN.U4CSE21001',
      name: 'Test Student',
      phone: '9999999999',
    };

    const mockOrder = {
      id: 'order-123',
      orderNumber: 'AF-2025-0001',
      studentId: mockStudentId,
      cafeteriaId: mockCafeteriaId,
      tokenNumber: 1,
      totalAmount: 150,
      paymentStatus: 'PENDING',
      orderStatus: 'AWAITING_PAYMENT',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      createdAt: new Date(),
      items: [
        {
          id: 'order-item-1',
          quantity: 3,
          unitPrice: 50,
          menuItem: mockMenuItems[0],
        },
      ],
      cafeteria: mockCafeteria,
    };

    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.cafeteria.findUnique as jest.Mock).mockResolvedValue(mockCafeteria);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);
    (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.payment.create as jest.Mock).mockResolvedValue({});
    (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
    (createCashfreeOrder as jest.Mock).mockResolvedValue({
      payment_session_id: 'session-123',
    });

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        cafeteriaId: mockCafeteriaId,
        items: [{ menuItemId: mockMenuItemId1, quantity: 3 }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order.totalAmount).toBe(150);
  });

  it('should handle Cashfree order creation failure gracefully', async () => {
    const mockCafeteria = {
      id: mockCafeteriaId,
      name: 'Samridhi',
      location: 'Main Block',
      isOpen: true,
    };

    const mockMenuItems = [
      {
        id: mockMenuItemId1,
        name: 'Masala Dosa',
        category: 'South Indian',
        price: 50,
        imageUrl: '/dosa.jpg',
        cafeteriaId: mockCafeteriaId,
        isAvailable: true,
      },
    ];

    const mockStudent = {
      id: mockStudentId,
      registrationNumber: 'CB.EN.U4CSE21001',
      name: 'Test Student',
      phone: '9999999999',
    };

    const mockOrder = {
      id: 'order-123',
      orderNumber: 'AF-2025-0001',
      studentId: mockStudentId,
      cafeteriaId: mockCafeteriaId,
      tokenNumber: 1,
      totalAmount: 50,
      paymentStatus: 'PENDING',
      orderStatus: 'AWAITING_PAYMENT',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      createdAt: new Date(),
      items: [
        {
          id: 'order-item-1',
          quantity: 1,
          unitPrice: 50,
          menuItem: mockMenuItems[0],
        },
      ],
      cafeteria: mockCafeteria,
    };

    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.cafeteria.findUnique as jest.Mock).mockResolvedValue(mockCafeteria);
    (prisma.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);
    (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.payment.create as jest.Mock).mockResolvedValue({});
    (prisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
    (createCashfreeOrder as jest.Mock).mockRejectedValue(
      new Error('Cashfree API error')
    );

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        cafeteriaId: mockCafeteriaId,
        items: [{ menuItemId: mockMenuItemId1, quantity: 1 }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.order).toBeDefined();
    expect(data.cashfreeSessionId).toBe('');
  });

  it('should handle database errors gracefully', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue({ sub: mockStudentId });
    (prisma.cafeteria.findUnique as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    );

    const request = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        cafeteriaId: mockCafeteriaId,
        items: [{ menuItemId: mockMenuItemId1, quantity: 1 }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
