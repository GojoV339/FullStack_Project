import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getStudentSession } from '@/lib/jwt';
import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    pushSubscription: {
      upsert: jest.fn(),
    },
  },
}));

jest.mock('@/lib/jwt', () => ({
  getStudentSession: jest.fn(),
}));

describe('POST /api/push/subscribe', () => {
  const mockStudentSession = {
    sub: 'student-123',
    role: 'student' as const,
    registrationNumber: 'AM.EN.U4CSE21001',
  };

  const validSubscription = {
    subscription: {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
      keys: {
        p256dh: 'test-p256dh-key',
        auth: 'test-auth-key',
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create push subscription for authenticated student', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue(mockStudentSession);
    (prisma.pushSubscription.upsert as jest.Mock).mockResolvedValue({
      id: 'sub-123',
      studentId: 'student-123',
      subscription: JSON.stringify(validSubscription.subscription),
      createdAt: new Date(),
    });

    const request = new NextRequest('http://localhost:3000/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(validSubscription),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(prisma.pushSubscription.upsert).toHaveBeenCalledWith({
      where: { studentId: 'student-123' },
      update: {
        subscription: JSON.stringify(validSubscription.subscription),
      },
      create: {
        studentId: 'student-123',
        subscription: JSON.stringify(validSubscription.subscription),
      },
    });
  });

  it('should return 401 when not authenticated', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(validSubscription),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(prisma.pushSubscription.upsert).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid subscription data', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue(mockStudentSession);

    const invalidSubscription = {
      subscription: {
        endpoint: 'not-a-url',
        keys: {
          p256dh: 'test-key',
        },
      },
    };

    const request = new NextRequest('http://localhost:3000/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(invalidSubscription),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(prisma.pushSubscription.upsert).not.toHaveBeenCalled();
  });

  it('should return 400 for missing endpoint', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue(mockStudentSession);

    const invalidSubscription = {
      subscription: {
        keys: {
          p256dh: 'test-p256dh-key',
          auth: 'test-auth-key',
        },
      },
    };

    const request = new NextRequest('http://localhost:3000/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(invalidSubscription),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
  });

  it('should return 400 for missing keys', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue(mockStudentSession);

    const invalidSubscription = {
      subscription: {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
      },
    };

    const request = new NextRequest('http://localhost:3000/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(invalidSubscription),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
  });

  it('should update existing subscription for same student', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue(mockStudentSession);
    (prisma.pushSubscription.upsert as jest.Mock).mockResolvedValue({
      id: 'sub-123',
      studentId: 'student-123',
      subscription: JSON.stringify(validSubscription.subscription),
      createdAt: new Date(),
    });

    const request = new NextRequest('http://localhost:3000/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(validSubscription),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(prisma.pushSubscription.upsert).toHaveBeenCalledWith({
      where: { studentId: 'student-123' },
      update: {
        subscription: JSON.stringify(validSubscription.subscription),
      },
      create: {
        studentId: 'student-123',
        subscription: JSON.stringify(validSubscription.subscription),
      },
    });
  });

  it('should return 500 on database error', async () => {
    (getStudentSession as jest.Mock).mockResolvedValue(mockStudentSession);
    (prisma.pushSubscription.upsert as jest.Mock).mockRejectedValue(
      new Error('Database error')
    );

    const request = new NextRequest('http://localhost:3000/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(validSubscription),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
});
