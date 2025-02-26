-- Add delivery preferences to profiles
ALTER TABLE profiles
ADD COLUMN delivery_preferences JSONB DEFAULT '{
  "preferred_days": ["monday", "wednesday", "friday"],
  "preferred_time_slots": ["09:00-12:00", "13:00-16:00"],
  "delivery_notes": "",
  "contact_before_delivery": false
}';

-- Create delivery schedules table
CREATE TABLE delivery_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  delivery_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  delivery_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create recurring delivery patterns table
CREATE TABLE recurring_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  frequency VARCHAR(20) NOT NULL, -- weekly, biweekly, monthly
  day_of_week INTEGER[], -- 0-6 (Sunday-Saturday)
  preferred_time_slot VARCHAR(20),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create delivery notifications table
CREATE TABLE delivery_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID REFERENCES delivery_schedules(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- scheduled, reminder, out_for_delivery, delivered
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  content TEXT NOT NULL
);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_delivery_schedules_updated_at
  BEFORE UPDATE ON delivery_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_deliveries_updated_at
  BEFORE UPDATE ON recurring_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 