
DROP POLICY IF EXISTS "Anyone can update own waitlist by email" ON public.waitlist;
REVOKE UPDATE ON public.waitlist FROM anon, authenticated;
