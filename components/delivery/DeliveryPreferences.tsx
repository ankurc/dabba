import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Chip, Switch, TextInput } from 'react-native-paper';
import { useDeliveryPreferences } from '../../hooks/useDelivery';

const DAYS_OF_WEEK = [
  { label: 'Sunday', value: 'sunday' },
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
];

const TIME_SLOTS = [
  { label: '9am - 12pm', value: '09:00-12:00' },
  { label: '1pm - 4pm', value: '13:00-16:00' },
  { label: '5pm - 8pm', value: '17:00-20:00' },
];

export function DeliveryPreferences() {
  const { preferences, loading, updatePreferences } = useDeliveryPreferences();
  const [preferredDays, setPreferredDays] = useState(preferences?.preferred_days || []);
  const [preferredTimeSlots, setPreferredTimeSlots] = useState(preferences?.preferred_time_slots || []);
  const [deliveryNotes, setDeliveryNotes] = useState(preferences?.delivery_notes || '');
  const [contactBeforeDelivery, setContactBeforeDelivery] = useState(preferences?.contact_before_delivery || false);

  const handleSave = async () => {
    try {
      await updatePreferences({
        preferred_days: preferredDays,
        preferred_time_slots: preferredTimeSlots,
        delivery_notes: deliveryNotes,
        contact_before_delivery: contactBeforeDelivery,
      });
    } catch (err) {
      console.error('Failed to update delivery preferences:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Delivery Preferences
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Preferred Days
      </Text>
      <View style={styles.chipsContainer}>
        {DAYS_OF_WEEK.map((day) => (
          <Chip
            key={day.value}
            selected={preferredDays.includes(day.value)}
            onPress={() => {
              setPreferredDays(
                preferredDays.includes(day.value)
                  ? preferredDays.filter(d => d !== day.value)
                  : [...preferredDays, day.value]
              );
            }}
            style={styles.chip}
          >
            {day.label}
          </Chip>
        ))}
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Preferred Time Slots
      </Text>
      <View style={styles.chipsContainer}>
        {TIME_SLOTS.map((slot) => (
          <Chip
            key={slot.value}
            selected={preferredTimeSlots.includes(slot.value)}
            onPress={() => {
              setPreferredTimeSlots(
                preferredTimeSlots.includes(slot.value)
                  ? preferredTimeSlots.filter(s => s !== slot.value)
                  : [...preferredTimeSlots, slot.value]
              );
            }}
            style={styles.chip}
          >
            {slot.label}
          </Chip>
        ))}
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Delivery Notes
      </Text>
      <TextInput
        mode="outlined"
        value={deliveryNotes}
        onChangeText={setDeliveryNotes}
        placeholder="E.g., Leave at front door, gate code: 1234"
        multiline
        numberOfLines={3}
        style={styles.textInput}
      />

      <View style={styles.switchContainer}>
        <Text variant="bodyMedium">Contact me before delivery</Text>
        <Switch
          value={contactBeforeDelivery}
          onValueChange={setContactBeforeDelivery}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={loading}
        style={styles.button}
      >
        Save Preferences
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    marginBottom: 8,
  },
  textInput: {
    marginBottom: 24,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
}); 