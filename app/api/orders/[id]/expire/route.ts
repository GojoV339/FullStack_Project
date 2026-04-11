import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStudentSession } from '@/lib/jwt';
import { handleApiError, errorResponse } from '@/lib/api-error';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return errorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { id } = params;

    // Verify order exists
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

    // Verify order belongs to authenticated student
    if (order.studentId !== session.sub) {
      return errorResponse('Forbidden', 403, 'FORBIDDEN');
    }

    // Verify order is AWAITING_PAYMENT
    if (order.orderStatus !== 'AWAITING_PAYMENT') {
      return errorResponse(
        'Order cannot be expired',
        400,
        'INVALID_ORDER_STATUS'
      );
    }

    // Update order status to CANCELLED and payment status to EXPIRED
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: 'CANCELLED',
        paymentStatus: 'EXPIRED',
      },
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

    // Serialize Decimal fields to numbers
    const serialized = {
      ...updatedOrder,
      totalAmount: Number(updatedOrder.totalAmount),
      items: updatedOrder.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
      })),
    };

    return NextResponse.json({ order: serialized });
  } catch (error) {
    return handleApiError(error, 'Order Expire', {
      endpoint: '/api/orders/[id]/expire',
      orderId: params.id,
      studentId: (await getStudentSession())?.sub,
    });
  }
}
