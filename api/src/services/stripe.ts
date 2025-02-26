import Stripe from 'stripe';
import { logger } from '../utils/logger';
import { supabase } from '../db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createCustomer(email: string, paymentMethodId: string) {
  const customer = await stripe.customers.create({
    email,
    payment_method: paymentMethodId,
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  return customer;
}

export async function createSubscription(customerId: string, priceId: string) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });

  return subscription;
}

export async function cancelSubscription(stripeSubscriptionId: string) {
  return stripe.subscriptions.cancel(stripeSubscriptionId);
}

export async function createSetupIntent(userId: string) {
  const customer = await getOrCreateCustomer(userId);
  
  return stripe.setupIntents.create({
    customer: customer.id,
    payment_method_types: ['card'],
  });
}

export async function listPaymentMethods(userId: string) {
  const customer = await getOrCreateCustomer(userId);
  
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customer.id,
    type: 'card',
  });

  const defaultPaymentMethod = customer.invoice_settings?.default_payment_method;

  return paymentMethods.data.map(method => ({
    id: method.id,
    card: {
      brand: method.card?.brand,
      last4: method.card?.last4,
      exp_month: method.card?.exp_month,
      exp_year: method.card?.exp_year,
    },
    isDefault: method.id === defaultPaymentMethod,
  }));
}

export async function attachPaymentMethod(userId: string, paymentMethodId: string) {
  const customer = await getOrCreateCustomer(userId);
  
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customer.id,
  });

  // Set as default if it's the first payment method
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customer.id,
    type: 'card',
  });

  if (paymentMethods.data.length === 1) {
    await setDefaultPaymentMethod(userId, paymentMethodId);
  }
}

export async function detachPaymentMethod(paymentMethodId: string) {
  await stripe.paymentMethods.detach(paymentMethodId);
}

export async function setDefaultPaymentMethod(userId: string, paymentMethodId: string) {
  const customer = await getOrCreateCustomer(userId);
  
  await stripe.customers.update(customer.id, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
}

export async function verifyPaymentMethod(paymentMethodId: string) {
  try {
    await stripe.paymentMethods.retrieve(paymentMethodId);
  } catch (err) {
    throw new Error('Invalid payment method');
  }
}

export async function listInvoices(
  userId: string,
  dateRange?: { startDate: Date; endDate: Date }
) {
  const customer = await getOrCreateCustomer(userId);
  
  const params: Stripe.InvoiceListParams = {
    customer: customer.id,
    limit: 24,
  };

  if (dateRange) {
    params.created = {
      gte: Math.floor(dateRange.startDate.getTime() / 1000),
      lte: Math.floor(dateRange.endDate.getTime() / 1000),
    };
  }

  const invoices = await stripe.invoices.list(params);

  return invoices.data.map(invoice => ({
    id: invoice.id,
    amount_paid: invoice.amount_paid,
    status: invoice.status,
    created: invoice.created,
    invoice_pdf: invoice.invoice_pdf,
    period_start: invoice.period_start,
    period_end: invoice.period_end,
    lines: invoice.lines.data.map(line => ({
      description: line.description,
      amount: line.amount,
      period: {
        start: line.period?.start,
        end: line.period?.end,
      },
    })),
  }));
}

async function getOrCreateCustomer(userId: string) {
  // Check if customer already exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (profile?.stripe_customer_id) {
    return stripe.customers.retrieve(profile.stripe_customer_id);
  }

  // Get user details
  const { data: user } = await supabase.auth.admin.getUserById(userId);
  if (!user.user) throw new Error('User not found');

  // Create new customer
  const customer = await stripe.customers.create({
    email: user.user.email,
    metadata: {
      userId,
    },
  });

  // Save customer ID
  await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  return customer;
}

export const stripeService = {
  createCustomer,
  createSubscription,
  cancelSubscription,
  createSetupIntent,
  listPaymentMethods,
  attachPaymentMethod,
  detachPaymentMethod,
  setDefaultPaymentMethod,
  listInvoices,
  verifyPaymentMethod,
}; 