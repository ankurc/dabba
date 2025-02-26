import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import { format, addDays } from 'date-fns';
import { useDeliverySlots } from '../../hooks/useDelivery';

interface DeliverySchedulerProps {
  subscriptionId: string;
  onSchedule: () => void;
}

export function DeliveryScheduler({ subscriptionId, onSchedule }: DeliverySchedulerProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const startDate = format(new Date(), 'yyyy-MM-dd');
  const endDate = format(addDays(new Date(), 14), 'yyyy-MM-dd');
  
  const { slots, loading, error, scheduleDelivery } = useDeliverySlots(startDate, endDate);

  const handleSchedule = async () => {
    if (!selectedSlot) return;
    const [date, timeSlot] = selectedSlot.split('-');
    
    try {
      await scheduleDelivery(subscriptionId, date, timeSlot);
      onSchedule();
    } catch (err) {
      console.error('Failed to schedule delivery:', err);
    }
  };

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
        Select Delivery Time
      </Text>

      <View style={styles.slotsContainer}>
        {slots.map((slot) => (
          <Card
            key={slot.id}
            style={[
              styles.slotCard,
              selectedSlot === slot.id && styles.selectedSlot,
              !slot.available && styles.unavailableSlot,
            ]}
            onPress={() => slot.available && setSelectedSlot(slot.id)}
          >
            <Card.Content>
              <Text variant="titleMedium">
                {format(new Date(slot.date), 'EEE, MMM d')}
              </Text>
              <Text variant="bodyMedium">{slot.timeSlot}</Text>
              {!slot.available && (
                <Text variant="bodySmall" style={styles.unavailableText}>
                  Not Available
                </Text>
              )}
            </Card.Content>
          </Card>
        ))}
      </View>

      <Button
        mode="contained"
        onPress={handleSchedule}
        disabled={!selectedSlot}
        style={styles.button}
      >
        Schedule Delivery
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
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  slotCard: {
    width: '48%',
    marginBottom: 8,
  },
  selectedSlot: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  unavailableSlot: {
    opacity: 0.5,
  },
  unavailableText: {
    color: 'red',
    marginTop: 4,
  },
  button: {
    marginTop: 16,
  },
  centered: {
    padding: 16,
  },
  error: {
    color: 'red',
    padding: 16,
    textAlign: 'center',
  },
}); 