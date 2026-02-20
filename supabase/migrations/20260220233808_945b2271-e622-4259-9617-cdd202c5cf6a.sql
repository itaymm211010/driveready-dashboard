DROP TRIGGER IF EXISTS update_readiness_on_skill_change ON student_skills;
DROP FUNCTION IF EXISTS update_student_readiness();

CREATE OR REPLACE FUNCTION update_student_readiness()
RETURNS TRIGGER AS $$
DECLARE
  total_count  INTEGER;
  rated_count  INTEGER;
  avg_score    NUMERIC;
  coverage     NUMERIC;
  ready_pct    INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM skills sk
  JOIN students st ON st.teacher_id = sk.teacher_id
  WHERE st.id = NEW.student_id;

  SELECT COUNT(*) INTO rated_count
  FROM student_skills
  WHERE student_id = NEW.student_id AND current_score > 0;

  IF total_count = 0 OR rated_count = 0 THEN
    UPDATE students SET readiness_percentage = 0 WHERE id = NEW.student_id;
    RETURN NEW;
  END IF;

  SELECT AVG(current_score::NUMERIC) INTO avg_score
  FROM student_skills
  WHERE student_id = NEW.student_id AND current_score > 0;

  coverage  := rated_count::NUMERIC / total_count::NUMERIC;
  ready_pct := ROUND(coverage * (avg_score / 5.0) * 100)::INTEGER;

  UPDATE students SET readiness_percentage = ready_pct WHERE id = NEW.student_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_readiness_on_skill_change
AFTER INSERT OR UPDATE ON student_skills
FOR EACH ROW
EXECUTE FUNCTION update_student_readiness();

-- Recalculate readiness for all existing students
DO $$
DECLARE
  r RECORD;
  total_count  INTEGER;
  rated_count  INTEGER;
  avg_score    NUMERIC;
  coverage     NUMERIC;
  ready_pct    INTEGER;
BEGIN
  FOR r IN SELECT DISTINCT student_id FROM student_skills LOOP
    SELECT COUNT(*) INTO total_count
    FROM skills sk
    JOIN students st ON st.teacher_id = sk.teacher_id
    WHERE st.id = r.student_id;

    SELECT COUNT(*) INTO rated_count
    FROM student_skills
    WHERE student_id = r.student_id AND current_score > 0;

    IF total_count = 0 OR rated_count = 0 THEN
      UPDATE students SET readiness_percentage = 0 WHERE id = r.student_id;
      CONTINUE;
    END IF;

    SELECT AVG(current_score::NUMERIC) INTO avg_score
    FROM student_skills
    WHERE student_id = r.student_id AND current_score > 0;

    coverage  := rated_count::NUMERIC / total_count::NUMERIC;
    ready_pct := ROUND(coverage * (avg_score / 5.0) * 100)::INTEGER;

    UPDATE students SET readiness_percentage = ready_pct WHERE id = r.student_id;
  END LOOP;
END;
$$;