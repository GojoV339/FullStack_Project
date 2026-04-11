import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, upiRef } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Update order and payment status to simulate successful payment
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        orderStatus: 'CONFIRMED',
      },
    });

    // Upsert a payment record
    await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        studentId: order.studentId,
        type: 'ORDER',
        status: 'PAID',
        amount: order.totalAmount,
        cashfreePaymentId: upiRef || `SIM_${Date.now()}`,
      },
      update: {
        status: 'PAID',
        cashfreePaymentId: upiRef || `SIM_${Date.now()}`,
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Simulate payment error:', error);
    return NextResponse.json({ error: 'Failed to simulate payment' }, { status: 500 });
  }
}
