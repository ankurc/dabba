export interface MealPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  meals_per_week: number;
  servings_per_meal: number;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  delivery_address: string;
  phone: string;
  dietary_preferences?: string[];
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'paused' | 'cancelled';
  start_date: string;
  next_delivery_date: string;
  delivery_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliverySlot {
  id: string;
  date: string;
  timeSlot: string;
  available: boolean;
}

export interface DeliverySchedule {
  id: string;
  subscription_id: string;
  delivery_date: string;
  time_slot: string;
  status: 'scheduled' | 'out_for_delivery' | 'delivered' | 'failed';
  delivery_notes?: string;
  created_at: string;
  updated_at: string;
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

export interface DeliveryNotification {
  id: string;
  delivery_id: string;
  type: 'scheduled' | 'reminder' | 'out_for_delivery' | 'delivered';
  sent_at: string;
  content: string;
} 