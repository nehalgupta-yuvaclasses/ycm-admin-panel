-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('pdf', 'notes', 'book')),
  file_url TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on resources"
  ON resources FOR ALL
  USING (true)
  WITH CHECK (true);

-- Resource purchases (optional — marketplace tracking)
CREATE TABLE IF NOT EXISTS resource_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE resource_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on resource_purchases"
  ON resource_purchases FOR ALL
  USING (true)
  WITH CHECK (true);

-- Storage bucket (run this in Supabase Dashboard → Storage if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);
