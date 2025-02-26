import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, ActivityIndicator, Card, Chip, IconButton, Button, Menu, Portal, Dialog, SegmentedButtons } from 'react-native-paper';
import { format, addDays } from 'date-fns';
import { useDeliveryHistory, useDeliverySlots } from '../../hooks/useDelivery';
import { DeliverySchedule, DeliveryNotification } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DeliveryHistoryProps {
  subscriptionId: string;
}

const STATUS_COLORS = {
  scheduled: '#2196F3',
  out_for_delivery: '#FF9800',
  delivered: '#4CAF50',
  failed: '#F44336',
};

interface DeliveryItemProps {
  delivery: DeliverySchedule & { notifications: DeliveryNotification[] };
}

type FilterStatus = 'all' | 'upcoming' | 'past' | 'delivered' | 'failed';

function DeliveryItem({ delivery }: DeliveryItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const { scheduleDelivery } = useDeliverySlots(
    format(new Date(), 'yyyy-MM-dd'),
    format(addDays(new Date(), 14), 'yyyy-MM-dd')
  );

  const handleReschedule = async (newDate: string, newTimeSlot: string) => {
    try {
      await scheduleDelivery(delivery.subscription_id, newDate, newTimeSlot);
      setShowReschedule(false);
      // Trigger refetch of delivery history
    } catch (err) {
      console.error('Failed to reschedule delivery:', err);
    }
  };

  const isUpcoming = new Date(delivery.delivery_date) > new Date();
  const statusColor = STATUS_COLORS[delivery.status] || '#757575';

  const getTrackingIcon = () => {
    switch (delivery.status) {
      case 'scheduled': return 'clock-outline';
      case 'out_for_delivery': return 'truck-delivery';
      case 'delivered': return 'check-circle';
      case 'failed': return 'alert-circle';
      default: return 'information';
    }
  };

  return (
    <Card style={styles.deliveryCard}>
      <Card.Content>
        <View style={styles.deliveryHeader}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons 
              name={getTrackingIcon()} 
              size={24} 
              color={statusColor}
              style={styles.trackingIcon}
            />
            <View>
              <Text variant="titleMedium">
                {format(new Date(delivery.delivery_date), 'EEE, MMM d, yyyy')}
              </Text>
              <Text variant="bodyMedium">{delivery.time_slot}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Chip
              style={[styles.statusChip, { backgroundColor: statusColor }]}
              textStyle={styles.statusText}
            >
              {delivery.status.replace('_', ' ')}
            </Chip>
            {isUpcoming && (
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    onPress={() => setMenuVisible(true)}
                  />
                }
              >
                <Menu.Item
                  onPress={() => {
                    setMenuVisible(false);
                    setShowReschedule(true);
                  }}
                  title="Reschedule"
                  leadingIcon="calendar"
                />
                <Menu.Item
                  onPress={() => {
                    setMenuVisible(false);
                    setShowTrackingDialog(true);
                  }}
                  title="Track Delivery"
                  leadingIcon="map-marker"
                />
              </Menu>
            )}
          </View>
        </View>

        {delivery.delivery_notes && (
          <Text variant="bodyMedium" style={styles.notes}>
            Notes: {delivery.delivery_notes}
          </Text>
        )}

        {delivery.notifications && delivery.notifications.length > 0 && (
          <>
            <IconButton
              icon={expanded ? 'chevron-up' : 'chevron-down'}
              onPress={() => setExpanded(!expanded)}
              style={styles.expandButton}
            />
            
            {expanded && (
              <View style={styles.notificationsContainer}>
                <Text variant="titleSmall" style={styles.notificationsTitle}>
                  Delivery Updates
                </Text>
                <View style={styles.timeline}>
                  {delivery.notifications.map((notification, index) => (
                    <View key={notification.id} style={styles.timelineItem}>
                      <View style={styles.timelineLine} />
                      <View style={styles.timelineContent}>
                        <Text variant="bodySmall" style={styles.notificationTime}>
                          {format(new Date(notification.sent_at), 'h:mm a')}
                        </Text>
                        <Text variant="bodyMedium">{notification.content}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        <Portal>
          <Dialog visible={showTrackingDialog} onDismiss={() => setShowTrackingDialog(false)}>
            <Dialog.Title>Delivery Tracking</Dialog.Title>
            <Dialog.Content>
              <View style={styles.trackingStatus}>
                <MaterialCommunityIcons 
                  name={getTrackingIcon()} 
                  size={48} 
                  color={statusColor}
                />
                <Text variant="bodyLarge" style={styles.trackingText}>
                  {delivery.status === 'out_for_delivery' 
                    ? 'Your delivery is on the way!'
                    : `Delivery is ${delivery.status.replace('_', ' ')}`
                  }
                </Text>
                <Text variant="bodyMedium">
                  Expected delivery: {delivery.time_slot}
                </Text>
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowTrackingDialog(false)}>Close</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Card.Content>
    </Card>
  );
}

export function DeliveryHistory({ subscriptionId }: DeliveryHistoryProps) {
  const { deliveries, loading, error } = useDeliveryHistory(subscriptionId);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const filteredDeliveries = deliveries.filter(delivery => {
    const deliveryDate = new Date(delivery.delivery_date);
    const isUpcoming = deliveryDate >= new Date();

    switch (filterStatus) {
      case 'upcoming': return isUpcoming;
      case 'past': return !isUpcoming;
      case 'delivered': return delivery.status === 'delivered';
      case 'failed': return delivery.status === 'failed';
      default: return true;
    }
  }).sort((a, b) => {
    const dateA = new Date(a.delivery_date).getTime();
    const dateB = new Date(b.delivery_date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filterStatus}
          onValueChange={value => setFilterStatus(value as FilterStatus)}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'past', label: 'Past' },
          ]}
          style={styles.filterButtons}
        />
        <IconButton
          icon={sortOrder === 'asc' ? 'sort-ascending' : 'sort-descending'}
          onPress={() => setSortOrder(current => current === 'asc' ? 'desc' : 'asc')}
        />
      </View>

      <ScrollView>
        {filteredDeliveries.map((delivery) => (
          <DeliveryItem key={delivery.id} delivery={delivery} />
        ))}

        {filteredDeliveries.length === 0 && (
          <Text style={styles.empty}>No deliveries found</Text>
        )}
      </ScrollView>
    </View>
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
  error: {
    color: 'red',
    textAlign: 'center',
    padding: 16,
  },
  empty: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
  },
  deliveryCard: {
    margin: 8,
    marginTop: 0,
    marginBottom: 16,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingIcon: {
    marginRight: 8,
  },
  statusChip: {
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    textTransform: 'capitalize',
  },
  notes: {
    marginTop: 8,
    color: '#666',
  },
  expandButton: {
    alignSelf: 'center',
    margin: -8,
  },
  notificationsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  notificationsTitle: {
    marginBottom: 8,
  },
  timeline: {
    marginLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLine: {
    width: 2,
    backgroundColor: '#ddd',
    marginRight: 16,
    marginLeft: 8,
    flex: 0,
  },
  timelineContent: {
    flex: 1,
  },
  notificationTime: {
    color: '#666',
    marginBottom: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButtons: {
    flex: 1,
    marginRight: 8,
  },
  trackingStatus: {
    alignItems: 'center',
    padding: 16,
  },
  trackingText: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
}); 