-- ============================
-- Students: new profile fields
-- ============================
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS license_type TEXT,
  ADD COLUMN IF NOT EXISTS theory_test_passed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS theory_test_date DATE,
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- Validation trigger for students.gender
CREATE OR REPLACE FUNCTION validate_student_gender()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.gender IS NOT NULL AND NEW.gender NOT IN ('זכר', 'נקבה', 'אחר') THEN
    RAISE EXCEPTION 'Invalid gender value: %', NEW.gender;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_student_gender ON students;
CREATE TRIGGER trg_validate_student_gender
  BEFORE INSERT OR UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION validate_student_gender();

-- Validation trigger for students.license_type
CREATE OR REPLACE FUNCTION validate_student_license_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.license_type IS NOT NULL AND NEW.license_type NOT IN ('B ידני', 'B אוטומט', 'A1', 'A2', 'A', 'C', 'D', 'CE') THEN
    RAISE EXCEPTION 'Invalid license_type value: %', NEW.license_type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_student_license_type ON students;
CREATE TRIGGER trg_validate_student_license_type
  BEFORE INSERT OR UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION validate_student_license_type();

-- =======================================
-- Teachers: extra fields for substitutes
-- =======================================
ALTER TABLE teachers
  ADD COLUMN IF NOT EXISTS id_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_branch TEXT,
  ADD COLUMN IF NOT EXISTS bank_account TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
