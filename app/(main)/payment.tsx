import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { StripeProvider, CardField, useStripe } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import { usePlan } from '../../hooks/usePlans';
import { usePayment } from '../../hooks/usePayment';

// Access the env variable through Constants
const STRIPE_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export default function Payment() {
  const { planId, subscriptionId } = useLocalSearchParams();
  const { plan, loading: planLoading } = usePlan(planId as string);
  const { handlePayment, loading: paymentLoading, error } = usePayment();
  const { confirmPayment } = useStripe();

  const handleSubmit = async () => {
    if (!plan) return;

    const { clientSecret, error: paymentError } = await handlePayment(plan, subscriptionId as string);
    if (paymentError || !clientSecret) return;

    const { error: confirmError } = await confirmPayment(clientSecret, {
      paymentMethodType: 'Card',
    });

    if (confirmError) {
      console.error('Payment failed:', confirmError);
    } else {
      router.replace(`/(main)/subscriptions/${subscriptionId}`);
    }
  };

  if (planLoading || !plan) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <StripeProvider publishableKey={STRIPE_KEY}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Payment Details
        </Text>

        <Text variant="titleLarge" style={styles.amount}>
          ${plan.price}/week
        </Text>

        <CardField
          postalCodeEnabled={true}
          placeholder={{
            number: '4242 4242 4242 4242',
          }}
          cardStyle={styles.card}
          style={styles.cardField}
        />

        {error && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={paymentLoading}
          style={styles.button}
        >
          Pay Now
        </Button>
      </View>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  amount: {
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 16,
  },
  button: {
    marginTop: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
  },
}); 