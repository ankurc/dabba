import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { MealPlan } from '../../types';

interface SubscriptionFormProps {
  plan: MealPlan;
  onSubmit: (data: SubscriptionFormData) => void;
  loading?: boolean;
}

export interface SubscriptionFormData {
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  deliveryInstructions?: string;
}

export function SubscriptionForm({ plan, onSubmit, loading }: SubscriptionFormProps) {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    deliveryInstructions: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SubscriptionFormData, string>>>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Subscription Details
      </Text>
      
      <TextInput
        label="First Name"
        value={formData.firstName}
        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
        error={!!errors.firstName}
        style={styles.input}
      />
      <HelperText type="error" visible={!!errors.firstName}>
        {errors.firstName}
      </HelperText>
      
      <TextInput
        label="Last Name"
        value={formData.lastName}
        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
        error={!!errors.lastName}
        style={styles.input}
      />
      <HelperText type="error" visible={!!errors.lastName}>
        {errors.lastName}
      </HelperText>
      
      <TextInput
        label="Address"
        value={formData.address}
        onChangeText={(text) => setFormData({ ...formData, address: text })}
        error={!!errors.address}
        style={styles.input}
        multiline
      />
      <HelperText type="error" visible={!!errors.address}>
        {errors.address}
      </HelperText>
      
      <TextInput
        label="Phone"
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
        error={!!errors.phone}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <HelperText type="error" visible={!!errors.phone}>
        {errors.phone}
      </HelperText>
      
      <TextInput
        label="Delivery Instructions (Optional)"
        value={formData.deliveryInstructions}
        onChangeText={(text) => setFormData({ ...formData, deliveryInstructions: text })}
        style={styles.input}
        multiline
      />
      
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        style={styles.button}
      >
        Continue to Payment
      </Button>
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
  input: {
    marginBottom: 4,
  },
  button: {
    marginTop: 16,
  },
}); 