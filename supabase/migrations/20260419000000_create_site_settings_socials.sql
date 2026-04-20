CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_pkey PRIMARY KEY (id),
  CONSTRAINT site_settings_key_unique UNIQUE (key)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'Public can read site settings'
  ) THEN
    CREATE POLICY "Public can read site settings"
      ON public.site_settings
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_settings' AND policyname = 'Admins can update site settings'
  ) THEN
    CREATE POLICY "Admins can update site settings"
      ON public.site_settings
      FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

DROP TRIGGER IF EXISTS site_settings_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.site_settings (key, value)
VALUES (
  'socials',
  jsonb_build_object(
    'phone', '',
    'email', '',
    'whatsapp', '',
    'telegram', '',
    'instagram', '',
    'facebook', '',
    'twitter', '',
    'youtube', '',
    'linkedin', '',
    'address', '',
    'support_hours', ''
  )
)
ON CONFLICT (key) DO NOTHING;