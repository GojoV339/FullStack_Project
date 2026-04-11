import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { staffLoginSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';
import { handleApiError, errorResponse } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = staffLoginSchema.parse(body);

    const { email, password } = parsed;

    const staff = await prisma.staff.findUnique({
      where: { email },
    });

    if (!staff) {
      return errorResponse(
        'Invalid email or password',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    const passwordValid = await bcrypt.compare(password, staff.password);
    if (!passwordValid) {
      return errorResponse(
        'Invalid email or password',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    const token = await signToken({
      sub: staff.id,
      role: 'staff',
      cafeteriaId: staff.cafeteriaId,
    });

    const response = NextResponse.json({
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        cafeteriaId: staff.cafeteriaId,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    return handleApiError(error, 'Staff Login', {
      endpoint: '/api/auth/staff-login',
    });
  }
}
