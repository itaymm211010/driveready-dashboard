-- Migration: Convert from 3-state status + proficiency to 0-5 score system
-- Date: 2026-02-18
-- Description: Implements comprehensive 0-5 scoring system for skill evaluation

-- ============================================================================
-- PHASE 1: ADD NEW COLUMNS
-- ============================================================================

-- Add current_score to student_skills
ALTER TABLE student_skills
ADD COLUMN current_score INTEGER;

-- Add score to skill_history
ALTER TABLE skill_history
ADD COLUMN score INTEGER;

-- ============================================================================
-- PHASE 2: MIGRATE DATA
-- ============================================================================

-- Migrate student_skills: Use last_proficiency if available, else fallback to current_status
UPDATE student_skills
SET current_score = CASE
  -- Priority 1: Use last_proficiency if it exists
  WHEN last_proficiency IS NOT NULL THEN
    CASE
      WHEN last_proficiency = 0 THEN 0
      WHEN last_proficiency < 20 THEN 1
      WHEN last_proficiency < 40 THEN 2
      WHEN last_proficiency < 60 THEN 3
      WHEN last_proficiency < 80 THEN 4
      ELSE 5
    END
  -- Priority 2: Fallback to current_status
  ELSE
    CASE current_status
      WHEN 'not_learned' THEN 0
      WHEN 'in_progress' THEN 3  -- Conservative middle estimate
      WHEN 'mastered' THEN 5
      ELSE 0  -- Default to unrated
    END
END;

-- Migrate skill_history: Use proficiency_estimate if available, else fallback to status
UPDATE skill_history
SET score = CASE
  -- Priority 1: Use proficiency_estimate if it exists
  WHEN proficiency_estimate IS NOT NULL THEN
    CASE
      WHEN proficiency_estimate = 0 THEN 0
      WHEN proficiency_estimate < 20 THEN 1
      WHEN proficiency_estimate < 40 THEN 2
      WHEN proficiency_estimate < 60 THEN 3
      WHEN proficiency_estimate < 80 THEN 4
      ELSE 5
    END
  -- Priority 2: Fallback to status
  ELSE
    CASE status
      WHEN 'not_learned' THEN 0
      WHEN 'in_progress' THEN 3
      WHEN 'mastered' THEN 5
      ELSE 0
    END
END;

-- ============================================================================
-- PHASE 3: ADD CONSTRAINTS
-- ============================================================================

-- Make current_score NOT NULL and add CHECK constraint
ALTER TABLE student_skills
ALTER COLUMN current_score SET NOT NULL,
ADD CONSTRAINT student_skills_score_range CHECK (current_score >= 0 AND current_score <= 5);

-- Make score NOT NULL and add CHECK constraint
ALTER TABLE skill_history
ALTER COLUMN score SET NOT NULL,
ADD CONSTRAINT skill_history_score_range CHECK (score >= 0 AND score <= 5);

-- ============================================================================
-- PHASE 4: DROP OLD COLUMNS
-- ============================================================================

-- Drop old columns from student_skills
ALTER TABLE student_skills
DROP COLUMN IF EXISTS current_status,
DROP COLUMN IF EXISTS last_proficiency;

-- Drop old columns from skill_history
ALTER TABLE skill_history
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS proficiency_estimate;

-- ============================================================================
-- PHASE 5: UPDATE READINESS CALCULATION TRIGGER
-- ============================================================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS update_readiness_on_skill_change ON student_skills;
DROP FUNCTION IF EXISTS update_student_readiness();

