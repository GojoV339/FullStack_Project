import { POST } from '../route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCashfreeWebhook } from '@/lib/cashfree';
import { sendPushToStudent } from '@/lib/push';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    order: {
      update: jest.fn(),
    },
    payment: {
      updateMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/cashfree', () => ({
  verifyCashfreeWebhook: jest.fn(),
}));

jest.mock('@/lib/push', () => ({
  sendPushToStudent: jest.fn(),
}));

describe('POST /api/payments/cashfree-webhook', () => {
  const mockOrder = {
    id: 'order-123',
    orderNumber: 'AF-2024-0001',
    studentId: 'student-123',
    cafeteriaId: 'cafeteria-123',
    tokenNumber: 42,
    totalAmount: 150.0,
    paymentStatus: 'PAID',
    orderStatus: 'CONFIRMED',
    expiresAt: new Date(),
    createdAt: new Date(),
    cafeteria: {
      id: 'cafeteria-123',
      name: 'Samridhi',
      location: 'Main Block',
      isOpen: true,
      avgWaitMinutes: 10,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  describe('Webhook Signature Verification', () => {
    it('should verify webhook signature', async () => {
      const payload = {
        data: {
          order: { order_id: 'order-123', order_status: 'PAID' },
          payment: { payment_status: 'SUCCESS', cf_payment_id: 'cf-123' },
        },
      };

      const rawBody = JSON.stringify(payload);
      const signature = 'valid-signature';

      (verifyCashfreeWebhook as jest.Mock).mockReturnValue(true);
      (prisma.order.update as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.payment.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        headers: {
          'x-webhook-signature': signature,
          'Content-Type': 'application/json',
        },
        body: rawBody,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(verifyCashfreeWebhook).toHaveBeenCalledWith(rawBody, signature);
      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
    });

    it('should return 401 for invalid signature in production', async () => {
      const payload = {
        data: {
          order: { order_id: 'order-123' },
          payment: { payment_status: 'SUCCESS' },
        },
      };

      const rawBody = JSON.stringify(payload);
      const signature = 'invalid-signature';

      (verifyCashfreeWebhook as jest.Mock).mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        headers: {
          'x-webhook-signature': signature,
          'Content-Type': 'application/json',
        },
        body: rawBody,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid signature');
    });

    it('should skip signature verification in non-production', async () => {
      process.env.NODE_ENV = 'development';

      const payload = {
        data: {
          order: { order_id: 'order-123', order_status: 'PAID' },
          payment: { payment_status: 'SUCCESS' },
        },
      };

      const rawBody = JSON.stringify(payload);
      const signature = 'any-signature';

      (verifyCashfreeWebhook as jest.Mock).mockReturnValue(false);
      (prisma.order.update as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.payment.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        headers: {
          'x-webhook-signature': signature,
          'Content-Type': 'application/json',
        },
        body: rawBody,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Payment Success Handling', () => {
    beforeEach(() => {
      (verifyCashfreeWebhook as jest.Mock).mockReturnValue(true);
    });

    it('should update payment status to PAID on SUCCESS', async () => {
      const payload = {
        data: {
          order: { order_id: 'order-123', order_status: 'PAID', cf_order_id: 'cf-order-123' },
          payment: { payment_status: 'SUCCESS', cf_payment_id: 'cf-payment-123' },
        },
      };

      (prisma.order.update as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.payment.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        headers: { 'x-webhook-signature': 'valid-sig' },
        body: JSON.stringify(payload),
      });

      await POST(request);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: {
          paymentStatus: 'PAID',
          orderStatus: 'CONFIRMED',
        },
        include: { cafeteria: true },
      });
    });

    it('should update order status to CONFIRMED on SUCCESS', async () => {
      const payload = {
        data: {
          order: { order_id: 'order-123', order_status: 'PAID' },
          payment: { payment_status: 'SUCCESS' },
        },
      };

      (prisma.order.update as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.payment.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        headers: { 'x-webhook-signature': 'valid-sig' },
        body: JSON.stringify(payload),
      });

      await POST(request);

      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderStatus: 'CONFIRMED',
          }),
        })
      );
    });

    it('should update payment record with Cashfree IDs', async () => {
      const payload = {
        data: {
          order: { order_id: 'order-123', order_status: 'PAID', cf_order_id: 'cf-order-456' },
          payment: { payment_status: 'SUCCESS', cf_payment_id: 'cf-payment-789' },
        },
      };

      (prisma.order.update as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.payment.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        headers: { 'x-webhook-signature': 'valid-sig' },
        body: JSON.stringify(payload),
      });

      await POST(request);

      expect(prisma.payment.updateMany).toHaveBeenCalledWith({
        where: { orderId: 'order-123' },
        data: {
          status: 'PAID',
          cashfreeOrderId: 'cf-order-456',
          cashfreePaymentId: 'cf-payment-789',
        },
      });
    });

    it('should send push notification on payment success', async () => {
      const payload = {
        data: {
          order: { order_id: 'order-123', order_status: 'PAID' },
          payment: { payment_status: 'SUCCESS' },
        },
      };

      (prisma.order.update as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.payment.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (sendPushToStudent as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        headers: { 'x-webhook-signature': 'valid-sig' },
        body: JSON.stringify(payload),
      });

      await POST(request);

      expect(sendPushToStudent).toHaveBeenCalledWith(
        'student-123',
        '✅ Payment Confirmed!',
        'Token #42 is being prepared at Samridhi.'
      );
    });

    it('should handle push notification failure gracefully', async () => {
      const payload = {
        data: {
          order: { order_id: 'order-123', order_status: 'PAID' },
          payment: { payment_status: 'SUCCESS' },
        },
      };

      (prisma.order.update as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.payment.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (sendPushToStudent as jest.Mock).mockRejectedValue(new Error('Push failed'));

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        headers: { 'x-webhook-signature': 'valid-sig' },
        body: JSON.stringify(payload),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(sendPushToStudent).toHaveBeenCalled();
    });

    it('should handle PAID order status', async () => {
      const payload = {
        data: {
          order: { order_id: 'order-123', order_status: 'PAID' },
          payment: {},
        },
      };

      (prisma.order.update as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.payment.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        headers: { 'x-webhook-signature': 'valid-sig' },
        body: JSON.stringify(payload),
      });

      await POST(request);

      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            paymentStatus: 'PAID',
            orderStatus: 'CONFIRMED',
          }),
        })
      );
    });
  });

  describe('Payment Failure Handling', () => {
    beforeEach(() => {
      (verifyCashfreeWebhook as jest.Mock).mockReturnValue(true);
    });

    it('should update order status to CANCELLED on FAILED payment', async () => {
      const payload = {
        data: {
          order: { order_id: 'order-123' },
          payment: { payment_status: 'FAILED' },
        },
      };

      (prisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        paymentStatus: 'FAILED',
        orderStatus: 'CANCELLED',
      });
      (prisma.payment.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        headers: { 'x-webhook-signature': 'valid-sig' },
        body: JSON.stringify(payload),
      });

      await POST(request);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: {
          paymentStatus: 'FAILED',
          orderStatus: 'CANCELLED',
        },
      });
    });

    it('should update payment status to FAILED', async () => {
      const payload = {
        data: {
          order: { order_id: 'order-123' },
          payment: { payment_status: 'FAILED' },
        },
      };

      (prisma.order.update as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.payment.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        headers: { 'x-webhook-signature': 'valid-sig' },
        body: JSON.stringify(payload),
      });

      await POST(request);

      expect(prisma.payment.updateMany).toHaveBeenCalledWith({
        where: { orderId: 'order-123' },
        data: { status: 'FAILED' },
      });
    });

    it('should handle USER_DROPPED status', async () => {
      const payload = {
        data: {
          order: { order_id: 'order-123' },
          payment: { payment_status: 'USER_DROPPED' },
        },
      };

      (prisma.order.update as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.payment.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        headers: { 'x-webhook-signature': 'valid-sig' },
        body: JSON.stringify(payload),
      });

      await POST(request);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: {
          paymentStatus: 'FAILED',
          orderStatus: 'CANCELLED',
        },
      });
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      (verifyCashfreeWebhook as jest.Mock).mockReturnValue(true);
    });

    it('should return 200 OK for missing order_id', async () => {
      const payload = {
        data: {
          order: {},
          payment: { payment_status: 'SUCCESS' },
        },
      };

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        headers: { 'x-webhook-signature': 'valid-sig' },
        body: JSON.stringify(payload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('should handle alternative payload structure', async () => {
      const payload = {
        order: { order_id: 'order-123', order_status: 'PAID' },
        payment: { payment_status: 'SUCCESS' },
      };

      (prisma.order.update as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.payment.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        headers: { 'x-webhook-signature': 'valid-sig' },
        body: JSON.stringify(payload),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(prisma.order.update).toHaveBeenCalled();
    });

    it('should return 200 OK even on database error', async () => {
      const payload = {
        data: {
          order: { order_id: 'order-123', order_status: 'PAID' },
          payment: { payment_status: 'SUCCESS' },
        },
      };

      (prisma.order.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        headers: { 'x-webhook-signature': 'valid-sig' },
        body: JSON.stringify(payload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
    });

    it('should handle missing signature header', async () => {
      const payload = {
        data: {
          order: { order_id: 'order-123' },
          payment: { payment_status: 'SUCCESS' },
        },
      };

      (verifyCashfreeWebhook as jest.Mock).mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
      expect(verifyCashfreeWebhook).toHaveBeenCalledWith(expect.any(String), '');
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      (verifyCashfreeWebhook as jest.Mock).mockReturnValue(true);
    });

    it('should always return 200 OK after successful processing', async () => {
      const payload = {
        data: {
          order: { order_id: 'order-123', order_status: 'PAID' },
          payment: { payment_status: 'SUCCESS' },
        },
      };

      (prisma.order.update as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.payment.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const request = new NextRequest('http://localhost:3000/api/payments/cashfree-webhook', {
        method: 'POST',
        headers: { 'x-webhook-signature': 'valid-sig' },
        body: JSON.stringify(payload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ status: 'ok' });
    });
  });
});
