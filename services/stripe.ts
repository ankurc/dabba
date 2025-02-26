import { EXPO_PUBLIC_API_URL } from '@env';

interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  subscriptionId: string;
}

interface PaymentIntentResponse {
  clientSecret: string;
}

export async function createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResponse> {
  const response = await fetch(`${EXPO_PUBLIC_API_URL}/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
} 