-- Create new readiness calculation function using scores
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
  -- Count rated skills (score > 0)
  SELECT COUNT(*) INTO rated_count
  FROM student_skills
  WHERE student_id = NEW.student_id AND current_score > 0;

  -- If no skills rated, set readiness to 0
  IF rated_count = 0 THEN
    UPDATE students
    SET readiness_percentage = 0
    WHERE id = NEW.student_id;
    RETURN NEW;
  END IF;

  -- Calculate overall average score (0-5 scale)
  SELECT AVG(current_score::NUMERIC) INTO avg_score
  FROM student_skills
  WHERE student_id = NEW.student_id AND current_score > 0;

  -- Check if any skill is below threshold (score < 3)
  SELECT EXISTS(
    SELECT 1 FROM student_skills
    WHERE student_id = NEW.student_id
      AND current_score > 0
      AND current_score < 3
  ) INTO has_low;

  -- Calculate category 4 average (find advanced category)
  -- Note: Adjust category identification as needed for your data
  SELECT AVG(ss.current_score::NUMERIC) INTO cat4_avg
  FROM student_skills ss
  JOIN skills sk ON sk.id = ss.skill_id
  JOIN skill_categories sc ON sc.id = sk.category_id
  WHERE ss.student_id = NEW.student_id
    AND ss.current_score > 0
    AND sc.sort_order = 4;  -- Assuming category 4 is identified by sort_order

  -- Set default if no category 4 skills
  cat4_avg := COALESCE(cat4_avg, 0);

  -- Determine test readiness
  -- Ready if: avg >= 4 AND no low skills AND category 4 avg >= 4
  is_ready := avg_score >= 4
           AND NOT has_low
           AND cat4_avg >= 4;

  -- Convert average score to percentage (0-5 → 0-100)
  ready_pct := ROUND((avg_score / 5.0) * 100)::INTEGER;

  -- Update student record
  UPDATE students
  SET readiness_percentage = ready_pct
  WHERE id = NEW.student_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_readiness_on_skill_change
AFTER INSERT OR UPDATE ON student_skills
FOR EACH ROW
EXECUTE FUNCTION update_student_readiness();

-- ============================================================================
-- PHASE 6: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index on current_score for filtering and aggregation
CREATE INDEX IF NOT EXISTS idx_student_skills_score
ON student_skills(current_score);

-- Index on score in history for trend analysis
CREATE INDEX IF NOT EXISTS idx_skill_history_score
ON skill_history(score);

-- ============================================================================
-- PHASE 7: VALIDATION & REPORTING
-- ============================================================================

-- Create a validation view to check migration results
CREATE OR REPLACE VIEW v_score_migration_validation AS
SELECT
  'student_skills' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN current_score = 0 THEN 1 END) as score_0_not_rated,
  COUNT(CASE WHEN current_score = 1 THEN 1 END) as score_1_no_control,
  COUNT(CASE WHEN current_score = 2 THEN 1 END) as score_2_partial,
  COUNT(CASE WHEN current_score = 3 THEN 1 END) as score_3_most_cases,
  COUNT(CASE WHEN current_score = 4 THEN 1 END) as score_4_good_stable,
  COUNT(CASE WHEN current_score = 5 THEN 1 END) as score_5_test_ready,
  ROUND(AVG(current_score::NUMERIC), 2) as avg_score
FROM student_skills
UNION ALL
SELECT
  'skill_history' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN score = 0 THEN 1 END) as score_0,
  COUNT(CASE WHEN score = 1 THEN 1 END) as score_1,
  COUNT(CASE WHEN score = 2 THEN 1 END) as score_2,
  COUNT(CASE WHEN score = 3 THEN 1 END) as score_3,
  COUNT(CASE WHEN score = 4 THEN 1 END) as score_4,
  COUNT(CASE WHEN score = 5 THEN 1 END) as score_5,
  ROUND(AVG(score::NUMERIC), 2) as avg_score
FROM skill_history;

-- Display validation results
SELECT * FROM v_score_migration_validation;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON COLUMN student_skills.current_score IS 'Skill score 0-5: 0=Not rated, 1=No control, 2=Partial control, 3=Most cases, 4=Good & stable, 5=Test ready';
COMMENT ON COLUMN skill_history.score IS 'Historical skill score 0-5 (same scale as current_score)';
