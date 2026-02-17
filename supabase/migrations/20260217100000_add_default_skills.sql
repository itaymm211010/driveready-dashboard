-- Migration: Add color column to skill_categories and create function to seed 31 default driving skills
-- Date: 2026-02-17
-- Description: Adds color field to categories table and creates a reusable function
--              that populates the 4 spec categories and 31 skills for a given teacher.

-- 1. Add color column to skill_categories if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'skill_categories'
      AND column_name = 'color'
  ) THEN
    ALTER TABLE public.skill_categories ADD COLUMN color TEXT;
  END IF;
END
$$;

-- 2. Create (or replace) a function to seed default skills for a teacher
CREATE OR REPLACE FUNCTION public.seed_default_skills(p_teacher_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cat1_id UUID;
  v_cat2_id UUID;
  v_cat3_id UUID;
  v_cat4_id UUID;
BEGIN
  -- Skip if this teacher already has categories (idempotent)
  IF EXISTS (SELECT 1 FROM skill_categories WHERE teacher_id = p_teacher_id LIMIT 1) THEN
    RETURN;
  END IF;

  -- Category 1: שליטה והפעלת הרכב (Vehicle Control)
  INSERT INTO skill_categories (teacher_id, name, icon, color, sort_order)
  VALUES (p_teacher_id, 'שליטה והפעלת הרכב', '🚗', '#38BDF8', 1)
  RETURNING id INTO v_cat1_id;

  -- Category 2: התנהלות בדרך (Road Behavior)
  INSERT INTO skill_categories (teacher_id, name, icon, color, sort_order)
  VALUES (p_teacher_id, 'התנהלות בדרך', '🛣️', '#34D399', 2)
  RETURNING id INTO v_cat2_id;

  -- Category 3: התנהלות בתנועה (Traffic Behavior)
  INSERT INTO skill_categories (teacher_id, name, icon, color, sort_order)
  VALUES (p_teacher_id, 'התנהלות בתנועה', '🚦', '#F472B6', 3)
  RETURNING id INTO v_cat3_id;

  -- Category 4: מצבים מתקדמים (Advanced Situations)
  INSERT INTO skill_categories (teacher_id, name, icon, color, sort_order)
  VALUES (p_teacher_id, 'מצבים מתקדמים', '⭐', '#FBBF24', 4)
  RETURNING id INTO v_cat4_id;

  -- Category 1 Skills (8 skills): שליטה והפעלת הרכב
  INSERT INTO skills (category_id, teacher_id, name, sort_order) VALUES
    (v_cat1_id, p_teacher_id, 'התנעה וכיבוי', 1),
    (v_cat1_id, p_teacher_id, 'התחלת נסיעה', 2),
    (v_cat1_id, p_teacher_id, 'שימוש נכון במצמד / גלישה', 3),
    (v_cat1_id, p_teacher_id, 'העלאה והורדת הילוכים', 4),
    (v_cat1_id, p_teacher_id, 'היגוי בקו ישר ופניות', 5),
    (v_cat1_id, p_teacher_id, 'זינוק בעלייה', 6),
    (v_cat1_id, p_teacher_id, 'עצירת מטרה', 7),
    (v_cat1_id, p_teacher_id, 'שליטה כללית ברכב', 8);

  -- Category 2 Skills (9 skills): התנהלות בדרך
  INSERT INTO skills (category_id, teacher_id, name, sort_order) VALUES
    (v_cat2_id, p_teacher_id, 'נסיעה בימין הדרך', 1),
    (v_cat2_id, p_teacher_id, 'זיהוי כביש חד/דו סטרי', 2),
    (v_cat2_id, p_teacher_id, 'הרגלי הסתכלות', 3),
    (v_cat2_id, p_teacher_id, 'התקרבות לצומת', 4),
    (v_cat2_id, p_teacher_id, 'ציות לתמרורים ורמזורים', 5),
    (v_cat2_id, p_teacher_id, 'פניות ימינה', 6),
    (v_cat2_id, p_teacher_id, 'פניות שמאלה ופרסה', 7),
    (v_cat2_id, p_teacher_id, 'מעבר נתיבים', 8),
    (v_cat2_id, p_teacher_id, 'נסיעה לאחור וחניה', 9);

  -- Category 3 Skills (7 skills): התנהלות בתנועה
  INSERT INTO skills (category_id, teacher_id, name, sort_order) VALUES
    (v_cat3_id, p_teacher_id, 'מהירות וקצב נסיעה', 1),
    (v_cat3_id, p_teacher_id, 'שמירת רווח ואומדן רוחב', 2),
    (v_cat3_id, p_teacher_id, 'מתן זכות קדימה', 3),
    (v_cat3_id, p_teacher_id, 'התייחסות להולכי רגל', 4),
    (v_cat3_id, p_teacher_id, 'התנהגות במעגל תנועה', 5),
    (v_cat3_id, p_teacher_id, 'השתלבות בתנועה', 6),
    (v_cat3_id, p_teacher_id, 'עקיפות', 7);

  -- Category 4 Skills (7 skills): מצבים מתקדמים
  INSERT INTO skills (category_id, teacher_id, name, sort_order) VALUES
    (v_cat4_id, p_teacher_id, 'נהיגה בין עירונית', 1),
    (v_cat4_id, p_teacher_id, 'נהיגה בדרך מהירה', 2),
    (v_cat4_id, p_teacher_id, 'התמזגויות', 3),
    (v_cat4_id, p_teacher_id, 'התייחסות לרכב ביטחון', 4),
    (v_cat4_id, p_teacher_id, 'נת"צ', 5),
    (v_cat4_id, p_teacher_id, 'קבלת החלטות עצמאית', 6),
    (v_cat4_id, p_teacher_id, 'נהיגה רציפה ללא התערבות', 7);
END;
$$;

-- 3. Grant execute permission so authenticated users can call this function
GRANT EXECUTE ON FUNCTION public.seed_default_skills(UUID) TO authenticated;

-- 4. Seed defaults for any existing teachers who have no categories yet
-- This finds distinct teacher_ids from the students table (since there's no teachers table yet)
-- and seeds skills for those who don't have categories.
DO $$
DECLARE
  v_teacher_id UUID;
BEGIN
  FOR v_teacher_id IN
    SELECT DISTINCT teacher_id FROM public.students
    WHERE teacher_id NOT IN (SELECT DISTINCT teacher_id FROM public.skill_categories)
  LOOP
    PERFORM public.seed_default_skills(v_teacher_id);
  END LOOP;
END
$$;
