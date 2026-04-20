-- 1. Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Published', 'Draft')),
    thumbnail_url TEXT,
    students_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL, -- Note: Can reference students(id) later
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'pending', 'failed', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (using non-recursive JWT check)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Admin full access on courses" ON public.courses;
    CREATE POLICY "Admin full access on courses" ON public.courses
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

    DROP POLICY IF EXISTS "Admin full access on payments" ON public.payments;
    CREATE POLICY "Admin full access on payments" ON public.payments
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
END $$;
