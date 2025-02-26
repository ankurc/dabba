import { Router } from 'express';
import { validateRequest } from '../middleware/validate';
import { 
  setupIntentSchema, 
  addPaymentMethodSchema,
  paymentMethodIdParamSchema,
  dateRangeSchema,
} from '../middleware/validate-payment';
import { stripeService } from '../services/stripe';
import { AppError } from '../middleware/error';
import { supabase } from '../db';
import { logger } from '../utils/logger';

const router = Router();

// Middleware to verify user authentication
const requireAuth = async (req, res, next) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new AppError(401, 'Unauthorized');
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Create a SetupIntent for adding a new payment method
router.post(
  '/setup-intent',
  requireAuth,
  validateRequest(setupIntentSchema),
  async (req, res, next) => {
    try {
      const setupIntent = await stripeService.createSetupIntent(req.user.id);
      
      logger.info('Setup intent created', {
        userId: req.user.id,
        setupIntentId: setupIntent.id,
      });

      res.json({ 
        data: { 
          clientSecret: setupIntent.client_secret,
          setupIntentId: setupIntent.id,
        } 
      });
    } catch (err) {
      logger.error('Failed to create setup intent', {
        userId: req.user.id,
        error: err,
      });
      next(err);
    }
  }
);

// Get user's payment methods
router.get(
  '/payment-methods',
  requireAuth,
  async (req, res, next) => {
    try {
      const paymentMethods = await stripeService.listPaymentMethods(req.user.id);
      res.json({ data: paymentMethods });
    } catch (err) {
      logger.error('Failed to list payment methods', {
        userId: req.user.id,
        error: err,
      });
      next(err);
    }
  }
);

// Add a new payment method
router.post(
  '/payment-methods',
  requireAuth,
  validateRequest(addPaymentMethodSchema),
  async (req, res, next) => {
    try {
      const { paymentMethodId } = req.body;

      // Verify payment method exists in Stripe
      try {
        await stripeService.verifyPaymentMethod(paymentMethodId);
      } catch (err) {
        throw new AppError(400, 'Invalid payment method');
      }

      await stripeService.attachPaymentMethod(req.user.id, paymentMethodId);
      
      logger.info('Payment method added', {
        userId: req.user.id,
        paymentMethodId,
      });

      res.json({ success: true });
    } catch (err) {
      logger.error('Failed to add payment method', {
        userId: req.user.id,
        paymentMethodId: req.body.paymentMethodId,
        error: err,
      });
      next(err);
    }
  }
);

// Delete a payment method
router.delete(
  '/payment-methods/:id',
  requireAuth,
  validateRequest(paymentMethodIdParamSchema, 'params'),
  async (req, res, next) => {
    try {
      // Verify payment method belongs to user
      const paymentMethods = await stripeService.listPaymentMethods(req.user.id);
      const paymentMethod = paymentMethods.find(pm => pm.id === req.params.id);
      
      if (!paymentMethod) {
        throw new AppError(404, 'Payment method not found');
      }

      await stripeService.detachPaymentMethod(req.params.id);
      
      logger.info('Payment method deleted', {
        userId: req.user.id,
        paymentMethodId: req.params.id,
      });

      res.json({ success: true });
    } catch (err) {
      logger.error('Failed to delete payment method', {
        userId: req.user.id,
        paymentMethodId: req.params.id,
        error: err,
      });
      next(err);
    }
  }
);

// Set default payment method
router.post(
  '/payment-methods/:id/default',
  requireAuth,
  validateRequest(paymentMethodIdParamSchema, 'params'),
  async (req, res, next) => {
    try {
      // Verify payment method belongs to user
      const paymentMethods = await stripeService.listPaymentMethods(req.user.id);
      const paymentMethod = paymentMethods.find(pm => pm.id === req.params.id);
      
      if (!paymentMethod) {
        throw new AppError(404, 'Payment method not found');
      }

      await stripeService.setDefaultPaymentMethod(req.user.id, req.params.id);
      
      logger.info('Default payment method set', {
        userId: req.user.id,
        paymentMethodId: req.params.id,
      });

      res.json({ success: true });
    } catch (err) {
      logger.error('Failed to set default payment method', {
        userId: req.user.id,
        paymentMethodId: req.params.id,
        error: err,
      });
      next(err);
    }
  }
);

// Get billing history
router.get(
  '/invoices',
  requireAuth,
  validateRequest(dateRangeSchema, 'query'),
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const invoices = await stripeService.listInvoices(req.user.id, {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
      res.json({ data: invoices });
    } catch (err) {
      logger.error('Failed to fetch invoices', {
        userId: req.user.id,
        error: err,
      });
      next(err);
    }
  }
);

export default router; 