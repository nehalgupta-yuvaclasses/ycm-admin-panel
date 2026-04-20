-- Create an RPC function to check if the current user is an admin
-- SECURITY DEFINER allows it to check the users table even if RLS normally blocks the client
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
