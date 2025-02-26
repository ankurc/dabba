import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, List, Button, IconButton, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { usePaymentMethods } from '../../hooks/usePayment';

export function PaymentMethodList() {
  const { paymentMethods, loading, error, deletePaymentMethod, setDefaultPaymentMethod } = usePaymentMethods();

  const handleAddNew = () => {
    router.push('/(main)/manage-payment?mode=add');
  };

  const handleReplace = (methodId: string) => {
    router.push(`/(main)/manage-payment?replaceId=${methodId}`);
  };

  if (loading) {
    return <ActivityIndicator style={styles.centered} />;
  }

  if (error) {
    return (
      <Text style={styles.error}>
        {error}
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge">Payment Methods</Text>
        <Button mode="contained" onPress={handleAddNew}>
          Add New
        </Button>
      </View>

      {paymentMethods.map((method) => (
        <List.Item
          key={method.id}
          title={`•••• ${method.card.last4}`}
          description={`Expires ${method.card.exp_month}/${method.card.exp_year}`}
          left={props => <List.Icon {...props} icon="credit-card" />}
          right={props => (
            <View style={styles.actions}>
              {!method.isDefault && (
                <IconButton
                  {...props}
                  icon="star-outline"
                  onPress={() => setDefaultPaymentMethod(method.id)}
                />
              )}
              <IconButton
                {...props}
                icon="credit-card-refresh"
                onPress={() => handleReplace(method.id)}
              />
              <IconButton
                {...props}
                icon="delete"
                onPress={() => deletePaymentMethod(method.id)}
              />
            </View>
          )}
        />
      ))}

      {paymentMethods.length === 0 && (
        <Text style={styles.empty}>No payment methods added yet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
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
    textAlign: 'center',
    padding: 16,
    color: '#666',
  },
}); 