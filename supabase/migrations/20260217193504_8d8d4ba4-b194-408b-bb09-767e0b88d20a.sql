
CREATE OR REPLACE FUNCTION public.seed_default_skills(p_teacher_id UUID)
RETURNS void
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  v_cat1_id UUID;
  v_cat2_id UUID;
  v_cat3_id UUID;
  v_cat4_id UUID;
BEGIN
  -- Category 1: שליטה והפעלת הרכב
  INSERT INTO skill_categories (teacher_id, name, icon, color, sort_order)
  VALUES (p_teacher_id, 'שליטה והפעלת הרכב', '🚗', '#38BDF8', 1)
  RETURNING id INTO v_cat1_id;

  INSERT INTO skills (teacher_id, category_id, name, sort_order) VALUES
    (p_teacher_id, v_cat1_id, 'התנעה וכיבוי', 1),
    (p_teacher_id, v_cat1_id, 'מצמד ונקודת איזון', 2),
    (p_teacher_id, v_cat1_id, 'העברת הילוכים', 3),
    (p_teacher_id, v_cat1_id, 'היגוי', 4),
    (p_teacher_id, v_cat1_id, 'בלימה רגילה', 5),
    (p_teacher_id, v_cat1_id, 'בלימת חירום', 6),
    (p_teacher_id, v_cat1_id, 'נסיעה לאחור', 7),
    (p_teacher_id, v_cat1_id, 'שימוש במראות', 8);

  -- Category 2: התנהלות בדרך
  INSERT INTO skill_categories (teacher_id, name, icon, color, sort_order)
  VALUES (p_teacher_id, 'התנהלות בדרך', '🛣️', '#34D399', 2)
  RETURNING id INTO v_cat2_id;

  INSERT INTO skills (teacher_id, category_id, name, sort_order) VALUES
    (p_teacher_id, v_cat2_id, 'שמירת מרחק', 1),
    (p_teacher_id, v_cat2_id, 'התאמת מהירות', 2),
    (p_teacher_id, v_cat2_id, 'נסיעה בנתיב', 3),
    (p_teacher_id, v_cat2_id, 'חניה מקבילה', 4),
    (p_teacher_id, v_cat2_id, 'חניה עורפית', 5),
    (p_teacher_id, v_cat2_id, 'חניה חזיתית', 6),
    (p_teacher_id, v_cat2_id, 'זיהוי תמרורים', 7),
    (p_teacher_id, v_cat2_id, 'ציות לרמזור', 8),
    (p_teacher_id, v_cat2_id, 'עצירה בצד הדרך', 9);

  -- Category 3: התנהלות בתנועה
  INSERT INTO skill_categories (teacher_id, name, icon, color, sort_order)
  VALUES (p_teacher_id, 'התנהלות בתנועה', '🚦', '#F472B6', 3)
  RETURNING id INTO v_cat3_id;

  INSERT INTO skills (teacher_id, category_id, name, sort_order) VALUES
    (p_teacher_id, v_cat3_id, 'פניה ימינה', 1),
    (p_teacher_id, v_cat3_id, 'פניה שמאלה', 2),
    (p_teacher_id, v_cat3_id, 'כיכר', 3),
    (p_teacher_id, v_cat3_id, 'פניית פרסה', 4),
    (p_teacher_id, v_cat3_id, 'עקיפה', 5),
    (p_teacher_id, v_cat3_id, 'מיזוג נתיבים', 6),
    (p_teacher_id, v_cat3_id, 'זכות קדימה', 7);

  -- Category 4: מצבים מתקדמים
  INSERT INTO skill_categories (teacher_id, name, icon, color, sort_order)
  VALUES (p_teacher_id, 'מצבים מתקדמים', '⭐', '#FBBF24', 4)
  RETURNING id INTO v_cat4_id;

  INSERT INTO skills (teacher_id, category_id, name, sort_order) VALUES
    (p_teacher_id, v_cat4_id, 'נסיעה בכביש מהיר', 1),
    (p_teacher_id, v_cat4_id, 'נסיעה בגשם', 2),
    (p_teacher_id, v_cat4_id, 'נסיעה בלילה', 3),
    (p_teacher_id, v_cat4_id, 'נסיעה עירונית צפופה', 4),
    (p_teacher_id, v_cat4_id, 'התמודדות עם חירום', 5),
    (p_teacher_id, v_cat4_id, 'נהיגה עצמאית (ניווט)', 6),
    (p_teacher_id, v_cat4_id, 'סימולציית מבחן', 7);
END;
$$;
