import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCashfreeWebhook } from '@/lib/cashfree';
import { sendPushToStudent } from '@/lib/push';
import { logError } from '@/lib/api-error';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature') || '';

    // Verify webhook signature
    const isValid = verifyCashfreeWebhook(rawBody, signature);
    if (!isValid && process.env.NODE_ENV === 'production') {
      logError('Cashfree Webhook', new Error('Invalid webhook signature'), {
        signature,
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { order: cfOrder, payment: cfPayment } = payload.data || payload;

    if (!cfOrder?.order_id) {
      return NextResponse.json({ status: 'ok' });
    }

    const orderId = cfOrder.order_id;
    const paymentStatus = cfPayment?.payment_status || cfOrder?.order_status;

    if (paymentStatus === 'SUCCESS' || paymentStatus === 'PAID') {
      // Update order
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          orderStatus: 'CONFIRMED',
        },
        include: { cafeteria: true },
      });

      // Update payment
      await prisma.payment.updateMany({
        where: { orderId },
        data: {
          status: 'PAID',
          cashfreeOrderId: cfOrder.cf_order_id?.toString(),
          cashfreePaymentId: cfPayment?.cf_payment_id?.toString(),
        },
      });

      // Send push notification
      try {
        await sendPushToStudent(
          order.studentId,
          '✅ Payment Confirmed!',
          `Token #${order.tokenNumber} is being prepared at ${order.cafeteria.name}.`
        );
      } catch (e) {
        logError('Push Notification', e, { orderId, studentId: order.studentId });
      }
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'USER_DROPPED') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          orderStatus: 'CANCELLED',
        },
      });

      await prisma.payment.updateMany({
        where: { orderId },
        data: { status: 'FAILED' },
      });
    }

    // Always return 200 (Cashfree retries on non-200)
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    logError('Cashfree Webhook', error, {
      endpoint: '/api/payments/cashfree-webhook',
    });
    return NextResponse.json({ status: 'ok' });
  }
}
