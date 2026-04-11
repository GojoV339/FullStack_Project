import { z } from 'zod';

// Registration number pattern for Amrita Vishwa Vidyapeetham
export const registrationNumberSchema = z
  .string()
  .regex(
    /^[A-Z]{2}\.EN\.U4[A-Z]{3}\d{2}\d{3}$/,
    'Invalid registration number format'
  );

export const barcodeLoginSchema = z.object({
  barcodeData: z.string().min(1),
});

export const manualLoginSchema = z.object({
  registrationNumber: registrationNumberSchema,
});

export const staffLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createOrderSchema = z.object({
  cafeteriaId: z.string().uuid(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(['CONFIRMED', 'PREPARING', 'READY', 'COLLECTED', 'CANCELLED']),
});

export const pushSubscriptionSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});
