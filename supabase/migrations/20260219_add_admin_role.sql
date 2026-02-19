-- Add is_admin flag to teachers table
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Allow admins to read ALL teachers (stacks OR with existing policy)
CREATE POLICY "admin_read_all_teachers" ON public.teachers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = auth.uid() AND t.is_admin = true
    )
  );

-- Allow admins to insert new teachers
CREATE POLICY "admin_insert_teachers" ON public.teachers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = auth.uid() AND t.is_admin = true
    )
  );

-- Allow admins to delete teachers (not themselves)
CREATE POLICY "admin_delete_teachers" ON public.teachers
  FOR DELETE USING (
    id != auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = auth.uid() AND t.is_admin = true
    )
  );

-- Allow admins to update any teacher
CREATE POLICY "admin_update_all_teachers" ON public.teachers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = auth.uid() AND t.is_admin = true
    )
  );
