
-- Migration: Convert from 3-state status + proficiency to 0-5 score system

-- PHASE 1: ADD NEW COLUMNS
ALTER TABLE student_skills
ADD COLUMN IF NOT EXISTS current_score INTEGER;

ALTER TABLE skill_history
ADD COLUMN IF NOT EXISTS score INTEGER;

-- PHASE 2: MIGRATE DATA
UPDATE student_skills
SET current_score = CASE
  WHEN last_proficiency IS NOT NULL THEN
    CASE
      WHEN last_proficiency = 0 THEN 0
      WHEN last_proficiency < 20 THEN 1
      WHEN last_proficiency < 40 THEN 2
      WHEN last_proficiency < 60 THEN 3
      WHEN last_proficiency < 80 THEN 4
      ELSE 5
    END
  ELSE
    CASE current_status
      WHEN 'not_learned' THEN 0
      WHEN 'in_progress' THEN 3
      WHEN 'mastered' THEN 5
      ELSE 0
    END
END;

UPDATE skill_history
SET score = CASE
  WHEN proficiency_estimate IS NOT NULL THEN
    CASE
      WHEN proficiency_estimate = 0 THEN 0
      WHEN proficiency_estimate < 20 THEN 1
      WHEN proficiency_estimate < 40 THEN 2
      WHEN proficiency_estimate < 60 THEN 3
      WHEN proficiency_estimate < 80 THEN 4
      ELSE 5
    END
  ELSE
    CASE status
      WHEN 'not_learned' THEN 0
      WHEN 'in_progress' THEN 3
      WHEN 'mastered' THEN 5
      ELSE 0
    END
END;

-- PHASE 3: ADD CONSTRAINTS
ALTER TABLE student_skills
ALTER COLUMN current_score SET NOT NULL;

ALTER TABLE student_skills
ADD CONSTRAINT student_skills_score_range CHECK (current_score >= 0 AND current_score <= 5);

ALTER TABLE skill_history
ALTER COLUMN score SET NOT NULL;

ALTER TABLE skill_history
ADD CONSTRAINT skill_history_score_range CHECK (score >= 0 AND score <= 5);

-- PHASE 4: DROP OLD COLUMNS
ALTER TABLE student_skills
DROP COLUMN IF EXISTS current_status,
DROP COLUMN IF EXISTS last_proficiency;

ALTER TABLE skill_history
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS proficiency_estimate;

-- PHASE 5: UPDATE READINESS CALCULATION TRIGGER
DROP TRIGGER IF EXISTS update_readiness_on_skill_change ON student_skills;
DROP FUNCTION IF EXISTS update_student_readiness();

CREATE OR REPLACE FUNCTION update_student_readiness()
RETURNS TRIGGER AS $$
DECLARE
  rated_count INTEGER;
  avg_score NUMERIC;
  has_low BOOLEAN;
  cat4_avg NUMERIC;
  is_ready BOOLEAN;
  ready_pct INTEGER;
BEGIN
  SELECT COUNT(*) INTO rated_count
  FROM student_skills
  WHERE student_id = NEW.student_id AND current_score > 0;

  IF rated_count = 0 THEN
    UPDATE students SET readiness_percentage = 0 WHERE id = NEW.student_id;
    RETURN NEW;
  END IF;

  SELECT AVG(current_score::NUMERIC) INTO avg_score
  FROM student_skills
  WHERE student_id = NEW.student_id AND current_score > 0;

  SELECT EXISTS(
    SELECT 1 FROM student_skills
    WHERE student_id = NEW.student_id AND current_score > 0 AND current_score < 3
  ) INTO has_low;

  SELECT AVG(ss.current_score::NUMERIC) INTO cat4_avg
  FROM student_skills ss
  JOIN skills sk ON sk.id = ss.skill_id
  JOIN skill_categories sc ON sc.id = sk.category_id
  WHERE ss.student_id = NEW.student_id AND ss.current_score > 0 AND sc.sort_order = 4;

  cat4_avg := COALESCE(cat4_avg, 0);

  is_ready := avg_score >= 4 AND NOT has_low AND cat4_avg >= 4;
  ready_pct := ROUND((avg_score / 5.0) * 100)::INTEGER;

  UPDATE students SET readiness_percentage = ready_pct WHERE id = NEW.student_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_readiness_on_skill_change
AFTER INSERT OR UPDATE ON student_skills
FOR EACH ROW
EXECUTE FUNCTION update_student_readiness();

-- PHASE 6: INDEXES
CREATE INDEX IF NOT EXISTS idx_student_skills_score ON student_skills(current_score);
CREATE INDEX IF NOT EXISTS idx_skill_history_score ON skill_history(score);

-- COMMENTS
COMMENT ON COLUMN student_skills.current_score IS 'Skill score 0-5: 0=Not rated, 1=No control, 2=Partial control, 3=Most cases, 4=Good & stable, 5=Test ready';
COMMENT ON COLUMN skill_history.score IS 'Historical skill score 0-5 (same scale as current_score)';
