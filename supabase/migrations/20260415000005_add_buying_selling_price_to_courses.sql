-- Add buying_price, selling_price, and author columns to courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS buying_price NUMERIC DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS selling_price NUMERIC DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS author TEXT DEFAULT '';
