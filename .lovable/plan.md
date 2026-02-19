

# Run Database Migration: Add Admin Role to Teachers

## What will be done

Execute a SQL migration to add admin capabilities to the teachers table:

1. **Add `is_admin` column** (BOOLEAN, default false) to the `teachers` table
2. **Create `is_admin()` security definer function** to safely check admin status without RLS recursion
3. **Create 4 admin RLS policies** on the `teachers` table:
   - `admin_read_all_teachers` -- admins can view all teacher records
   - `admin_insert_teachers` -- admins can add new teachers
   - `admin_delete_teachers` -- admins can delete teachers (but not themselves)
   - `admin_update_all_teachers` -- admins can update any teacher record

## SQL to Execute

```text
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teachers
    WHERE id = _user_id AND is_admin = true
  )
$$;

CREATE POLICY "admin_read_all_teachers" ON public.teachers
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "admin_insert_teachers" ON public.teachers
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "admin_delete_teachers" ON public.teachers
  FOR DELETE USING (id != auth.uid() AND public.is_admin(auth.uid()));

CREATE POLICY "admin_update_all_teachers" ON public.teachers
  FOR UPDATE USING (public.is_admin(auth.uid()));
```

## Technical Notes

- Confirmed via database queries: `is_admin` column, `is_admin()` function, and admin policies do **not** yet exist
- The `SECURITY DEFINER` function pattern prevents infinite recursion when RLS policies query the same table
- The existing TypeScript types and code (AuthContext, TeachersPage, edge functions) already reference `is_admin`, so no code changes are needed
- The migration file already exists in the repo (`supabase/migrations/20260219_add_admin_role.sql`) with the correct content -- it just needs to be executed

