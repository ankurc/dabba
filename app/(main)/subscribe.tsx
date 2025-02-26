import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { usePlan } from '../../hooks/usePlans';
import { SubscriptionForm, SubscriptionFormData } from '../../components/subscription/SubscriptionForm';
import { useSubscription } from '../../hooks/useSubscription';

export default function Subscribe() {
  const { planId } = useLocalSearchParams();
  const { plan, loading: planLoading, error: planError } = usePlan(planId as string);
  const { createSubscription, loading: subscriptionLoading } = useSubscription();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: SubscriptionFormData) => {
    try {
      if (!plan) return;
      
      const result = await createSubscription({
        planId: plan.id,
        ...formData,
      });

      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/(main)/subscriptions/${result.subscriptionId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (planLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (planError || !plan) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge" style={styles.error}>
          {planError || 'Plan not found'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {error && (
        <Text variant="bodyMedium" style={styles.error}>
          {error}
        </Text>
      )}
      
      <SubscriptionForm
        plan={plan}
        onSubmit={handleSubmit}
        loading={subscriptionLoading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    padding: 16,
    textAlign: 'center',
  },
}); 