
ALTER TABLE public.waitlist ADD CONSTRAINT waitlist_email_unique UNIQUE (email);

GRANT UPDATE (clicked_payment, updated_at) ON public.waitlist TO anon, authenticated;

CREATE POLICY "Anyone can mark payment clicked"
ON public.waitlist
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
