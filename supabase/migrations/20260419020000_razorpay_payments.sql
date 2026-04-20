-- Payment hardening and Razorpay-ready schema

ALTER TABLE public.payment_settings
  ADD COLUMN IF NOT EXISTS is_enabled boolean NOT NULL DEFAULT true;

UPDATE public.payment_settings
SET is_enabled = COALESCE(enable_payments, is_enabled)
WHERE is_enabled IS DISTINCT FROM COALESCE(enable_payments, is_enabled);

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS order_id text,
  ADD COLUMN IF NOT EXISTS payment_id text,
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS gst_amount numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

UPDATE public.payments
SET user_id = student_id
WHERE user_id IS NULL AND student_id IS NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'user_id'
  ) THEN
    BEGIN
      ALTER TABLE public.payments ALTER COLUMN user_id SET NOT NULL;
    EXCEPTION
      WHEN others THEN
        NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'payments_order_id_key'
  ) THEN
    ALTER TABLE public.payments ADD CONSTRAINT payments_order_id_key UNIQUE (order_id);
  END IF;
END $$;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'Users can read their own payments'
  ) THEN
    CREATE POLICY "Users can read their own payments"
      ON public.payments
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = user_id
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'payments' AND policyname = 'Admins manage payments'
  ) THEN
    CREATE POLICY "Admins manage payments"
      ON public.payments
      FOR ALL
      TO authenticated
      USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
      WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
  END IF;
END $$;
