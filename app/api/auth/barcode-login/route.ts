import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/jwt';
import { barcodeLoginSchema } from '@/lib/validations';
import { handleApiError, errorResponse } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = barcodeLoginSchema.parse(body);

    const { barcodeData } = parsed;

    // Extract registration number from barcode
    // Amrita ID barcodes contain the registration number
    const regNumMatch = barcodeData.match(/[A-Z]{2}\.EN\.U4[A-Z]{3}\d{2}\d{3}/);
    const registrationNumber = regNumMatch ? regNumMatch[0] : barcodeData.trim();

    // Validate format
    const regexValid = /^[A-Z]{2}\.EN\.U4[A-Z]{3}\d{2}\d{3}$/.test(registrationNumber);
    if (!regexValid) {
      return errorResponse(
        'Invalid barcode. Could not extract a valid registration number.',
        400,
        'INVALID_BARCODE'
      );
    }

    // Upsert student
    const student = await prisma.student.upsert({
      where: { registrationNumber },
      update: {},
      create: { registrationNumber },
    });

    // Sign JWT
    const token = await signToken({
      sub: student.id,
      role: 'student',
      registrationNumber: student.registrationNumber,
    });

    // Set cookie
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
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    return handleApiError(error, 'Barcode Login', {
      endpoint: '/api/auth/barcode-login',
    });
  }
}
