
-- Add time tracking columns to lessons table
ALTER TABLE public.lessons
  ADD COLUMN actual_start_time timestamptz,
  ADD COLUMN actual_end_time timestamptz,
  ADD COLUMN actual_duration_minutes integer,
  ADD COLUMN scheduled_duration_minutes integer,
  ADD COLUMN duration_variance_minutes integer;

-- Add teacher_notes to students table
ALTER TABLE public.students
  ADD COLUMN teacher_notes text;

-- Create lesson_time_log table
CREATE TABLE public.lesson_time_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  notes text
);

CREATE INDEX idx_lesson_time_log_lesson_id ON public.lesson_time_log(lesson_id);
CREATE INDEX idx_lesson_time_log_timestamp ON public.lesson_time_log(timestamp);

-- Enable RLS
ALTER TABLE public.lesson_time_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for lesson_time_log
CREATE POLICY "Teachers manage lesson time logs"
  ON public.lesson_time_log FOR ALL
  USING (EXISTS (
    SELECT 1 FROM lessons WHERE lessons.id = lesson_time_log.lesson_id AND lessons.teacher_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM lessons WHERE lessons.id = lesson_time_log.lesson_id AND lessons.teacher_id = auth.uid()
  ));

-- Temp permissive policies (matching existing pattern)
CREATE POLICY "Temp: allow all reads on lesson_time_log"
  ON public.lesson_time_log FOR SELECT USING (true);

CREATE POLICY "Temp: allow all writes on lesson_time_log"
  ON public.lesson_time_log FOR ALL USING (true) WITH CHECK (true);
