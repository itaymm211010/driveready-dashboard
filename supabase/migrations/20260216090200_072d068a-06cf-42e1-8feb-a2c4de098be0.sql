
-- Table to track which skills are planned/selected for each lesson
CREATE TABLE public.lesson_planned_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  added_before_lesson BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(lesson_id, skill_id)
);

-- Enable RLS
ALTER TABLE public.lesson_planned_skills ENABLE ROW LEVEL SECURITY;

-- RLS: Teachers manage their own lesson skills (via lessons table)
CREATE POLICY "Teachers manage lesson planned skills"
ON public.lesson_planned_skills
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.lessons
    WHERE lessons.id = lesson_planned_skills.lesson_id
    AND lessons.teacher_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lessons
    WHERE lessons.id = lesson_planned_skills.lesson_id
    AND lessons.teacher_id = auth.uid()
  )
);

-- Temp policies for development (no auth yet)
CREATE POLICY "Temp: allow all reads on lesson_planned_skills"
ON public.lesson_planned_skills
FOR SELECT
USING (true);

CREATE POLICY "Temp: allow all writes on lesson_planned_skills"
ON public.lesson_planned_skills
FOR ALL
USING (true)
WITH CHECK (true);
