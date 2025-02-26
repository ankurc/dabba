import { useState, useEffect } from 'react';
import { config } from '../config';
import { DeliverySlot, DeliveryPreferences, RecurringDelivery } from '../types';

export function useDeliverySlots(startDate: string, endDate: string) {
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSlots();
  }, [startDate, endDate]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${config.apiUrl}/api/delivery/available-slots?startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch delivery slots');
      }

      const { data } = await response.json();
      setSlots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const scheduleDelivery = async (subscriptionId: string, date: string, timeSlot: string) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/delivery/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          date,
          timeSlot,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule delivery');
      }

      const { data } = await response.json();
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to schedule delivery');
    }
  };

  return {
    slots,
    loading,
    error,
    scheduleDelivery,
    refetch: fetchSlots,
  };
}

export function useDeliveryPreferences() {
  const [preferences, setPreferences] = useState<DeliveryPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/api/delivery/preferences`);

      if (!response.ok) {
        throw new Error('Failed to fetch delivery preferences');
      }

      const { data } = await response.json();
      setPreferences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: DeliveryPreferences) => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/api/delivery/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPreferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update delivery preferences');
      }

      setPreferences(newPreferences);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences,
  };
}

export function useRecurringDelivery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupRecurringDelivery = async (pattern: {
    subscriptionId: string;
    frequency: string;
    dayOfWeek: number[];
    preferredTimeSlot: string;
  }) => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/api/delivery/recurring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pattern),
      });

      if (!response.ok) {
        throw new Error('Failed to set up recurring delivery');
      }

      const { data } = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    setupRecurringDelivery,
  };
}

export function useDeliveryHistory(subscriptionId: string) {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeliveryHistory();
  }, [subscriptionId]);

  const fetchDeliveryHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${config.apiUrl}/api/delivery/history?subscriptionId=${subscriptionId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch delivery history');
      }

      const { data } = await response.json();
      setDeliveries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    deliveries,
    loading,
    error,
    refetch: fetchDeliveryHistory,
  };
} 