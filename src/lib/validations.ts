import { z } from 'zod';

export const barcodeLoginSchema = z.object({
  barcodeRaw: z.string().min(1, 'Barcode data is required'),
});

export const manualLoginSchema = z.object({
  registrationNumber: z
    .string()
    .regex(
      /^[A-Z]{2}\.EN\.U4[A-Z]{3}\d{2}\d{3}$/,
      'Invalid registration number format. Example: BL.EN.U4CSE22001'
    ),
});

export const staffLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createOrderSchema = z.object({
  cafeteriaId: z.string().uuid('Invalid cafeteria ID'),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid('Invalid menu item ID'),
        quantity: z.number().int().positive('Quantity must be positive'),
      })
    )
    .min(1, 'At least one item is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PREPARING', 'READY', 'COLLECTED']),
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
