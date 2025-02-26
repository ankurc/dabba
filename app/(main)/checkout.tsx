import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, Button, Card, List, Divider, Checkbox, Surface, Portal, Dialog, RadioButton } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { subscriptionPlans } from '../../data/subscriptionPlans';
import { DAYS_OF_WEEK, DayId } from '../../constants/dates';
import { AddressForm, Address } from '../../components/forms/AddressForm';
import { useAuth } from '../../hooks/useAuth';
import { useGeoLocation } from '../../hooks/useGeoLocation';
import { useStripe } from '@stripe/stripe-react-native';
import { PaymentMethodForm } from '../../components/forms/PaymentMethodForm';
import { usePaymentMethods } from '../../hooks/usePayment';

export default function Checkout() {
  const { user, updateProfile } = useAuth();
  const { country: detectedCountry, loading: detectingCountry } = useGeoLocation();
  const { createPaymentMethod, handleCardAction, deletePaymentMethod } = useStripe();
  const { paymentMethods } = usePaymentMethods();
  const addresses = user?.user_metadata?.addresses || [];
  const deliveryAddresses = addresses.filter((a: { type: string }) => a.type === 'delivery');
  const billingAddresses = addresses.filter((a: { type: string }) => a.type === 'billing');

  const params = useLocalSearchParams<{
    planId: string;
    premiumDelivery: string;
    total: string;
    deliveryDays: string;
  }>();

  const selectedPlan = subscriptionPlans.find(plan => plan.id === params.planId);
  const hasPremiumDelivery = params.premiumDelivery === 'true';
  const total = parseFloat(params.total || '0');
  const deliveryDays = (params.deliveryDays?.split(',') || []) as DayId[];

  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: detectedCountry || 'US',
  });
  const [billingAddress, setBillingAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: detectedCountry || 'US',
  });
  const [sameAsDelivery, setSameAsDelivery] = useState(true);
  const [paymentValid, setPaymentValid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showBillingAddress, setShowBillingAddress] = useState(false);

  useEffect(() => {
    if (detectedCountry) {
      setDeliveryAddress(prev => ({ ...prev, country: detectedCountry }));
      setBillingAddress(prev => ({ ...prev, country: detectedCountry }));
    }
  }, [detectedCountry]);

  const formatDeliveryDays = (days: DayId[]) => {
    return days
      .map(day => DAYS_OF_WEEK.find(d => d.id === day)?.label)
      .join(', ');
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Validate addresses
      if (!deliveryAddress.street || !deliveryAddress.city || 
          !deliveryAddress.state || !deliveryAddress.zipCode) {
        alert('Please fill in all delivery address fields');
        return;
      }
      
      if (!sameAsDelivery && (!billingAddress.street || !billingAddress.city || 
          !billingAddress.state || !billingAddress.zipCode)) {
        alert('Please fill in all billing address fields');
        return;
      }

      // Save addresses to user's address book
      const updatedAddresses = [
        ...deliveryAddresses,
        ...(sameAsDelivery ? [] : billingAddresses)
      ];

      await updateProfile({ addresses: updatedAddresses });

      // TODO: Complete the payment on your backend
      router.replace('/(main)');
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowAddPayment(false);
    setShowBillingAddress(true);
  };

  const handleBillingAddressSave = (address: any) => {
    // Save billing address and continue checkout
    setShowBillingAddress(false);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text variant="headlineMedium" style={styles.title}>
            Checkout
          </Text>

          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Delivery Address
            </Text>
            {deliveryAddresses.length > 0 ? (
              deliveryAddresses.map((address, index) => (
                <RadioButton.Item
                  key={index}
                  label={`${address.street}, ${address.city}, ${address.state} ${address.zipCode}`}
                  value={address.id}
                  status="checked"
                />
              ))
            ) : (
              <Button
              mode="outlined"
              onPress={() => router.push('/(main)/address-book')}
              style={styles.addButton}
            >
              Add New Delivery Address
            </Button>
            )}
            
          </Surface>

          <Surface style={styles.section} elevation={0}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Payment Method
            </Text>
            {paymentMethods.map((method) => (
              <RadioButton.Item
                key={method.id}
                label={`${method.card.brand.toUpperCase()} •••• ${method.card.last4}`}
                value={method.id}
                status={selectedPaymentId === method.id ? 'checked' : 'unchecked'}
                onPress={() => setSelectedPaymentId(method.id)}
              />
            ))}
            <Button
              mode="outlined"
              onPress={() => setShowAddPayment(true)}
              style={styles.addButton}
            >
              Add New Payment Method
            </Button>
          </Surface>

          <Portal>
            <Dialog visible={showAddPayment} onDismiss={() => setShowAddPayment(false)}>
              <Dialog.Title>Add Payment Method</Dialog.Title>
              <Dialog.Content>
                <PaymentMethodForm
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setShowAddPayment(false)}
                />
              </Dialog.Content>
            </Dialog>

            <Dialog visible={showBillingAddress} onDismiss={() => setShowBillingAddress(false)}>
              <Dialog.Title>Billing Address</Dialog.Title>
              <Dialog.Content>
                <AddressForm
                  onSave={handleBillingAddressSave}
                  onCancel={() => setShowBillingAddress(false)}
                />
              </Dialog.Content>
            </Dialog>
          </Portal>

          <Card style={styles.orderSummary}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.summaryTitle}>
                Order Summary
              </Text>

              <List.Item
                title={selectedPlan?.name}
                description={`${selectedPlan?.mealsPerWeek} meals/week on ${formatDeliveryDays(deliveryDays)}`}
                right={() => <Text>${selectedPlan?.price}/2 weeks</Text>}
              />

              {hasPremiumDelivery && (
                <List.Item
                  title="Premium Delivery"
                  description="Priority delivery with flexible times"
                  right={() => <Text>$56/2 weeks</Text>}
                />
              )}

              <Divider style={styles.divider} />

              <View style={styles.totalRow}>
                <Text variant="titleMedium">Total</Text>
                <Text variant="titleLarge" style={styles.totalAmount}>
                  ${total}
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={handlePayment}
            style={styles.payButton}
            contentStyle={styles.payButtonContent}
            disabled={!selectedPaymentId || processing}
            loading={processing}
          >
            Pay ${total}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'android' ? 120 : 40, // Extra padding for Android
  },
  title: {
    padding: 20,
    paddingBottom: 16,
  },
  orderSummary: {
    margin: 16,
    elevation: 2,
  },
  summaryTitle: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalAmount: {
    fontWeight: 'bold',
  },
  payButton: {
    margin: 16,
    marginTop: 32,
  },
  payButtonContent: {
    paddingVertical: 8,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#666',
  },
  addButton: {
    marginTop: 8,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    padding: 16,
  },
}); 