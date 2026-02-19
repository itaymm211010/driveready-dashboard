ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teachers
    WHERE id = _user_id AND is_admin = true
  )
$$;

CREATE POLICY "admin_read_all_teachers" ON public.teachers
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "admin_insert_teachers" ON public.teachers
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin_delete_teachers" ON public.teachers
  FOR DELETE USING (id != auth.uid() AND public.is_admin(auth.uid()));

CREATE POLICY "admin_update_all_teachers" ON public.teachers
  FOR UPDATE USING (public.is_admin(auth.uid()));