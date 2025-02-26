import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export const testSupabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export const cleanupDatabase = async () => {
  await testSupabase
    .from('subscriptions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
}; 