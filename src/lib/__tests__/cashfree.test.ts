import { createCashfreeOrder, verifyCashfreeWebhook } from '../cashfree';

// Mock fetch globally
global.fetch = jest.fn();

describe('Cashfree Integration', () => {
  const mockEnv = {
    CASHFREE_APP_ID: 'test-app-id',
    CASHFREE_SECRET_KEY: 'test-secret-key',
    CASHFREE_WEBHOOK_SECRET: 'test-webhook-secret',
    NEXT_PUBLIC_CASHFREE_ENV: 'sandbox',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  };

  beforeAll(() => {
    Object.assign(process.env, mockEnv);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCashfreeOrder', () => {
    const mockOrderParams = {
      orderId: 'order-123',
      orderAmount: 250.5,
      studentId: 'student-456',
      studentName: 'John Doe',
      studentPhone: '9876543210',
      studentEmail: 'john@example.com',
    };

    it('should create a Cashfree order successfully', async () => {
      const mockResponse = {
        cf_order_id: 'cf-order-789',
        order_id: 'order-123',
        order_status: 'ACTIVE',
        payment_session_id: 'session-abc123',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createCashfreeOrder(mockOrderParams);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://sandbox.cashfree.com/pg/orders',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-version': '2023-08-01',
            'x-client-id': 'test-app-id',
            'x-client-secret': 'test-secret-key',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should use sandbox URL when NEXT_PUBLIC_CASHFREE_ENV is sandbox', async () => {
      process.env.NEXT_PUBLIC_CASHFREE_ENV = 'sandbox';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await createCashfreeOrder(mockOrderParams);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://sandbox.cashfree.com/pg/orders',
        expect.any(Object)
      );
    });

    it('should use production URL when NEXT_PUBLIC_CASHFREE_ENV is production', async () => {
      process.env.NEXT_PUBLIC_CASHFREE_ENV = 'production';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await createCashfreeOrder(mockOrderParams);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.cashfree.com/pg/orders',
        expect.any(Object)
      );

      // Reset to sandbox
      process.env.NEXT_PUBLIC_CASHFREE_ENV = 'sandbox';
    });

    it('should send correct order payload', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await createCashfreeOrder(mockOrderParams);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody).toEqual({
        order_id: 'order-123',
        order_amount: 250.5,
        order_currency: 'INR',
        customer_details: {
          customer_id: 'student-456',
          customer_name: 'John Doe',
          customer_phone: '9876543210',
          customer_email: 'john@example.com',
        },
        order_meta: {
          notify_url: 'http://localhost:3000/api/payments/cashfree-webhook',
        },
      });
    });

    it('should throw error when Cashfree API returns error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => 'Invalid credentials',
      });

      await expect(createCashfreeOrder(mockOrderParams)).rejects.toThrow(
        'Cashfree order creation failed: Invalid credentials'
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(createCashfreeOrder(mockOrderParams)).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle missing environment variables gracefully', async () => {
      const originalAppId = process.env.CASHFREE_APP_ID;
      const originalSecretKey = process.env.CASHFREE_SECRET_KEY;

      delete process.env.CASHFREE_APP_ID;
      delete process.env.CASHFREE_SECRET_KEY;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await createCashfreeOrder(mockOrderParams);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].headers['x-client-id']).toBe('');
      expect(fetchCall[1].headers['x-client-secret']).toBe('');

      // Restore
      process.env.CASHFREE_APP_ID = originalAppId;
      process.env.CASHFREE_SECRET_KEY = originalSecretKey;
    });
  });

  describe('verifyCashfreeWebhook', () => {
    it('should verify valid webhook signature', () => {
      const rawBody = JSON.stringify({
        type: 'PAYMENT_SUCCESS_WEBHOOK',
        data: { order_id: 'order-123' },
      });

      // Generate valid signature using the same secret
      const crypto = require('crypto');
      const validSignature = crypto
        .createHmac('sha256', 'test-webhook-secret')
        .update(rawBody)
        .digest('base64');

      const result = verifyCashfreeWebhook(rawBody, validSignature);

      expect(result).toBe(true);
    });

    it('should reject invalid webhook signature', () => {
      const rawBody = JSON.stringify({
        type: 'PAYMENT_SUCCESS_WEBHOOK',
        data: { order_id: 'order-123' },
      });
      const invalidSignature = 'invalid-signature-here';

      const result = verifyCashfreeWebhook(rawBody, invalidSignature);

      expect(result).toBe(false);
    });

    it('should reject signature with tampered body', () => {
      const originalBody = JSON.stringify({
        type: 'PAYMENT_SUCCESS_WEBHOOK',
        data: { order_id: 'order-123' },
      });

      const crypto = require('crypto');
      const signature = crypto
        .createHmac('sha256', 'test-webhook-secret')
        .update(originalBody)
        .digest('base64');

      // Tamper with the body
      const tamperedBody = JSON.stringify({
        type: 'PAYMENT_SUCCESS_WEBHOOK',
        data: { order_id: 'order-999' },
      });

      const result = verifyCashfreeWebhook(tamperedBody, signature);

      expect(result).toBe(false);
    });

    it('should handle empty body', () => {
      const crypto = require('crypto');
      const signature = crypto
        .createHmac('sha256', 'test-webhook-secret')
        .update('')
        .digest('base64');

      const result = verifyCashfreeWebhook('', signature);

      expect(result).toBe(true);
    });

    it('should handle missing webhook secret gracefully', () => {
      const originalSecret = process.env.CASHFREE_WEBHOOK_SECRET;
      delete process.env.CASHFREE_WEBHOOK_SECRET;

      const rawBody = JSON.stringify({ data: 'test' });
      const signature = 'any-signature';

      const result = verifyCashfreeWebhook(rawBody, signature);

      expect(result).toBe(false);

      // Restore
      process.env.CASHFREE_WEBHOOK_SECRET = originalSecret;
    });

    it('should return false on crypto errors', () => {
      const rawBody = JSON.stringify({ data: 'test' });
      const signature = 'invalid-signature';

      const result = verifyCashfreeWebhook(rawBody, signature);

      expect(result).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete order creation flow', async () => {
      const orderParams = {
        orderId: 'AF-2024-0001',
        orderAmount: 150.0,
        studentId: 'student-123',
        studentName: 'Alice Smith',
        studentPhone: '9123456789',
        studentEmail: 'alice@cb.amrita.edu',
      };

      const mockCashfreeResponse = {
        cf_order_id: 'cf-12345',
        order_id: 'AF-2024-0001',
        order_status: 'ACTIVE',
        payment_session_id: 'session-xyz789',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCashfreeResponse,
      });

      const result = await createCashfreeOrder(orderParams);

      expect(result.cf_order_id).toBe('cf-12345');
      expect(result.payment_session_id).toBe('session-xyz789');
      expect(result.order_status).toBe('ACTIVE');
    });

    it('should handle webhook verification after payment', () => {
      const webhookPayload = {
        type: 'PAYMENT_SUCCESS_WEBHOOK',
        data: {
          order: {
            order_id: 'AF-2024-0001',
            order_amount: 150.0,
            order_status: 'PAID',
          },
          payment: {
            cf_payment_id: 'payment-123',
            payment_status: 'SUCCESS',
            payment_amount: 150.0,
          },
        },
      };

      const rawBody = JSON.stringify(webhookPayload);
      const crypto = require('crypto');
      const signature = crypto
        .createHmac('sha256', 'test-webhook-secret')
        .update(rawBody)
        .digest('base64');

      const isValid = verifyCashfreeWebhook(rawBody, signature);

      expect(isValid).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should provide meaningful error message on API failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () =>
          JSON.stringify({
            message: 'Invalid API credentials',
            code: 'INVALID_CREDENTIALS',
          }),
      });

      await expect(
        createCashfreeOrder({
          orderId: 'order-123',
          orderAmount: 100,
          studentId: 'student-123',
          studentName: 'Test User',
          studentPhone: '9876543210',
          studentEmail: 'test@example.com',
        })
      ).rejects.toThrow('Cashfree order creation failed');
    });

    it('should handle timeout errors', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 100)
          )
      );

      await expect(
        createCashfreeOrder({
          orderId: 'order-123',
          orderAmount: 100,
          studentId: 'student-123',
          studentName: 'Test User',
          studentPhone: '9876543210',
          studentEmail: 'test@example.com',
        })
      ).rejects.toThrow('Request timeout');
    });
  });
});
