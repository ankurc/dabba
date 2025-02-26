import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { PaymentMethodForm } from '../../components/forms/PaymentMethodForm';
import { PaymentMethodList } from '../../components/payment/PaymentMethodList';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { router } from 'expo-router';

export default function ManagePayment() {
  const { replaceId, mode } = useLocalSearchParams<{ replaceId?: string; mode?: string }>();

  const isAddingNew = mode === 'add';
  const showForm = replaceId || isAddingNew;

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView>
        <Text variant="headlineMedium" style={styles.title}>
          {showForm ? (replaceId ? 'Replace Payment Method' : 'Add Payment Method') : 'Payment Methods'}
        </Text>

        {showForm ? (
          <Card style={styles.card}>
            <Card.Content>
              <PaymentMethodForm
                onValidityChange={() => {}}
                amount={0}
                onSuccess={() => router.back()}
              />
            </Card.Content>
          </Card>
        ) : (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <PaymentMethodList />
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    padding: 20,
    paddingBottom: 16,
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
}); 