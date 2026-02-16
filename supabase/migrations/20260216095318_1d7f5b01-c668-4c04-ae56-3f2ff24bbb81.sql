
-- Add cancellation columns to lessons table
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS cancellation_reason text;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS cancelled_by text;

-- Add performance index for calendar queries
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_date ON public.lessons (teacher_id, date);
