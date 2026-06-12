
-- Allow authenticated admins to manage employees bucket files
CREATE POLICY "Admins manage employees bucket"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'employees' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'employees' AND public.has_role(auth.uid(), 'admin'));

-- Allow signed URL reads (signed URLs bypass RLS, but also allow authenticated read)
CREATE POLICY "Authenticated read employees bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'employees');
