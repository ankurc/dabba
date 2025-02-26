import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, SegmentedButtons, Chip, Portal, Dialog } from 'react-native-paper';
import { useRecurringDelivery } from '../../hooks/useDelivery';

interface RecurringDeliverySetupProps {
  subscriptionId: string;
  onSetup: () => void;
}

const DAYS_OF_WEEK = [
  { label: 'Sun', value: '0' },
  { label: 'Mon', value: '1' },
  { label: 'Tue', value: '2' },
  { label: 'Wed', value: '3' },
  { label: 'Thu', value: '4' },
  { label: 'Fri', value: '5' },
  { label: 'Sat', value: '6' },
];

const TIME_SLOTS = [
  { label: '9am - 12pm', value: '09:00-12:00' },
  { label: '1pm - 4pm', value: '13:00-16:00' },
  { label: '5pm - 8pm', value: '17:00-20:00' },
];

export function RecurringDeliverySetup({ subscriptionId, onSetup }: RecurringDeliverySetupProps) {
  const [frequency, setFrequency] = useState('weekly');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeSlot, setTimeSlot] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  
  const { setupRecurringDelivery, loading } = useRecurringDelivery();

  const handleSetup = async () => {
    try {
      await setupRecurringDelivery({
        subscriptionId,
        frequency,
        dayOfWeek: selectedDays.map(Number),
        preferredTimeSlot: timeSlot,
      });
      onSetup();
    } catch (err) {
      console.error('Failed to setup recurring delivery:', err);
    }
  };

  const isValid = selectedDays.length > 0 && timeSlot;

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Set Up Recurring Delivery
      </Text>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Delivery Frequency
      </Text>
      <SegmentedButtons
        value={frequency}
        onValueChange={setFrequency}
        buttons={[
          { value: 'weekly', label: 'Weekly' },
          { value: 'biweekly', label: 'Bi-weekly' },
          { value: 'monthly', label: 'Monthly' },
        ]}
        style={styles.segmentedButtons}
      />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Delivery Days
      </Text>
      <View style={styles.daysContainer}>
        {DAYS_OF_WEEK.map((day) => (
          <Chip
            key={day.value}
            selected={selectedDays.includes(day.value)}
            onPress={() => {
              setSelectedDays(
                selectedDays.includes(day.value)
                  ? selectedDays.filter(d => d !== day.value)
                  : [...selectedDays, day.value]
              );
            }}
            style={styles.dayChip}
          >
            {day.label}
          </Chip>
        ))}
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Preferred Time
      </Text>
      <SegmentedButtons
        value={timeSlot}
        onValueChange={setTimeSlot}
        buttons={TIME_SLOTS}
        style={styles.segmentedButtons}
      />

      <Button
        mode="contained"
        onPress={() => setShowConfirm(true)}
        disabled={!isValid || loading}
        loading={loading}
        style={styles.button}
      >
        Set Up Recurring Delivery
      </Button>

      <Portal>
        <Dialog visible={showConfirm} onDismiss={() => setShowConfirm(false)}>
          <Dialog.Title>Confirm Recurring Delivery</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This will set up automatic deliveries with the following schedule:
            </Text>
            <Text variant="bodyMedium" style={styles.confirmDetail}>
              • {frequency.charAt(0).toUpperCase() + frequency.slice(1)} deliveries
            </Text>
            <Text variant="bodyMedium" style={styles.confirmDetail}>
              • On {selectedDays.map(d => DAYS_OF_WEEK[Number(d)].label).join(', ')}
            </Text>
            <Text variant="bodyMedium" style={styles.confirmDetail}>
              • Between {TIME_SLOTS.find(t => t.value === timeSlot)?.label}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirm(false)}>Cancel</Button>
            <Button onPress={handleSetup}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  segmentedButtons: {
    marginBottom: 24,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  dayChip: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
  confirmDetail: {
    marginTop: 8,
  },
}); 