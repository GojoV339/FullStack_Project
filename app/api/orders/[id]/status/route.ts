import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStaffSession } from '@/lib/jwt';
import { updateOrderStatusSchema } from '@/lib/validations';
import { sendPushToStudent } from '@/lib/push';
import { handleApiError, errorResponse } from '@/lib/api-error';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[Order Status API] Request received for order:', params.id);
    const session = await getStaffSession();
    console.log('[Order Status API] Staff session:', session);
    if (!session) {
      return errorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const body = await request.json();
    const parsed = updateOrderStatusSchema.parse(body);

    const { id } = params;
    const { orderStatus } = parsed;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { cafeteria: true },
    });

    if (!order) {
      return errorResponse('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // If status is CONFIRMED and order doesn't have a token number, assign one
    let tokenNumber = order.tokenNumber;
    if (orderStatus === 'CONFIRMED' && !tokenNumber) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastOrder = await prisma.order.findFirst({
        where: {
          cafeteriaId: order.cafeteriaId,
          createdAt: { gte: today },
          tokenNumber: { not: 0 },
        },
        orderBy: { tokenNumber: 'desc' },
      });

      tokenNumber = (lastOrder?.tokenNumber ?? 0) + 1;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        orderStatus,
        ...(orderStatus === 'CONFIRMED' && !order.tokenNumber && { tokenNumber }),
      },
    });

    // Send push notifications based on status
    try {
      if (orderStatus === 'CONFIRMED') {
        await sendPushToStudent(
          order.studentId,
          '✅ Order Confirmed!',
          `Token #${tokenNumber} is being prepared at ${order.cafeteria.name}.`
        );
      } else if (orderStatus === 'PREPARING') {
        await sendPushToStudent(
          order.studentId,
          '👨‍🍳 Preparing Your Order',
          `Your order is now being prepared at ${order.cafeteria.name}.`
        );
      } else if (orderStatus === 'READY') {
        await sendPushToStudent(
          order.studentId,
          '🔔 Order Ready!',
          `Token #${order.tokenNumber} is ready for pickup at ${order.cafeteria.name}!`
        );
      } else if (orderStatus === 'COLLECTED') {
        await sendPushToStudent(
          order.studentId,
          '✨ Order Collected',
          `Thank you for using Amrita Feast! Enjoy your meal!`
        );
      }
    } catch (e) {
      console.error('Push notification failed:', e);
    }

    return NextResponse.json({
      order: {
        ...updated,
        totalAmount: Number(updated.totalAmount),
      },
    });
  } catch (error) {
    return handleApiError(error, 'Order Status Update', {
      endpoint: '/api/orders/[id]/status',
      orderId: params.id,
      staffId: (await getStaffSession())?.sub,
    });
  }
}
