
-- Lock down has_role: not directly callable, only via RLS
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO service_role;

-- Storage: resumes (private)
CREATE POLICY "Anyone uploads resume" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Admins read resumes" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete resumes" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'));

-- Storage: employees (private, but anyone can read)
CREATE POLICY "Anyone reads employee photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'employees');
CREATE POLICY "Admins upload employee photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'employees' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update employee photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'employees' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete employee photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'employees' AND public.has_role(auth.uid(), 'admin'));
