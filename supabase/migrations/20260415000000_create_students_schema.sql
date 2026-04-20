-- 1. Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    batch TEXT,
    status TEXT CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create student_courses table
CREATE TABLE IF NOT EXISTS student_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    course_name TEXT NOT NULL
);

-- 3. Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_courses ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Assuming is_admin() function exists as defined in Full_Supabase_Setup.sql
-- If not, we will fallback to JWT role check

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
        CREATE POLICY "Admin full access on students" ON students FOR ALL USING (is_admin());
        CREATE POLICY "Admin full access on student_courses" ON student_courses FOR ALL USING (is_admin());
    ELSE
        CREATE POLICY "Admin full access on students" ON students FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
        CREATE POLICY "Admin full access on student_courses" ON student_courses FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
    END IF;
END $$;
