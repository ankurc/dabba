import { z } from 'zod';

export const setupIntentSchema = z.object({}).strict();

export const addPaymentMethodSchema = z.object({
  paymentMethodId: z.string()
    .min(1, 'Payment method ID is required')
    .regex(/^pm_/, 'Invalid payment method ID format'),
}).strict();

export const paymentMethodIdParamSchema = z.object({
  id: z.string()
    .min(1, 'Payment method ID is required')
    .regex(/^pm_/, 'Invalid payment method ID format'),
}).strict();

export const dateRangeSchema = z.object({
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
}).strict(); 