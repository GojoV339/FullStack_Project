import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStudentSession } from '@/lib/jwt';
import { handleApiError, errorResponse } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return errorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // Parse pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    const orders = await prisma.order.findMany({
      where: { studentId: session.sub },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
      include: {
        cafeteria: {
          select: { id: true, name: true, location: true },
        },
        items: {
          include: {
            menuItem: {
              select: { name: true, imageUrl: true },
            },
          },
        },
      },
    });

    const serialized = orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
      })),
    }));

    return NextResponse.json({ orders: serialized });
  } catch (error) {
    return handleApiError(error, 'My Orders Fetch', {
      endpoint: '/api/orders/my',
      studentId: (await getStudentSession())?.sub,
    });
  }
}
