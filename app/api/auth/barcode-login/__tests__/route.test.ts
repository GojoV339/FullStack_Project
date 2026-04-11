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

describe('POST /api/auth/barcode-login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if barcodeData is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/barcode-login', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 if registration number format is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/barcode-login', {
      method: 'POST',
      body: JSON.stringify({ barcodeData: 'INVALID_FORMAT' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid barcode. Could not extract a valid registration number.');
  });

  it('should extract registration number from barcode and create student', async () => {
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

    const request = new NextRequest('http://localhost:3000/api/auth/barcode-login', {
      method: 'POST',
      body: JSON.stringify({ barcodeData: 'AM.EN.U4CSE21001' }),
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

  it('should extract registration number from barcode with extra data', async () => {
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

    const request = new NextRequest('http://localhost:3000/api/auth/barcode-login', {
      method: 'POST',
      body: JSON.stringify({ barcodeData: 'STUDENT_ID:CB.EN.U4ECE22050|NAME:John' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.student.registrationNumber).toBe('CB.EN.U4ECE22050');
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

    const request = new NextRequest('http://localhost:3000/api/auth/barcode-login', {
      method: 'POST',
      body: JSON.stringify({ barcodeData: 'AM.EN.U4CSE21001' }),
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

  it('should return existing student if already registered', async () => {
    const mockStudent = {
      id: 'existing-student',
      registrationNumber: 'AM.EN.U4CSE21001',
      name: 'John Doe',
      phone: '9876543210',
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiry: new Date('2025-12-31'),
    };

    (prisma.student.upsert as jest.Mock).mockResolvedValue(mockStudent);
    (signToken as jest.Mock).mockResolvedValue('mock-jwt-token');

    const request = new NextRequest('http://localhost:3000/api/auth/barcode-login', {
      method: 'POST',
      body: JSON.stringify({ barcodeData: 'AM.EN.U4CSE21001' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.student.name).toBe('John Doe');
    expect(data.student.subscriptionStatus).toBe('ACTIVE');
  });

  it('should return 500 on database error', async () => {
    (prisma.student.upsert as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/auth/barcode-login', {
      method: 'POST',
      body: JSON.stringify({ barcodeData: 'AM.EN.U4CSE21001' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
