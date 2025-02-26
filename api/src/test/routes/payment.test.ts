import request from 'supertest';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { app } from '../../index';
import { testSupabase, cleanupDatabase } from '../setup';

describe('Payment Routes', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe('POST /create-payment-intent', () => {
    it('should create a payment intent for valid subscription', async () => {
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

      const response = await request(app)
        .post('/create-payment-intent')
        .send({
          amount: 1000,
          currency: 'usd',
          subscriptionId,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('clientSecret');
    });

    it('should return 404 for non-existent subscription', async () => {
      const response = await request(app)
        .post('/create-payment-intent')
        .send({
          amount: 1000,
          currency: 'usd',
          subscriptionId: uuidv4(),
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        'error',
        'Subscription not found or not in pending state'
      );
    });
  });
}); 