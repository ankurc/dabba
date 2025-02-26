import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { BillingHistory } from '../../components/payment/BillingHistory';

export default function BillingHistoryPage() {
  return (
    <View style={styles.container}>
      <BillingHistory />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    padding: 16,
    paddingBottom: 8,
  },
}); 