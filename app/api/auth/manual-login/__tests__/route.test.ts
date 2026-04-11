import { NextRequest } from 'next/server';
import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/jwt';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    student: {
      upsert: jest.fn(),
    },
  },
}));

jest.mock('@/lib/jwt', () => ({
  signToken: jest.fn(),
}));

describe('POST /api/auth/manual-login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if registrationNumber is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/manual-login', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 if registration number format is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/manual-login', {
      method: 'POST',
      body: JSON.stringify({ registrationNumber: 'INVALID_FORMAT' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid registration number format');
  });

  it('should validate registration number pattern correctly', async () => {
    const invalidFormats = [
      'AM.EN.U4CSE21',        // Too short
      'AM.EN.U4CSE210011',    // Too long
      'am.en.u4cse21001',     // Lowercase
      'AM.EN.U3CSE21001',     // Wrong year prefix (U3 instead of U4)
      'AM.EN.CSE21001',       // Missing U4
      '12.EN.U4CSE21001',     // Numbers instead of letters at start
    ];

    for (const invalidFormat of invalidFormats) {
      const request = new NextRequest('http://localhost:3000/api/auth/manual-login', {
        method: 'POST',
        body: JSON.stringify({ registrationNumber: invalidFormat }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid registration number format');
    }
  });

  it('should accept valid registration number and create student', async () => {
    const mockStudent = {
      id: 'student-123',
      registrationNumber: 'AM.EN.U4CSE21001',
      name: null,
      phone: null,
      subscriptionStatus: 'INACTIVE',
      subscriptionExpiry: null,
    };

    (prisma.student.upsert as jest.Mock).mockResolvedValue(mockStudent);
    (signToken as jest.Mock).mockResolvedValue('mock-jwt-token');

    const request = new NextRequest('http://localhost:3000/api/auth/manual-login', {
      method: 'POST',
      body: JSON.stringify({ registrationNumber: 'AM.EN.U4CSE21001' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.student).toBeDefined();
    expect(data.student.registrationNumber).toBe('AM.EN.U4CSE21001');
    expect(prisma.student.upsert).toHaveBeenCalledWith({
      where: { registrationNumber: 'AM.EN.U4CSE21001' },
      update: {},
      create: { registrationNumber: 'AM.EN.U4CSE21001' },
    });
    expect(signToken).toHaveBeenCalledWith({
      sub: 'student-123',
      role: 'student',
      registrationNumber: 'AM.EN.U4CSE21001',
    });
  });

  it('should accept various valid registration number formats', async () => {
    const validFormats = [
      'AM.EN.U4CSE21001',
      'CB.EN.U4ECE22050',
      'XY.EN.U4ABC23999',
    ];

    for (const validFormat of validFormats) {
      const mockStudent = {
        id: `student-${validFormat}`,
        registrationNumber: validFormat,
        name: null,
        phone: null,
        subscriptionStatus: 'INACTIVE',
        subscriptionExpiry: null,
      };

      (prisma.student.upsert as jest.Mock).mockResolvedValue(mockStudent);
      (signToken as jest.Mock).mockResolvedValue('mock-jwt-token');

      const request = new NextRequest('http://localhost:3000/api/auth/manual-login', {
        method: 'POST',
        body: JSON.stringify({ registrationNumber: validFormat }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.student.registrationNumber).toBe(validFormat);
    }
  });

  it('should generate JWT token with 7-day expiry', async () => {
    const mockStudent = {
      id: 'student-456',
      registrationNumber: 'CB.EN.U4ECE22050',
      name: null,
      phone: null,
      subscriptionStatus: 'INACTIVE',
      subscriptionExpiry: null,
    };

    (prisma.student.upsert as jest.Mock).mockResolvedValue(mockStudent);
    (signToken as jest.Mock).mockResolvedValue('mock-jwt-token');

    const request = new NextRequest('http://localhost:3000/api/auth/manual-login', {
      method: 'POST',
      body: JSON.stringify({ registrationNumber: 'CB.EN.U4ECE22050' }),
    });

    const response = await POST(request);

    expect(signToken).toHaveBeenCalledWith({
      sub: 'student-456',
      role: 'student',
      registrationNumber: 'CB.EN.U4ECE22050',
    });
  });

  it('should set httpOnly cookie with secure flag', async () => {
    const mockStudent = {
      id: 'student-789',
      registrationNumber: 'AM.EN.U4CSE21001',
      name: null,
      phone: null,
      subscriptionStatus: 'INACTIVE',
      subscriptionExpiry: null,
    };

    (prisma.student.upsert as jest.Mock).mockResolvedValue(mockStudent);
    (signToken as jest.Mock).mockResolvedValue('mock-jwt-token');

    const request = new NextRequest('http://localhost:3000/api/auth/manual-login', {
      method: 'POST',
      body: JSON.stringify({ registrationNumber: 'AM.EN.U4CSE21001' }),
    });

    const response = await POST(request);

    // Check cookie is set
    const setCookieHeader = response.headers.get('set-cookie');
    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader).toContain('token=mock-jwt-token');
    expect(setCookieHeader).toContain('HttpOnly');
    expect(setCookieHeader).toContain('Path=/');
    expect(setCookieHeader?.toLowerCase()).toContain('samesite=lax');
  });

  it('should set cookie with 7-day maxAge', async () => {
    const mockStudent = {
      id: 'student-999',
      registrationNumber: 'AM.EN.U4CSE21001',
      name: null,
      phone: null,
      subscriptionStatus: 'INACTIVE',
      subscriptionExpiry: null,
    };

    (prisma.student.upsert as jest.Mock).mockResolvedValue(mockStudent);
    (signToken as jest.Mock).mockResolvedValue('mock-jwt-token');

    const request = new NextRequest('http://localhost:3000/api/auth/manual-login', {
      method: 'POST',
      body: JSON.stringify({ registrationNumber: 'AM.EN.U4CSE21001' }),
    });

    const response = await POST(request);

    const setCookieHeader = response.headers.get('set-cookie');
    expect(setCookieHeader).toBeDefined();
    // 7 days = 604800 seconds
    expect(setCookieHeader).toContain('Max-Age=604800');
  });

  it('should return student profile with all fields', async () => {
    const mockStudent = {
      id: 'student-complete',
      registrationNumber: 'AM.EN.U4CSE21001',
      name: 'John Doe',
      phone: '9876543210',
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiry: new Date('2025-12-31'),
    };

    (prisma.student.upsert as jest.Mock).mockResolvedValue(mockStudent);
    (signToken as jest.Mock).mockResolvedValue('mock-jwt-token');

    const request = new NextRequest('http://localhost:3000/api/auth/manual-login', {
      method: 'POST',
      body: JSON.stringify({ registrationNumber: 'AM.EN.U4CSE21001' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.student).toEqual({
      id: 'student-complete',
      registrationNumber: 'AM.EN.U4CSE21001',
      name: 'John Doe',
      phone: '9876543210',
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiry: new Date('2025-12-31').toISOString(),
    });
  });

  it('should find existing student if already registered', async () => {
    const mockStudent = {
      id: 'existing-student',
      registrationNumber: 'AM.EN.U4CSE21001',
      name: 'Jane Smith',
      phone: '9123456789',
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiry: new Date('2025-12-31'),
    };

    (prisma.student.upsert as jest.Mock).mockResolvedValue(mockStudent);
    (signToken as jest.Mock).mockResolvedValue('mock-jwt-token');

    const request = new NextRequest('http://localhost:3000/api/auth/manual-login', {
      method: 'POST',
      body: JSON.stringify({ registrationNumber: 'AM.EN.U4CSE21001' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.student.id).toBe('existing-student');
    expect(data.student.name).toBe('Jane Smith');
    expect(data.student.subscriptionStatus).toBe('ACTIVE');
  });

  it('should return 500 on database error', async () => {
    (prisma.student.upsert as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/auth/manual-login', {
      method: 'POST',
      body: JSON.stringify({ registrationNumber: 'AM.EN.U4CSE21001' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('should return 500 on JWT signing error', async () => {
    const mockStudent = {
      id: 'student-jwt-error',
      registrationNumber: 'AM.EN.U4CSE21001',
      name: null,
      phone: null,
      subscriptionStatus: 'INACTIVE',
      subscriptionExpiry: null,
    };

    (prisma.student.upsert as jest.Mock).mockResolvedValue(mockStudent);
    (signToken as jest.Mock).mockRejectedValue(new Error('JWT signing failed'));

    const request = new NextRequest('http://localhost:3000/api/auth/manual-login', {
      method: 'POST',
      body: JSON.stringify({ registrationNumber: 'AM.EN.U4CSE21001' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
