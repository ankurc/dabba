import { Router } from 'express';
import { validateRequest } from '../middleware/validate';
import { z } from 'zod';
import { deliveryService } from '../services/delivery';
import { emailService } from '../services/email';
import { AppError } from '../middleware/error';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { supabase } from '../db';

const router = Router();

const scheduleDeliverySchema = z.object({
  subscriptionId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string(),
});

const deliveryPreferencesSchema = z.object({
  preferred_days: z.array(z.string()),
  preferred_time_slots: z.array(z.string()),
  delivery_notes: z.string(),
  contact_before_delivery: z.boolean(),
});

const recurringDeliverySchema = z.object({
  subscriptionId: z.string().uuid(),
  frequency: z.string(),
  dayOfWeek: z.array(z.number()),
  preferredTimeSlot: z.string(),
});

const deliveryStatusSchema = z.object({
  status: z.string(),
});

router.post(
  '/schedule',
  validateRequest(scheduleDeliverySchema),
  async (req, res, next) => {
    try {
      const { subscriptionId, date, timeSlot } = req.body;

      // Get subscription and user details
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*, profiles(*)')
        .eq('id', subscriptionId)
        .single();

      if (subscriptionError || !subscription) {
        throw new AppError(404, 'Subscription not found');
      }

      const delivery = await deliveryService.scheduleDelivery(
        subscriptionId,
        date,
        timeSlot
      );

      // Send confirmation email
      await emailService.sendDeliveryConfirmation(
        subscription.profiles.email,
        date,
        timeSlot
      );

      res.json({ data: delivery });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/available-slots', async (req, res, next) => {
  try {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!startDate || !endDate) {
      throw new AppError(400, 'Start date and end date are required');
    }

    const slots = await deliveryService.getAvailableSlots(startDate, endDate);
    res.json({ data: slots });
  } catch (err) {
    next(err);
  }
});

// Update delivery preferences
router.put(
  '/preferences',
  requireAuth,
  validateRequest(deliveryPreferencesSchema),
  async (req, res, next) => {
    try {
      await deliveryService.updateDeliveryPreferences(req.user.id, req.body);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
);

// Set up recurring delivery
router.post(
  '/recurring',
  requireAuth,
  validateRequest(recurringDeliverySchema),
  async (req, res, next) => {
    try {
      const recurring = await deliveryService.setupRecurringDelivery(
        req.body.subscriptionId,
        req.body
      );
      res.json({ data: recurring });
    } catch (err) {
      next(err);
    }
  }
);

// Update delivery status (admin only)
router.patch(
  '/:id/status',
  requireAuth,
  requireAdmin,
  validateRequest(deliveryStatusSchema),
  async (req, res, next) => {
    try {
      const delivery = await deliveryService.updateDeliveryStatus(
        req.params.id,
        req.body.status
      );
      res.json({ data: delivery });
    } catch (err) {
      next(err);
    }
  }
);

// Get delivery history
router.get(
  '/history',
  requireAuth,
  async (req, res, next) => {
    try {
      const { data: deliveries, error } = await supabase
        .from('delivery_schedules')
        .select('*, notifications(*)')
        .eq('subscription_id', req.query.subscriptionId)
        .order('delivery_date', { ascending: false });

      if (error) throw error;
      res.json({ data: deliveries });
    } catch (err) {
      next(err);
    }
  }
);

export default router; 