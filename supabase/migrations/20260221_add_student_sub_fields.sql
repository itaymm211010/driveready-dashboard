-- ============================
-- Students: new profile fields
-- ============================
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('זכר', 'נקבה', 'אחר')),
  ADD COLUMN IF NOT EXISTS license_type TEXT CHECK (license_type IN ('B ידני', 'B אוטומט', 'A1', 'A2', 'A', 'C', 'D', 'CE')),
  ADD COLUMN IF NOT EXISTS theory_test_passed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS theory_test_date DATE,
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

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
