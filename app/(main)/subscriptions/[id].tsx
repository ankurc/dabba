import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Divider, ActivityIndicator, Chip } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useSubscriptionDetails } from '../../../hooks/useSubscription';
import { DeliveryScheduler } from '../../../components/delivery/DeliveryScheduler';
import { DeliveryHistory } from '../../../components/delivery/DeliveryHistory';

export default function SubscriptionDetails() {
  const { id } = useLocalSearchParams();
  const { 
    subscription, 
    plan, 
    loading, 
    error,
    pauseSubscription,
    cancelSubscription,
    resumeSubscription,
    refetch,
  } = useSubscriptionDetails(id as string);

  const [showDeliveryScheduler, setShowDeliveryScheduler] = useState(false);

  const handleDeliveryScheduled = () => {
    setShowDeliveryScheduler(false);
    refetch(); // Refresh subscription details
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !subscription || !plan) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge" style={styles.error}>
          {error || 'Subscription not found'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineMedium">{plan.name}</Text>
            <Chip mode="outlined" style={styles.statusChip}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <Text variant="titleMedium">Subscription Details</Text>
          <Text variant="bodyMedium">Start Date: {new Date(subscription.start_date).toLocaleDateString()}</Text>
          <Text variant="bodyMedium">Next Delivery: {new Date(subscription.next_delivery_date).toLocaleDateString()}</Text>
          <Text variant="bodyMedium">Price: ${plan.price}/week</Text>

          <Divider style={styles.divider} />

          <Text variant="titleMedium">Plan Details</Text>
          <Text variant="bodyMedium">• {plan.meals_per_week} meals per week</Text>
          <Text variant="bodyMedium">• {plan.servings_per_meal} servings per meal</Text>

          {subscription.delivery_instructions && (
            <>
              <Divider style={styles.divider} />
              <Text variant="titleMedium">Delivery Instructions</Text>
              <Text variant="bodyMedium">{subscription.delivery_instructions}</Text>
            </>
          )}
        </Card.Content>

        {showDeliveryScheduler ? (
          <DeliveryScheduler
            subscriptionId={subscription.id}
            onSchedule={handleDeliveryScheduled}
          />
        ) : (
          <Button
            mode="contained"
            onPress={() => setShowDeliveryScheduler(true)}
            style={styles.button}
          >
            Schedule Next Delivery
          </Button>
        )}

        <Card.Actions style={styles.actions}>
          {subscription.status === 'active' && (
            <>
              <Button 
                mode="outlined" 
                onPress={() => pauseSubscription()}
                style={styles.button}
              >
                Pause Subscription
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => cancelSubscription()}
                style={[styles.button, styles.cancelButton]}
              >
                Cancel
              </Button>
            </>
          )}
          {subscription.status === 'paused' && (
            <Button 
              mode="contained" 
              onPress={() => resumeSubscription()}
              style={styles.button}
            >
              Resume Subscription
            </Button>
          )}
        </Card.Actions>
      </Card>

      <View style={styles.section}>
        <DeliveryHistory subscriptionId={subscription.id} />
      </View>
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
  card: {
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusChip: {
    minWidth: 80,
    textAlign: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  actions: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    borderColor: '#FF3B30',
  },
  error: {
    color: 'red',
    padding: 16,
    textAlign: 'center',
  },
  section: {
    marginTop: 16,
  },
}); 