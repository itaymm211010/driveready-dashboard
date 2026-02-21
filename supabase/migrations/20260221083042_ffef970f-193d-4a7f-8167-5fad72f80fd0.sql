ALTER TABLE public.students ADD COLUMN IF NOT EXISTS pickup_address TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS pickup_address TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS school_address TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS work_address TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS lesson_cost NUMERIC(10,2);

ALTER TABLE public.lessons DROP CONSTRAINT IF EXISTS lessons_taught_by_teacher_id_fkey;
ALTER TABLE public.lessons
  ADD CONSTRAINT lessons_taught_by_teacher_id_fkey
  FOREIGN KEY (taught_by_teacher_id) REFERENCES public.teachers(id) ON DELETE SET NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'teachers_update_substitutes' AND tablename = 'teachers'
  ) THEN
    CREATE POLICY "teachers_update_substitutes" ON public.teachers
      FOR UPDATE USING (auth.uid() = parent_teacher_id);
  END IF;
END $$;