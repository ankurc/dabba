import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { validateRequest, paymentIntentSchema } from './middleware/validate';
import { errorHandler, AppError } from './middleware/error';
import { logger } from './utils/logger';
import deliveryRoutes from './routes/delivery';
import paymentRoutes from './routes/payment';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

export const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Create payment intent
app.post(
  '/create-payment-intent',
  validateRequest(paymentIntentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, currency, subscriptionId } = req.body;

      // Verify subscription exists and is in pending state
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .eq('status', 'pending')
        .single();

      if (subscriptionError || !subscription) {
        throw new AppError(404, 'Subscription not found or not in pending state');
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        metadata: {
          subscriptionId,
        },
      });

      logger.info('Payment intent created', {
        subscriptionId,
        amount,
        currency,
      });

      res.json({
        data: {
          clientSecret: paymentIntent.client_secret,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// Handle webhook events
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sig = req.headers['stripe-signature'];
      if (!sig) {
        throw new AppError(400, 'Missing stripe signature');
      }

      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      // Handle successful payments
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const subscriptionId = paymentIntent.metadata.subscriptionId;

        // Update subscription status to active
        const { error } = await supabase
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('id', subscriptionId);

        if (error) {
          logger.error('Failed to update subscription', {
            subscriptionId,
            error,
          });
          throw error;
        }

        logger.info('Subscription activated', { subscriptionId });
      }

      res.json({ received: true });
    } catch (err) {
      next(err);
    }
  }
);

app.use('/api/delivery', deliveryRoutes);
app.use('/api/payment', paymentRoutes);

app.use(errorHandler);

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
} 