-- Additional student pickup locations
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS school_address TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS work_address TEXT;
