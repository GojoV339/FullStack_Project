import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStudentSession } from '@/lib/jwt';
import { pushSubscriptionSchema } from '@/lib/validations';
import { handleApiError, errorResponse } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return errorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const body = await request.json();
    const parsed = pushSubscriptionSchema.parse(body);

    await prisma.pushSubscription.upsert({
      where: { studentId: session.sub },
      update: {
        subscription: JSON.stringify(parsed.subscription),
      },
      create: {
        studentId: session.sub,
        subscription: JSON.stringify(parsed.subscription),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'Push Subscribe', {
      endpoint: '/api/push/subscribe',
      studentId: (await getStudentSession())?.sub,
    });
  }
}
