import { useState, useEffect } from 'react';
import { createPaymentIntent } from '../services/stripe';
import { MealPlan } from '../types';
import { EXPO_PUBLIC_API_URL } from '@env';

interface PaymentMethod {
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  isDefault: boolean;
}

interface Invoice {
  id: string;
  amount_paid: number;
  status: string;
  created: number;
  invoice_pdf: string;
}

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async (plan: MealPlan, subscriptionId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { clientSecret } = await createPaymentIntent({
        amount: Math.round(plan.price * 100), // Convert to cents
        currency: 'usd',
        subscriptionId,
      });

      return { clientSecret, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      return { clientSecret: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    handlePayment,
    loading,
    error,
  };
}

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      // For development testing, return mock data if API is not available
      if (process.env.NODE_ENV === 'development') {
        setPaymentMethods([
          {
            id: 'mock_1',
            card: {
              brand: 'visa',
              last4: '4242',
              exp_month: 12,
              exp_year: 2024
            },
            isDefault: true
          }
        ]);
        return;
      }

      const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/payment-methods`);
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const { data } = await response.json();
      setPaymentMethods(data);
    } catch (err) {
      console.warn('Payment methods fetch failed:', err);
      // Fallback to empty array instead of showing error
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async (paymentMethodId: string) => {
    const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/payment-methods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethodId }),
    });
    
    if (!response.ok) throw new Error('Failed to add payment method');
    await fetchPaymentMethods();
  };

  const deletePaymentMethod = async (paymentMethodId: string) => {
    const response = await fetch(
      `${EXPO_PUBLIC_API_URL}/api/payment-methods/${paymentMethodId}`,
      { method: 'DELETE' }
    );
    
    if (!response.ok) throw new Error('Failed to delete payment method');
    await fetchPaymentMethods();
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    const response = await fetch(
      `${EXPO_PUBLIC_API_URL}/api/payment-methods/${paymentMethodId}/default`,
      { method: 'POST' }
    );
    
    if (!response.ok) throw new Error('Failed to set default payment method');
    await fetchPaymentMethods();
  };

  return {
    paymentMethods,
    loading,
    error,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    refetch: fetchPaymentMethods,
  };
}

export function useBillingHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      // For development testing, return mock data if API is not available
      if (process.env.NODE_ENV === 'development') {
        setInvoices([
          {
            id: 'mock_inv_1',
            amount_paid: 9900,
            status: 'paid',
            created: Date.now() / 1000,
            invoice_pdf: 'https://example.com/invoice.pdf'
          },
          {
            id: 'mock_inv_2',
            amount_paid: 5900,
            status: 'paid',
            created: (Date.now() - 86400000) / 1000, // Yesterday
            invoice_pdf: 'https://example.com/invoice.pdf'
          }
        ]);
        return;
      }

      const response = await fetch(`${EXPO_PUBLIC_API_URL}/api/invoices`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const { data } = await response.json();
      setInvoices(data);
    } catch (err) {
      console.warn('Billing history fetch failed:', err);
      // Fallback to empty array instead of showing error
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices,
  };
} 