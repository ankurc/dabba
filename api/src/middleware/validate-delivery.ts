import { z } from 'zod';

export const deliveryPreferencesSchema = z.object({
  preferred_days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])),
  preferred_time_slots: z.array(z.string()),
  delivery_notes: z.string().max(500),
  contact_before_delivery: z.boolean(),
}).strict();

export const recurringDeliverySchema = z.object({
  subscriptionId: z.string().uuid(),
  frequency: z.enum(['weekly', 'biweekly', 'monthly']),
  dayOfWeek: z.array(z.number().min(0).max(6)),
  preferredTimeSlot: z.string(),
}).strict();

export const deliveryStatusSchema = z.object({
  status: z.enum(['scheduled', 'out_for_delivery', 'delivered', 'failed']),
}).strict(); 