import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function verify() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'admin@ycm.com')
    .single();

  if (error) {
    console.error('Error fetching admin:', error.message);
  } else {
    console.log('Admin user found:', data);
  }
}

verify();
