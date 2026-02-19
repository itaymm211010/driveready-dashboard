-- Create teachers table
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  parent_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Teachers can read their own record and their substitutes
CREATE POLICY "teachers_read_own_and_substitutes" ON public.teachers
  FOR SELECT USING (
    auth.uid() = id OR
    auth.uid() = parent_teacher_id
  );

-- Teachers can update their own record
CREATE POLICY "teachers_update_own" ON public.teachers
  FOR UPDATE USING (auth.uid() = id);

-- Add taught_by_teacher_id to lessons
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS taught_by_teacher_id UUID REFERENCES public.teachers(id);

-- Seed the existing teacher (hardcoded ID)
-- NOTE: This will only work if auth.users record exists with this ID.
-- In practice, the teacher needs to sign up first via email auth.
-- After signing up, run this separately:
-- INSERT INTO public.teachers (id, name, email) VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'המורה', 'teacher@example.com')
-- ON CONFLICT (id) DO NOTHING;
