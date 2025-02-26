import { supabase } from '../db';
import { addDays, format, parse, eachDayOfInterval, isFuture } from 'date-fns';
import { logger } from '../utils/logger';
import { emailService } from './email';

export interface DeliverySlot {
  id: string;
  date: string;
  timeSlot: string;
  available: boolean;
}

export interface DeliveryPreferences {
  preferred_days: string[];
  preferred_time_slots: string[];
  delivery_notes: string;
  contact_before_delivery: boolean;
}

export interface RecurringDelivery {
  id: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek: number[];
  preferredTimeSlot: string;
  active: boolean;
}

export async function scheduleDelivery(
  subscriptionId: string,
  date: string,
  timeSlot: string,
  notes?: string
) {
  try {
    // Check if slot is available
    const isAvailable = await checkSlotAvailability(date, timeSlot);
    if (!isAvailable) {
      throw new Error('Delivery slot not available');
    }

    // Create delivery schedule
    const { data: delivery, error } = await supabase
      .from('delivery_schedules')
      .insert({
        subscription_id: subscriptionId,
        delivery_date: date,
        time_slot: timeSlot,
        delivery_notes: notes,
      })
      .select('*, subscriptions(*, profiles(*))')
      .single();

    if (error) throw error;

    // Send confirmation notification
    await createDeliveryNotification(
      delivery.id,
      'scheduled',
      `Your delivery is scheduled for ${date} between ${timeSlot}`
    );

    // Send email notification
    if (delivery.subscriptions.profiles.email) {
      await emailService.sendDeliveryConfirmation(
        delivery.subscriptions.profiles.email,
        date,
        timeSlot
      );
    }

    return delivery;
  } catch (err) {
    logger.error('Failed to schedule delivery:', err);
    throw err;
  }
}

export async function getAvailableSlots(startDate: string, endDate: string): Promise<DeliverySlot[]> {
  // Get all scheduled deliveries for the date range
  const { data: scheduledDeliveries } = await supabase
    .from('delivery_schedules')
    .select('delivery_date, time_slot')
    .gte('delivery_date', startDate)
    .lte('delivery_date', endDate);

  // Generate available slots
  const slots: DeliverySlot[] = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const timeSlots = ['09:00-12:00', '13:00-16:00', '17:00-20:00'];

    timeSlots.forEach(timeSlot => {
      const isBooked = scheduledDeliveries?.some(
        d => d.delivery_date === dateStr && d.time_slot === timeSlot
      );

      slots.push({
        id: `${dateStr}-${timeSlot}`,
        date: dateStr,
        timeSlot,
        available: !isBooked,
      });
    });

    currentDate = addDays(currentDate, 1);
  }

  return slots;
}

export async function updateDeliveryPreferences(
  userId: string,
  preferences: DeliveryPreferences
) {
  const { error } = await supabase
    .from('profiles')
    .update({ delivery_preferences: preferences })
    .eq('id', userId);

  if (error) throw error;
}

export async function setupRecurringDelivery(
  subscriptionId: string,
  pattern: Omit<RecurringDelivery, 'id' | 'active'>
) {
  const { data: recurring, error } = await supabase
    .from('recurring_deliveries')
    .insert({
      subscription_id: subscriptionId,
      frequency: pattern.frequency,
      day_of_week: pattern.dayOfWeek,
      preferred_time_slot: pattern.preferredTimeSlot,
    })
    .select()
    .single();

  if (error) throw error;

  // Schedule the next few deliveries
  await scheduleRecurringDeliveries(recurring.id);

  return recurring;
}

export async function scheduleRecurringDeliveries(recurringId: string) {
  const { data: recurring } = await supabase
    .from('recurring_deliveries')
    .select('*, subscriptions(*)')
    .eq('id', recurringId)
    .single();

  if (!recurring || !recurring.active) return;

  const startDate = new Date();
  const endDate = addDays(startDate, 90); // Schedule 3 months ahead

  const deliveryDates = eachDayOfInterval({ start: startDate, end: endDate })
    .filter(date => {
      // Filter by frequency and day of week
      const dayOfWeek = date.getDay();
      if (!recurring.day_of_week.includes(dayOfWeek)) return false;

      if (recurring.frequency === 'weekly') return true;
      if (recurring.frequency === 'biweekly') {
        const weekNumber = Math.floor(date.getDate() / 7);
        return weekNumber % 2 === 0;
      }
      if (recurring.frequency === 'monthly') {
        return date.getDate() <= 7; // First week of the month
      }
      return false;
    })
    .filter(date => isFuture(date));

  // Schedule each delivery
  for (const date of deliveryDates) {
    await scheduleDelivery(
      recurring.subscription_id,
      format(date, 'yyyy-MM-dd'),
      recurring.preferred_time_slot,
      'Recurring delivery'
    );
  }
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: 'scheduled' | 'out_for_delivery' | 'delivered' | 'failed'
) {
  const { data: delivery, error } = await supabase
    .from('delivery_schedules')
    .update({ status })
    .eq('id', deliveryId)
    .select('*, subscriptions(*, profiles(*))')
    .single();

  if (error) throw error;

  // Create notification
  await createDeliveryNotification(
    deliveryId,
    status,
    `Your delivery status has been updated to: ${status}`
  );

  // Send email for important status changes
  if (
    (status === 'out_for_delivery' || status === 'delivered') &&
    delivery.subscriptions.profiles.email
  ) {
    await emailService.sendDeliveryStatusUpdate(
      delivery.subscriptions.profiles.email,
      status,
      delivery.delivery_date,
      delivery.time_slot
    );
  }

  return delivery;
}

async function createDeliveryNotification(
  deliveryId: string,
  type: string,
  content: string
) {
  const { error } = await supabase
    .from('delivery_notifications')
    .insert({
      delivery_id: deliveryId,
      type,
      content,
    });

  if (error) throw error;
}

async function checkSlotAvailability(date: string, timeSlot: string) {
  const { data: existingDeliveries } = await supabase
    .from('delivery_schedules')
    .select('id')
    .eq('delivery_date', date)
    .eq('time_slot', timeSlot);

  // Check against maximum deliveries per slot
  const MAX_DELIVERIES_PER_SLOT = 10;
  return !existingDeliveries || existingDeliveries.length < MAX_DELIVERIES_PER_SLOT;
}

export const deliveryService = {
  scheduleDelivery,
  getAvailableSlots,
  updateDeliveryPreferences,
  setupRecurringDelivery,
  updateDeliveryStatus,
  scheduleRecurringDeliveries,
}; 