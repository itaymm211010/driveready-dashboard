
-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  balance NUMERIC NOT NULL DEFAULT 0,
  readiness_percentage INTEGER NOT NULL DEFAULT 0,
  total_lessons INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  date DATE NOT NULL,
  time_start TEXT NOT NULL,
  time_end TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  amount NUMERIC NOT NULL DEFAULT 0,
  skills_practiced TEXT[],
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('paid', 'debt', 'pending')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create skill_categories table
CREATE TABLE public.skill_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📋',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create skills table
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.skill_categories(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create student_skills table (per-student skill status)
CREATE TABLE public.student_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  current_status TEXT NOT NULL DEFAULT 'not_learned' CHECK (current_status IN ('not_learned', 'in_progress', 'mastered')),
  times_practiced INTEGER NOT NULL DEFAULT 0,
  last_practiced_date DATE,
  last_proficiency INTEGER,
  last_note TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, skill_id)
);

-- Create skill_history table
CREATE TABLE public.skill_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_skill_id UUID NOT NULL REFERENCES public.student_skills(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  lesson_number INTEGER,
  lesson_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_learned', 'in_progress', 'mastered')),
  proficiency_estimate INTEGER,
  teacher_note TEXT,
  practice_duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_history ENABLE ROW LEVEL SECURITY;

-- RLS policies: teachers can only access their own data
CREATE POLICY "Teachers manage own students" ON public.students FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers manage own lessons" ON public.lessons FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers manage own categories" ON public.skill_categories FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers manage own skills" ON public.skills FOR ALL USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers manage student skills" ON public.student_skills FOR ALL USING (
  EXISTS (SELECT 1 FROM public.students WHERE students.id = student_skills.student_id AND students.teacher_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.students WHERE students.id = student_skills.student_id AND students.teacher_id = auth.uid())
);
CREATE POLICY "Teachers manage skill history" ON public.skill_history FOR ALL USING (
  EXISTS (SELECT 1 FROM public.student_skills ss JOIN public.students s ON s.id = ss.student_id WHERE ss.id = skill_history.student_skill_id AND s.teacher_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.student_skills ss JOIN public.students s ON s.id = ss.student_id WHERE ss.id = skill_history.student_skill_id AND s.teacher_id = auth.uid())
);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_skills_updated_at BEFORE UPDATE ON public.student_skills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_lessons_student_id ON public.lessons(student_id);
CREATE INDEX idx_lessons_teacher_date ON public.lessons(teacher_id, date);
CREATE INDEX idx_skills_category_id ON public.skills(category_id);
CREATE INDEX idx_student_skills_student ON public.student_skills(student_id);
CREATE INDEX idx_student_skills_skill ON public.student_skills(skill_id);
CREATE INDEX idx_skill_history_student_skill ON public.skill_history(student_skill_id);
