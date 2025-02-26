import request from 'supertest';
import { app } from '../../index';
import { v4 as uuidv4 } from 'uuid';
import Stripe from 'stripe';
import { testSupabase, cleanupDatabase } from '../setup';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

describe('Webhook Handler', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  it('should activate subscription on successful payment', async () => {
    // Create a test subscription
    const subscriptionId = uuidv4();
    await testSupabase.from('subscriptions').insert({
      id: subscriptionId,
      user_id: uuidv4(),
      plan_id: uuidv4(),
      status: 'pending',
      start_date: new Date().toISOString(),
      next_delivery_date: new Date().toISOString(),
    });

    // Create a mock payment intent succeeded event
    const paymentIntent = {
      id: 'pi_test',
      object: 'payment_intent',
      metadata: {
        subscriptionId,
      },
    };

    const event = {
      type: 'payment_intent.succeeded',
      data: {
        object: paymentIntent,
      },
    };

    // Sign the event
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: JSON.stringify(event),
      secret: process.env.STRIPE_WEBHOOK_SECRET!,
    });

    const response = await request(app)
      .post('/webhook')
      .set('stripe-signature', signature)
      .send(event);

    expect(response.status).toBe(200);

    // Verify subscription was activated
    const { data: subscription } = await testSupabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    expect(subscription?.status).toBe('active');
  });
}); 