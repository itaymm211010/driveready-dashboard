
# Run Database Migration: Create Teachers Table and Update Lessons

## What will be done

Run a SQL migration to:

1. **Create the `teachers` table** with columns: id, name, email, phone, parent_teacher_id, created_at
2. **Enable RLS** on the teachers table with two policies:
   - Teachers can read their own record and their substitutes' records
   - Teachers can update their own record
3. **Add `taught_by_teacher_id`** column to the `lessons` table (foreign key to teachers)
4. **Enable Email/Password authentication** in auth settings

## SQL to Execute

```text
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
```

## Technical Notes

- The `teachers` table does not currently exist in the database, confirmed by query
- The `taught_by_teacher_id` column is also missing from `lessons`
- The TypeScript types already include both `teachers` and `taught_by_teacher_id`, so no code changes are needed
- Email/Password auth will be enabled via the configure-auth tool
- The `create-substitute` edge function already exists and depends on this table
