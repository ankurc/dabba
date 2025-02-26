import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';
import { Card, Text, Button, List, Surface } from 'react-native-paper';
import { SubscriptionPlan } from '../../data/subscriptionPlans';

interface PlanCardProps {
  plan: SubscriptionPlan;
  onSelect: (plan: SubscriptionPlan) => void;
  isSelected?: boolean;
}
const { width } = Dimensions.get('window');

export function PlanCard({ plan, onSelect, isSelected }: PlanCardProps) {
  return (
    <Card style={[styles.card, isSelected && styles.selectedCard]} mode="outlined">
      {plan.isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}
      
      <Card.Content>
        <Text variant="headlineMedium"  style={styles.name}>{plan.name}</Text>
        <Text variant="bodyMedium" style={styles.description}>
          {plan.description}
        </Text>
        
        {/* <Surface style={styles.surface}>
          <Swiper
            showsButtons={false}
            showsPagination={true}
            autoplay={true}
            loop={true}
            style={{width: '100%', height: 200}}
          >
            {plan.img.map((image, index) => (
              <Image key={index} source={image} style={styles.thumbimgs} />
            ))}
          </Swiper>
        </Surface> */}

        <View style={styles.priceContainer}>
          <Text variant="displaySmall" style={styles.price}>
            ${plan.price}
          </Text>
          <Text variant="bodyMedium">/2 weeks</Text>
        </View>

        <View style={styles.details}>
          <Text variant="bodyMedium">
            {plan.mealsPerWeek} meals per week
          </Text>
          <Text variant="bodyMedium">
            {plan.servingsPerMeal} servings per meal
          </Text>
        </View>

        <View style={styles.features}>
          {plan.features.map((feature, index) => (
            <List.Item
              key={index}
              title={feature}
              left={props => <List.Icon {...props} icon="check" />}
              titleStyle={styles.featureText}
            />
          ))}
        </View>
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <Button 
          mode={isSelected ? "contained" : "outlined"}
          onPress={() => onSelect(plan)}
          style={styles.button}
        >
          {isSelected ? 'Selected' : 'Select Plan'}
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  name: {
    marginTop: 12,
  },
  surface: {
    marginTop: 4,
    padding: 5,
    borderRadius: 5,
    elevation: 4, // Shadow effect for Android
    shadowColor: '#000', // Shadow effect for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: 'white', // Ensures visibility
  },
  thumbimgs: {
    width: '100%',
    height: "100%",
    // resizeMode: 'cover',
    borderRadius: 5,
    alignSelf: 'center',
  },
  card: {
    margin: 8,
    position: 'relative',
  },
  selectedCard: {
    borderColor: '#6200ee',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: 20,
    right: 12,
    backgroundColor: '#6200ee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 4,
    marginBottom: 6,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 16,
  },
  price: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  details: {
    marginTop: 16,
  },
  features: {
    marginTop: 16,
  },
  featureText: {
    fontSize: 14,
  },
  actions: {
    justifyContent: 'center',
    paddingVertical: 16,
  },
  button: {
    width: '80%',
  },
}); 