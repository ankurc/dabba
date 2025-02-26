import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Button, Card, Divider, IconButton } from 'react-native-paper';
import { useStripe, CardField, initStripe } from '@stripe/stripe-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY } from '@env';

interface PaymentMethodFormProps {
  onValidityChange: (isValid: boolean) => void;
  amount: number;
  disabled?: boolean;
  onSuccess?: () => void;
}

export function PaymentMethodForm({ onValidityChange, amount, disabled, onSuccess }: PaymentMethodFormProps) {
  const { createPaymentMethod } = useStripe();
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const cardFieldRef = React.useRef(null);

  useEffect(() => {
    initStripe({
      publishableKey: EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      merchantIdentifier: 'merchant.com.dabba',
    });
  }, []);

  const handleCardChange = (cardDetails: any) => {
    setCardComplete(cardDetails.complete);
    setCardError(cardDetails.error?.message || null);
    onValidityChange(cardDetails.complete);
    if (cardDetails.complete && onSuccess) {
      onSuccess();
    }
  };

  const handleScanCard = async () => {
    try {
      if (cardFieldRef.current) {
        // @ts-ignore - focus() exists but isn't in types
        cardFieldRef.current.focus();
      }
    } catch (err) {
      console.warn('Card scan failed:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.newCardSection}>
        <View style={styles.sectionHeader}>
          <Text variant="bodyMedium" style={styles.sectionTitle}>
            Enter Card Details
          </Text>
          {Platform.OS === 'ios' && (
            <IconButton
              icon="credit-card-scan"
              size={24}
              onPress={handleScanCard}
              mode="contained-tonal"
            />
          )}
        </View>
        <CardField
          ref={cardFieldRef}
          postalCodeEnabled={false}
          placeholders={{
            number: '4242 4242 4242 4242',
          }}
          autofill
          cardStyle={[
            styles.cardField,
            Platform.OS === 'ios' && styles.cardFieldIOS,
            disabled && styles.cardFieldDisabled
          ]}
          style={[styles.cardContainer, styles.cardFieldWrapper]}
          onCardChange={handleCardChange}
          disabled={disabled}
        />
        {cardError && (
          <Text style={styles.errorText}>{cardError}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#666',
  },
  newCardSection: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardContainer: {
    height: 50,
    marginVertical: 8,
  },
  cardFieldWrapper: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  cardField: {
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: 16,
  },
  cardFieldIOS: {
    paddingVertical: 10,
  },
  cardFieldDisabled: {
    opacity: 0.5,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
  },
}); 