import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Divider, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { usePlan } from '../../../hooks/usePlans';

export default function PlanDetails() {
  const { id } = useLocalSearchParams();
  const { plan, loading, error } = usePlan(id as string);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !plan) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge" style={styles.error}>
          {error || 'Plan not found'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium">{plan.name}</Text>
          <Text variant="titleLarge" style={styles.price}>
            ${plan.price}/week
          </Text>
          
          <Divider style={styles.divider} />
          
          <Text variant="bodyLarge" style={styles.description}>
            {plan.description}
          </Text>
          
          <View style={styles.detailsContainer}>
            <Text variant="titleMedium">Plan Details:</Text>
            <Text variant="bodyMedium">• {plan.meals_per_week} meals per week</Text>
            <Text variant="bodyMedium">• {plan.servings_per_meal} servings per meal</Text>
            <Text variant="bodyMedium">• Fresh, pre-portioned ingredients</Text>
            <Text variant="bodyMedium">• Step-by-step recipes</Text>
            <Text variant="bodyMedium">• Free delivery</Text>
          </View>
        </Card.Content>
        
        <Card.Actions style={styles.actions}>
          <Button 
            mode="outlined" 
            onPress={() => router.back()}
            style={styles.button}
          >
            Back
          </Button>
          <Button 
            mode="contained"
            onPress={() => router.push(`/subscribe?planId=${plan.id}`)}
            style={styles.button}
          >
            Subscribe Now
          </Button>
        </Card.Actions>
      </Card>
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
  price: {
    marginTop: 8,
    color: '#007AFF',
  },
  divider: {
    marginVertical: 16,
  },
  description: {
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 8,
  },
  actions: {
    padding: 16,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  error: {
    color: 'red',
  },
}); 