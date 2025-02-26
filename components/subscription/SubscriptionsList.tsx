import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { useSubscriptions } from '../../hooks/useSubscription';

export function SubscriptionsList() {
  const { subscriptions, loading, error } = useSubscriptions();

  // Add debug logging
  console.log('SubscriptionsList - State:', { 
    subscriptions, 
    loading, 
    error,
    subscriptionsLength: subscriptions?.length 
  });

  if (loading) {
    console.log('SubscriptionsList - Loading state');
    return <ActivityIndicator style={styles.centered} />;
  }

  if (error) {
    console.error('SubscriptionsList - Error details:', error);
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={styles.error}>
          Failed to load subscriptions. Please try again later.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => window.location.reload()}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  if (!subscriptions?.length) {
    console.log('SubscriptionsList - No subscriptions found');
    return (
      <Text variant="bodyMedium" style={styles.empty}>
        No active subscriptions, select a plan to get started.
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      {subscriptions.map((subscription) => (
        <Card 
          key={subscription.id} 
          style={styles.card}
          onPress={() => router.push(`/(main)/subscriptions/${subscription.id}`)}
        >
          <Card.Content>
            <Text variant="titleMedium">{subscription.plan.name}</Text>
            <Text variant="bodyMedium">
              Next Delivery: {new Date(subscription.next_delivery_date).toLocaleDateString()}
            </Text>
            <Text variant="bodyMedium">
              Status: {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    marginBottom: 8,
  },
  centered: {
    padding: 16,
  },
  error: {
    color: 'red',
    padding: 16,
    textAlign: 'center',
  },
  empty: {
    padding: 16,
    textAlign: 'center',
    color: '#666'
  },
  retryButton: {
    marginTop: 16,
  },
}); 