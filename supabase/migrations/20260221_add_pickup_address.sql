-- Default pickup address stored on the student
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS pickup_address TEXT;

-- Per-lesson pickup address (pre-filled from student default, can be overridden)
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS pickup_address TEXT;
