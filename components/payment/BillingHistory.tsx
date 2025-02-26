import React, { useEffect } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { Text, List, ActivityIndicator, IconButton } from 'react-native-paper';
import { format } from 'date-fns';
import { useBillingHistory } from '../../hooks/usePayment';
import { EXPO_PUBLIC_API_URL } from '@env';

export function BillingHistory() {
  const { invoices, loading, error } = useBillingHistory();

  useEffect(() => {
    // Verify API connection
    fetch(`${EXPO_PUBLIC_API_URL}/health`)
      .then(response => {
        if (!response.ok) throw new Error('API not available');
      })
      .catch(err => console.warn('API Health Check:', err));
  }, [invoices, loading, error]);

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
      <Text variant="titleLarge" style={styles.title}>
        Billing History
      </Text>

      {invoices.map((invoice) => {
        return (
          <List.Item
            key={invoice.id}
            title={`$${(invoice.amount_paid / 100).toFixed(2)} - ${invoice.status}`}
            description={format(new Date(invoice.created * 1000), 'MMM d, yyyy')}
            left={props => <List.Icon {...props} icon="receipt" />}
            right={props => (
              <IconButton
                {...props}
                icon="download"
                onPress={() => {
                  Linking.openURL(invoice.invoice_pdf);
                }}
              />
            )}
          />
        );
      })}

      {invoices.length === 0 && (
        <Text style={styles.empty}>No billing history available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
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