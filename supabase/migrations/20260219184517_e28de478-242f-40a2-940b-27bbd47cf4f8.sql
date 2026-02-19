CREATE TABLE public.teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  parent_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers_read_own_and_substitutes" ON public.teachers
  FOR SELECT USING (
    auth.uid() = id OR
    auth.uid() = parent_teacher_id
  );

CREATE POLICY "teachers_update_own" ON public.teachers
  FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS taught_by_teacher_id UUID REFERENCES public.teachers(id);