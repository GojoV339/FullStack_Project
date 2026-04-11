import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStudentSession } from '@/lib/jwt';
import { handleApiError, errorResponse } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return errorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        cafeteria: {
          select: {
            id: true,
            name: true,
            location: true,
            isOpen: true,
            avgWaitMinutes: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return errorResponse('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // Verify the order belongs to the authenticated student
    if (order.studentId !== session.sub) {
      return errorResponse('Forbidden', 403, 'FORBIDDEN');
    }

    // Serialize Decimal fields to numbers
    const serialized = {
      ...order,
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
      })),
    };

    return NextResponse.json({ order: serialized });
  } catch (error) {
    return handleApiError(error, 'Order Fetch', {
      endpoint: '/api/orders/[id]',
      orderId: params.id,
      studentId: (await getStudentSession())?.sub,
    });
  }
}
