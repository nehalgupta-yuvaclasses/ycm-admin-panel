import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAIL = 'admin@ycm.com';
const ADMIN_PASSWORD = 'Hello@123';

async function createAdmin() {
  console.log(`Creating admin user: ${ADMIN_EMAIL}...`);

  // 1. Sign up the user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    options: {
      data: {
        full_name: 'System Admin',
        role: 'admin'
      }
    }
  });

  if (signUpError) {
    if (signUpError.message.includes('already registered')) {
      console.log('User already exists. Attempting to update role if possible...');
      // We can't update role via anon key if RLS is on, but maybe it's not yet.
    } else {
      console.error('Error signing up admin:', signUpError.message);
      return;
    }
  } else {
    console.log('Admin user created successfully in Auth.');
  }

  // 2. We can't easily update the role to 'admin' via the anon key if RLS is enabled.
  // The trigger I wrote in SQL will handle the initial insertion with role 'student' (default)
  // unless we pass it in metadata and the trigger handles it.
  
  // My trigger does handle metadata: COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  
  console.log('Check your Supabase "users" table to verify the user exists with role "admin".');
  console.log('If the role is "student", you must manually update it to "admin" in the Supabase Dashboard.');
}

createAdmin();
