-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'new'::text CHECK (status = ANY (ARRAY['new'::text, 'read'::text, 'replied'::text])),
  CONSTRAINT contact_messages_pkey PRIMARY KEY (id)
);

-- Create subscribers table
CREATE TABLE IF NOT EXISTS public.subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'unsubscribed'::text])),
  CONSTRAINT subscribers_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_messages
DROP POLICY IF EXISTS "Allow public to insert contact messages" ON public.contact_messages;
CREATE POLICY "Allow public to insert contact messages" ON public.contact_messages 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin to manage contact messages" ON public.contact_messages;
CREATE POLICY "Allow admin to manage contact messages" ON public.contact_messages 
FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- RLS Policies for subscribers
DROP POLICY IF EXISTS "Allow public to subscribe" ON public.subscribers;
CREATE POLICY "Allow public to subscribe" ON public.subscribers 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin to manage subscribers" ON public.subscribers;
CREATE POLICY "Allow admin to manage subscribers" ON public.subscribers 
FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Grant permissions
GRANT ALL ON public.contact_messages TO authenticated;
GRANT INSERT ON public.contact_messages TO anon;
GRANT ALL ON public.subscribers TO authenticated;
GRANT INSERT ON public.subscribers TO anon;

CREATE OR REPLACE FUNCTION public.normalize_message_contacts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.full_name := trim(NEW.full_name);
  NEW.email := lower(trim(NEW.email));
  NEW.subject := trim(NEW.subject);
  NEW.message := trim(NEW.message);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_subscriber_emails()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.email := lower(trim(NEW.email));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_message_contacts ON public.contact_messages;
CREATE TRIGGER trg_normalize_message_contacts
BEFORE INSERT OR UPDATE ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION public.normalize_message_contacts();

DROP TRIGGER IF EXISTS trg_normalize_subscriber_emails ON public.subscribers;
CREATE TRIGGER trg_normalize_subscriber_emails
BEFORE INSERT OR UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.normalize_subscriber_emails();

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at_desc
  ON public.contact_messages (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created_at_desc
  ON public.contact_messages (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscribers_created_at_desc
  ON public.subscribers (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscribers_status_created_at_desc
  ON public.subscribers (status, created_at DESC);
