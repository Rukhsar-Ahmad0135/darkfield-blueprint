
-- 1) Employees: remove public exposure of email column via view
DROP POLICY IF EXISTS "Anyone views active employees" ON public.employees;

CREATE POLICY "Admins view all employees" ON public.employees
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE VIEW public.employees_public
WITH (security_barrier=true) AS
  SELECT id, full_name, position, department, bio, photo_url, photo_path,
         linkedin_url, display_order, is_active, created_at, updated_at
  FROM public.employees
  WHERE is_active = true;

GRANT SELECT ON public.employees_public TO anon, authenticated;

-- 2) Applications: validate INSERTs
DROP POLICY IF EXISTS "Anyone submits applications" ON public.applications;

CREATE POLICY "Anyone submits applications" ON public.applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (job_id IS NULL OR EXISTS (
      SELECT 1 FROM public.jobs WHERE id = job_id AND is_active = true
    ))
    AND char_length(full_name) BETWEEN 1 AND 200
    AND char_length(email) BETWEEN 3 AND 320
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(phone) BETWEEN 3 AND 50
    AND char_length(location) BETWEEN 1 AND 200
    AND char_length(job_title) BETWEEN 1 AND 200
    AND char_length(resume_path) BETWEEN 1 AND 500
    AND (cover_letter IS NULL OR char_length(cover_letter) <= 5000)
  );

-- 3) Resumes bucket: enforce path pattern
DROP POLICY IF EXISTS "Anyone uploads resume" ON storage.objects;

CREATE POLICY "Anyone uploads resume" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'resumes'
    AND char_length(name) < 300
    AND name ~ '^[0-9]+-[0-9a-fA-F-]{36}-[A-Za-z0-9._-]+$'
  );

-- 4) Lock down bootstrap function
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
