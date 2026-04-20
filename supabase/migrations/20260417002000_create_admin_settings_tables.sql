-- Create singleton configuration tables for the admin control center.

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id integer PRIMARY KEY DEFAULT 1,
  platform_name text NOT NULL DEFAULT 'Yuva Classes',
  logo_url text,
  contact_email text NOT NULL DEFAULT 'support@yuvaclasses.com',
  support_phone text NOT NULL DEFAULT '+91 98765 43210',
  default_language text NOT NULL DEFAULT 'en',
  maintenance_mode boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_settings (
  id integer PRIMARY KEY DEFAULT 1,
  provider text NOT NULL DEFAULT 'razorpay',
  api_key text NOT NULL DEFAULT '',
  api_secret text NOT NULL DEFAULT '',
  currency text NOT NULL DEFAULT 'INR',
  gst_rate numeric(5,2) NOT NULL DEFAULT 18,
  enable_payments boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'platform_settings' AND policyname = 'Admins have full access on platform_settings'
  ) THEN
    CREATE POLICY "Admins have full access on platform_settings"
      ON public.platform_settings
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'payment_settings' AND policyname = 'Admins have full access on payment_settings'
  ) THEN
    CREATE POLICY "Admins have full access on payment_settings"
      ON public.payment_settings
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

INSERT INTO public.platform_settings (id, platform_name, contact_email, support_phone, default_language, maintenance_mode)
VALUES (1, 'Yuva Classes', 'support@yuvaclasses.com', '+91 98765 43210', 'en', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.payment_settings (id, provider, api_key, api_secret, currency, gst_rate, enable_payments)
VALUES (1, 'razorpay', '', '', 'INR', 18, true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF to_regclass('public.platform_config') IS NOT NULL THEN
    INSERT INTO public.platform_settings (id, platform_name, contact_email)
    SELECT 1, platform_name, support_email
    FROM public.platform_config
    ORDER BY id ASC
    LIMIT 1
    ON CONFLICT (id) DO UPDATE
      SET platform_name = EXCLUDED.platform_name,
          contact_email = EXCLUDED.contact_email,
          updated_at = now();
  END IF;

  IF to_regclass('public.payment_config') IS NOT NULL THEN
    INSERT INTO public.payment_settings (id, provider, api_key, api_secret)
    SELECT 1, 'razorpay', COALESCE(razorpay_key_id, ''), COALESCE(razorpay_key_secret, '')
    FROM public.payment_config
    ORDER BY id ASC
    LIMIT 1
    ON CONFLICT (id) DO UPDATE
      SET api_key = EXCLUDED.api_key,
          api_secret = EXCLUDED.api_secret,
          updated_at = now();
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can manage avatars bucket'
  ) THEN
    CREATE POLICY "Admins can manage avatars bucket"
      ON storage.objects
      FOR ALL
      TO authenticated
      USING (bucket_id = 'avatars' AND public.is_admin())
      WITH CHECK (bucket_id = 'avatars' AND public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can manage brand assets bucket'
  ) THEN
    CREATE POLICY "Admins can manage brand assets bucket"
      ON storage.objects
      FOR ALL
      TO authenticated
      USING (bucket_id = 'brand-assets' AND public.is_admin())
      WITH CHECK (bucket_id = 'brand-assets' AND public.is_admin());
  END IF;
END $$;