
-- Remove the helper view; column will be dropped instead
DROP VIEW IF EXISTS public.employees_public;

-- Drop email column (currently unused on all rows; LinkedIn URL covers contact)
ALTER TABLE public.employees DROP COLUMN IF EXISTS email;

-- Restore simple public read policy for active employees
DROP POLICY IF EXISTS "Admins view all employees" ON public.employees;
DROP POLICY IF EXISTS "Anyone views active employees" ON public.employees;
CREATE POLICY "Anyone views active employees" ON public.employees
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'::public.app_role));
