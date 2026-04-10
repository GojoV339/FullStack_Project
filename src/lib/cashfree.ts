const CASHFREE_BASE_URL =
  process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

interface CreateCashfreeOrderParams {
  orderId: string;
  orderAmount: number;
  studentId: string;
  studentName: string;
  studentPhone: string;
  studentEmail: string;
}

export async function createCashfreeOrder(params: CreateCashfreeOrderParams) {
  const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'x-api-version': '2023-08-01',
      'x-client-id': process.env.CASHFREE_APP_ID || '',
      'x-client-secret': process.env.CASHFREE_SECRET_KEY || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_id: params.orderId,
      order_amount: params.orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: params.studentId,
        customer_name: params.studentName,
        customer_phone: params.studentPhone,
        customer_email: params.studentEmail,
      },
      order_meta: {
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/cashfree-webhook`,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cashfree order creation failed: ${error}`);
  }

  return response.json();
}

export function verifyCashfreeWebhook(
  rawBody: string,
  signature: string
): boolean {
  try {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.CASHFREE_WEBHOOK_SECRET || '')
      .update(rawBody)
      .digest('base64');
    return signature === expectedSignature;
  } catch {
    return false;
  }
}
