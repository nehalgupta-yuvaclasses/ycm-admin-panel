-- 1. Add missing columns to 'users' table
-- Check if we need to add 'name' or if it exists. Some schemas used 'full_name'
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name') THEN
        ALTER TABLE public.users ADD COLUMN name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE public.users ADD COLUMN bio TEXT;
    END IF;
END $$;

-- 2. Update the sync trigger function to handle 'name' correctly and ensure upsert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create missing Configuration Tables
CREATE TABLE IF NOT EXISTS public.platform_config (
    id SERIAL PRIMARY KEY,
    platform_name TEXT DEFAULT 'Yuva Classes',
    support_email TEXT DEFAULT 'support@yuvaclasses.com',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_config (
    id SERIAL PRIMARY KEY,
    razorpay_key_id TEXT,
    razorpay_key_secret TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS and add Admin Policies
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_config ENABLE ROW LEVEL SECURITY;

-- Note: we use DO blocks to avoid errors if policies already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins have full access on platform_config') THEN
        CREATE POLICY "Admins have full access on platform_config" ON public.platform_config
        FOR ALL TO authenticated USING (public.is_admin());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins have full access on payment_config') THEN
        CREATE POLICY "Admins have full access on payment_config" ON public.payment_config
        FOR ALL TO authenticated USING (public.is_admin());
    END IF;
END $$;

-- 5. Insert default configuration seeds
INSERT INTO public.platform_config (id, platform_name, support_email)
VALUES (1, 'Yuva Classes', 'support@yuvaclasses.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.payment_config (id, razorpay_key_id, razorpay_key_secret)
VALUES (1, '', '')
ON CONFLICT (id) DO NOTHING;
