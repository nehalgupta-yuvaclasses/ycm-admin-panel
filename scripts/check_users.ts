import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function check() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.log('Users table error:', error.message);
  } else {
    console.log('Users table exists, data:', data);
  }

  const { data: prof, error: profErr } = await supabase.from('profiles').select('*').limit(1);
  if (profErr) {
    console.log('Profiles table error:', profErr.message);
  } else {
    console.log('Profiles table exists, data:', prof);
  }
}

check();
