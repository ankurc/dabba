import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { SubscriptionFormData } from '../components/subscription/SubscriptionForm';
import { useAuth } from './useAuth';

interface CreateSubscriptionParams extends SubscriptionFormData {
  planId: string;
}

export function useSubscription() {
  const [loading, setLoading] = useState(false);

  const createSubscription = async (params: CreateSubscriptionParams) => {
    try {
      setLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create profile if it doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: params.firstName,
          last_name: params.lastName,
          delivery_address: params.address,
          phone: params.phone,
        });

      if (profileError) throw profileError;

      // Create subscription with pending status
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: params.planId,
          status: 'pending',
          start_date: new Date().toISOString(),
          next_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          delivery_instructions: params.deliveryInstructions,
        })
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;

      return {
        subscriptionId: subscription.id,
        error: null,
      };
    } catch (err) {
      return {
        subscriptionId: null,
        error: err instanceof Error ? err.message : 'An error occurred',
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    createSubscription,
    loading,
  };
}

export function useSubscriptionDetails(id: string) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionDetails();
  }, [id]);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch subscription with plan details
      const { data, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('id', id)
        .single();

      if (subscriptionError) throw subscriptionError;
      
      setSubscription(data);
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (status: Subscription['status']) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('subscriptions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      // Refresh subscription details
      await fetchSubscriptionDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const pauseSubscription = () => updateSubscriptionStatus('paused');
  const resumeSubscription = () => updateSubscriptionStatus('active');
  const cancelSubscription = () => updateSubscriptionStatus('cancelled');

  return {
    subscription,
    plan,
    loading,
    error,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    refetch: fetchSubscriptionDetails,
  };
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        if (!user) {
          setSubscriptions([]);
          setLoading(false);
          return;
        }

        // Simpler query without relying on foreign key relationships
        const { data, error: fetchError } = await supabase
          .from('subscriptions')
          .select(`
            id,
            status,
            next_delivery_date,
            plan_id
          `)
          .eq('user_id', user.id);

        if (fetchError) throw fetchError;

        // If we have subscriptions, fetch their plans
        if (data && data.length > 0) {
          const planIds = data.map(sub => sub.plan_id);
          const { data: plans, error: plansError } = await supabase
            .from('subscription_plans')
            .select('*')
            .in('id', planIds);

          if (plansError) throw plansError;

          // Combine the data
          const subscriptionsWithPlans = data.map(sub => ({
            ...sub,
            plan: plans.find(p => p.id === sub.plan_id)
          }));

          setSubscriptions(subscriptionsWithPlans);
        } else {
          setSubscriptions([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error details:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setSubscriptions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptions();
  }, [user]);

  return { subscriptions, loading, error };
} 