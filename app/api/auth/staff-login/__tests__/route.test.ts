import { NextRequest } from 'next/server';
import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    staff: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/lib/jwt', () => ({
  signToken: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('POST /api/auth/staff-login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if email is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/staff-login', {
      method: 'POST',
      body: JSON.stringify({ password: 'password123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 if password is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/staff-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'staff@amrita.edu' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 if email format is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/staff-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email', password: 'password123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 if password is too short', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/staff-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'staff@amrita.edu', password: '12345' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 401 if staff email does not exist', async () => {
    (prisma.staff.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/auth/staff-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@amrita.edu', password: 'password123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid email or password');
    expect(prisma.staff.findUnique).toHaveBeenCalledWith({
      where: { email: 'nonexistent@amrita.edu' },
    });
  });

  it('should return 401 if password is incorrect', async () => {
    const mockStaff = {
      id: 'staff-123',
      name: 'John Staff',
      email: 'staff@amrita.edu',
      password: 'hashed-password',
      cafeteriaId: 'cafeteria-123',
      createdAt: new Date(),
    };

    (prisma.staff.findUnique as jest.Mock).mockResolvedValue(mockStaff);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const request = new NextRequest('http://localhost:3000/api/auth/staff-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'staff@amrita.edu', password: 'wrongpassword' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid email or password');
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed-password');
  });

  it('should successfully authenticate staff with valid credentials', async () => {
    const mockStaff = {
      id: 'staff-123',
      name: 'John Staff',
      email: 'staff@amrita.edu',
      password: 'hashed-password',
      cafeteriaId: 'cafeteria-123',
      createdAt: new Date(),
    };

    (prisma.staff.findUnique as jest.Mock).mockResolvedValue(mockStaff);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (signToken as jest.Mock).mockResolvedValue('mock-jwt-token');

    const request = new NextRequest('http://localhost:3000/api/auth/staff-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'staff@amrita.edu', password: 'password123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.staff).toBeDefined();
    expect(data.staff.id).toBe('staff-123');
    expect(data.staff.name).toBe('John Staff');
    expect(data.staff.email).toBe('staff@amrita.edu');
    expect(data.staff.cafeteriaId).toBe('cafeteria-123');
    expect(data.staff.password).toBeUndefined(); // Password should not be returned
    
    expect(prisma.staff.findUnique).toHaveBeenCalledWith({
      where: { email: 'staff@amrita.edu' },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
    expect(signToken).toHaveBeenCalledWith({
      sub: 'staff-123',
      role: 'staff',
      cafeteriaId: 'cafeteria-123',
    });
  });

  it('should set httpOnly cookie with secure flag and 7-day expiry', async () => {
    const mockStaff = {
      id: 'staff-456',
      name: 'Jane Staff',
      email: 'jane@amrita.edu',
      password: 'hashed-password',
      cafeteriaId: 'cafeteria-456',
      createdAt: new Date(),
    };

    (prisma.staff.findUnique as jest.Mock).mockResolvedValue(mockStaff);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (signToken as jest.Mock).mockResolvedValue('mock-jwt-token');

    const request = new NextRequest('http://localhost:3000/api/auth/staff-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'jane@amrita.edu', password: 'password123' }),
    });

    const response = await POST(request);

    // Check cookie is set
    const setCookieHeader = response.headers.get('set-cookie');
    expect(setCookieHeader).toBeDefined();
    expect(setCookieHeader).toContain('token=mock-jwt-token');
    expect(setCookieHeader).toContain('HttpOnly');
    expect(setCookieHeader).toContain('Path=/');
    expect(setCookieHeader?.toLowerCase()).toContain('samesite=lax');
    expect(setCookieHeader).toContain('Max-Age=604800'); // 7 days in seconds
  });

  it('should return staff profile without password field', async () => {
    const mockStaff = {
      id: 'staff-789',
      name: 'Bob Staff',
      email: 'bob@amrita.edu',
      password: 'hashed-password',
      cafeteriaId: 'cafeteria-789',
      createdAt: new Date(),
    };

    (prisma.staff.findUnique as jest.Mock).mockResolvedValue(mockStaff);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (signToken as jest.Mock).mockResolvedValue('mock-jwt-token');

    const request = new NextRequest('http://localhost:3000/api/auth/staff-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'bob@amrita.edu', password: 'password123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.staff).toEqual({
      id: 'staff-789',
      name: 'Bob Staff',
      email: 'bob@amrita.edu',
      cafeteriaId: 'cafeteria-789',
    });
    expect(data.staff.password).toBeUndefined();
  });

  it('should return 500 on database error', async () => {
    (prisma.staff.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/auth/staff-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'staff@amrita.edu', password: 'password123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('should return 500 on bcrypt error', async () => {
    const mockStaff = {
      id: 'staff-999',
      name: 'Error Staff',
      email: 'error@amrita.edu',
      password: 'hashed-password',
      cafeteriaId: 'cafeteria-999',
      createdAt: new Date(),
    };

    (prisma.staff.findUnique as jest.Mock).mockResolvedValue(mockStaff);
    (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Bcrypt error'));

    const request = new NextRequest('http://localhost:3000/api/auth/staff-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'error@amrita.edu', password: 'password123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('should return 500 on JWT signing error', async () => {
    const mockStaff = {
      id: 'staff-888',
      name: 'JWT Error Staff',
      email: 'jwt@amrita.edu',
      password: 'hashed-password',
      cafeteriaId: 'cafeteria-888',
      createdAt: new Date(),
    };

    (prisma.staff.findUnique as jest.Mock).mockResolvedValue(mockStaff);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (signToken as jest.Mock).mockRejectedValue(new Error('JWT signing error'));

    const request = new NextRequest('http://localhost:3000/api/auth/staff-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'jwt@amrita.edu', password: 'password123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
