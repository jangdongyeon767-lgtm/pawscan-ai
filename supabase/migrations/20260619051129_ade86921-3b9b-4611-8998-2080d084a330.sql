CREATE OR REPLACE FUNCTION public.mark_waitlist_clicked(_email text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.waitlist
  SET clicked_payment = true, updated_at = now()
  WHERE email = _email;
$$;

REVOKE ALL ON FUNCTION public.mark_waitlist_clicked(text) FROM public;
GRANT EXECUTE ON FUNCTION public.mark_waitlist_clicked(text) TO anon, authenticated;

REVOKE INSERT, UPDATE ON public.waitlist FROM anon;
GRANT INSERT ON public.waitlist TO anon;