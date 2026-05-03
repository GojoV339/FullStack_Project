import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { manualLoginSchema } from '@/lib/validations';
import { handleApiError } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = manualLoginSchema.parse(body);

    const { registrationNumber } = parsed;

    const student = await prisma.student.upsert({
      where: { registrationNumber },
      update: {},
      create: { registrationNumber },
    });

    const token = await signToken({
      sub: student.id,
      role: 'student',
      registrationNumber: student.registrationNumber,
    });

    const response = NextResponse.json({
      student: {
        id: student.id,
        registrationNumber: student.registrationNumber,
        name: student.name,
        phone: student.phone,
        subscriptionStatus: student.subscriptionStatus,
        subscriptionExpiry: student.subscriptionExpiry,
      },
    });

    response.cookies.set('student_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    return handleApiError(error, 'Manual Login', {
      endpoint: '/api/auth/manual-login',
    });
  }
}
