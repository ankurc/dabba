import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';

const COUNTRIES = [
  { value: 'US', label: 'United States (US)' },
  { value: 'CA', label: 'Canada (CA)' },
] as const;

type Country = typeof COUNTRIES[number]['value'];

export interface Address {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
  country: Country;
}

interface AddressFormProps {
  initialAddress?: Partial<Address>;
  onSave: (address: Address) => void;
  onCancel: () => void;
}

export function AddressForm({ initialAddress = {}, onSave, onCancel }: AddressFormProps) {
  const [address, setAddress] = useState<Address>({
    street: initialAddress.street || '',
    unit: initialAddress.unit || '',
    city: initialAddress.city || '',
    state: initialAddress.state || '',
    zipCode: initialAddress.zipCode || '',
    country: initialAddress.country || 'US',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof Address, string>> = {};
    if (!address.street) newErrors.street = 'Street address is required';
    if (!address.city) newErrors.city = 'City is required';
    if (!address.state) newErrors.state = 'State is required';
    if (!address.zipCode) newErrors.zipCode = 'ZIP code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(address);
    }
  };

  const isCanada = address.country === 'CA';

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.form} elevation={0}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Street Address
        </Text>

        <TextInput
          mode="outlined"
          label="Street Address"
          value={address.street}
          onChangeText={(text) => setAddress({ ...address, street: text })}
          error={!!errors.street}
          style={styles.input}
        />
        {errors.street && <HelperText type="error">{errors.street}</HelperText>}

        <TextInput
          mode="outlined"
          label="Apt/Suite/Unit (optional)"
          value={address.unit}
          onChangeText={(text) => setAddress({ ...address, unit: text })}
          style={styles.input}
        />

        <Text variant="titleMedium" style={styles.sectionTitle}>
          City & State
        </Text>
        <View style={styles.row}>
          <View style={styles.cityContainer}>
            <TextInput
              mode="outlined"
              label="City"
              value={address.city}
              onChangeText={(text) => setAddress({ ...address, city: text })}
              error={!!errors.city}
              style={styles.input}
            />
            {errors.city && <HelperText type="error">{errors.city}</HelperText>}
          </View>
          <View style={styles.stateContainer}>
            <TextInput
              mode="outlined"
              label={isCanada ? "Province" : "State"}
              value={address.state}
              onChangeText={(text) => setAddress({ ...address, state: text })}
              error={!!errors.state}
              style={styles.input}
            />
            {errors.state && <HelperText type="error">{errors.state}</HelperText>}
          </View>
        </View>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          {isCanada ? "Postal Code" : "ZIP Code"} & Country
        </Text>
        <View style={styles.row}>
          <View style={styles.zipContainer}>
            <TextInput
              mode="outlined"
              label={isCanada ? "Postal Code" : "ZIP Code"}
              value={address.zipCode}
              onChangeText={(text) => setAddress({ ...address, zipCode: text })}
              error={!!errors.zipCode}
              style={styles.input}
              keyboardType={isCanada ? "default" : "numeric"}
              autoCapitalize={isCanada ? "characters" : "none"}
              maxLength={isCanada ? 7 : 5}
            />
            {errors.zipCode && <HelperText type="error">{errors.zipCode}</HelperText>}
          </View>
          <View style={styles.countryContainer}>
            <Dropdown
              style={[styles.dropdown, styles.input]}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownText}
              data={COUNTRIES}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Country"
              value={address.country}
              onChange={item => setAddress({ ...address, country: item.value })}
            />
          </View>
        </View>
      </Surface>

      <View style={styles.buttons}>
        <Button 
          mode="outlined" 
          onPress={onCancel} 
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Cancel
        </Button>
        <Button 
          mode="contained" 
          onPress={handleSave} 
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Save Address
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#666',
  },
  input: {
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  cityContainer: {
    flex: 2,
  },
  stateContainer: {
    flex: 1,
  },
  zipContainer: {
    flex: 1,
  },
  countryContainer: {
    flex: 1,
  },
  dropdown: {
    height: 56,
    borderWidth: 1,
    borderColor: '#00000030',
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#666',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  buttonContent: {
    paddingVertical: 8,
  },
}); 