import {
  registrationNumberSchema,
  barcodeLoginSchema,
  manualLoginSchema,
  staffLoginSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  pushSubscriptionSchema,
} from '../validations';

describe('Validation Schemas', () => {
  describe('registrationNumberSchema', () => {
    it('should validate correct registration number format', () => {
      const validNumbers = [
        'BL.EN.U4CSE22001',
        'AM.EN.U4ECE23045',
        'CB.EN.U4MEE21999',
      ];

      validNumbers.forEach((regNum) => {
        expect(() => registrationNumberSchema.parse(regNum)).not.toThrow();
      });
    });

    it('should reject invalid registration number formats', () => {
      const invalidNumbers = [
        'BL.EN.U3CSE22001', // Wrong year prefix (U3 instead of U4)
        'BL.EN.U4CS22001', // Too short department code
        'bl.en.u4cse22001', // Lowercase
        'BL.EN.U4CSE2001', // Missing year digits
        'BL.EN.U4CSE220001', // Too many digits
        'BLEN.U4CSE22001', // Missing dot
      ];

      invalidNumbers.forEach((regNum) => {
        expect(() => registrationNumberSchema.parse(regNum)).toThrow();
      });
    });
  });

  describe('barcodeLoginSchema', () => {
    it('should validate barcode data', () => {
      const result = barcodeLoginSchema.parse({
        barcodeData: 'BL.EN.U4CSE22001',
      });
      expect(result.barcodeData).toBe('BL.EN.U4CSE22001');
    });

    it('should reject empty barcode data', () => {
      expect(() =>
        barcodeLoginSchema.parse({ barcodeData: '' })
      ).toThrow();
    });
  });

  describe('manualLoginSchema', () => {
    it('should validate manual login with correct registration number', () => {
      const result = manualLoginSchema.parse({
        registrationNumber: 'BL.EN.U4CSE22001',
      });
      expect(result.registrationNumber).toBe('BL.EN.U4CSE22001');
    });

    it('should reject invalid registration number', () => {
      expect(() =>
        manualLoginSchema.parse({ registrationNumber: 'invalid' })
      ).toThrow();
    });
  });

  describe('staffLoginSchema', () => {
    it('should validate staff login credentials', () => {
      const result = staffLoginSchema.parse({
        email: 'staff@amrita.edu',
        password: 'password123',
      });
      expect(result.email).toBe('staff@amrita.edu');
      expect(result.password).toBe('password123');
    });

    it('should reject invalid email', () => {
      expect(() =>
        staffLoginSchema.parse({
          email: 'invalid-email',
          password: 'password123',
        })
      ).toThrow();
    });

    it('should reject short password', () => {
      expect(() =>
        staffLoginSchema.parse({
          email: 'staff@amrita.edu',
          password: '12345',
        })
      ).toThrow();
    });
  });

  describe('createOrderSchema', () => {
    it('should validate order creation data', () => {
      const result = createOrderSchema.parse({
        cafeteriaId: '123e4567-e89b-12d3-a456-426614174000',
        items: [
          {
            menuItemId: '123e4567-e89b-12d3-a456-426614174001',
            quantity: 2,
          },
          {
            menuItemId: '123e4567-e89b-12d3-a456-426614174002',
            quantity: 1,
          },
        ],
      });
      expect(result.items).toHaveLength(2);
    });

    it('should reject invalid UUID', () => {
      expect(() =>
        createOrderSchema.parse({
          cafeteriaId: 'invalid-uuid',
          items: [{ menuItemId: 'invalid-uuid', quantity: 1 }],
        })
      ).toThrow();
    });

    it('should reject empty items array', () => {
      expect(() =>
        createOrderSchema.parse({
          cafeteriaId: '123e4567-e89b-12d3-a456-426614174000',
          items: [],
        })
      ).toThrow();
    });

    it('should reject non-positive quantity', () => {
      expect(() =>
        createOrderSchema.parse({
          cafeteriaId: '123e4567-e89b-12d3-a456-426614174000',
          items: [
            {
              menuItemId: '123e4567-e89b-12d3-a456-426614174001',
              quantity: 0,
            },
          ],
        })
      ).toThrow();
    });
  });

  describe('updateOrderStatusSchema', () => {
    it('should validate order status updates', () => {
      const validStatuses = ['CONFIRMED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED'];

      validStatuses.forEach((status) => {
        const result = updateOrderStatusSchema.parse({ orderStatus: status });
        expect(result.orderStatus).toBe(status);
      });
    });

    it('should reject invalid status', () => {
      expect(() =>
        updateOrderStatusSchema.parse({ orderStatus: 'INVALID_STATUS' })
      ).toThrow();
    });
  });

  describe('pushSubscriptionSchema', () => {
    it('should validate push subscription data', () => {
      const result = pushSubscriptionSchema.parse({
        subscription: {
          endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
          keys: {
            p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls',
            auth: 'tBHItJI5svbpez7KI4CCXg',
          },
        },
      });
      expect(result.subscription.endpoint).toContain('https://');
    });

    it('should reject invalid endpoint URL', () => {
      expect(() =>
        pushSubscriptionSchema.parse({
          subscription: {
            endpoint: 'not-a-url',
            keys: {
              p256dh: 'key1',
              auth: 'key2',
            },
          },
        })
      ).toThrow();
    });

    it('should reject missing keys', () => {
      expect(() =>
        pushSubscriptionSchema.parse({
          subscription: {
            endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
            keys: {
              p256dh: 'key1',
            },
          },
        })
      ).toThrow();
    });
  });
});
