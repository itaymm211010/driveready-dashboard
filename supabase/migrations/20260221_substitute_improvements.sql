-- Add lesson_cost to teachers (for substitute pay tracking)
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS lesson_cost NUMERIC(10,2);

-- Fix FK: allow deleting a substitute even if they taught lessons (set to NULL instead of blocking)
ALTER TABLE public.lessons DROP CONSTRAINT IF EXISTS lessons_taught_by_teacher_id_fkey;
ALTER TABLE public.lessons
  ADD CONSTRAINT lessons_taught_by_teacher_id_fkey
  FOREIGN KEY (taught_by_teacher_id) REFERENCES public.teachers(id) ON DELETE SET NULL;

-- Allow parent teacher to update their substitutes' profiles
CREATE POLICY "teachers_update_substitutes" ON public.teachers
  FOR UPDATE USING (auth.uid() = parent_teacher_id);
