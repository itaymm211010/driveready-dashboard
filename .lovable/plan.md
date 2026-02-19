

# Run Database Migration: Add Test Price Columns

## What will be done

Run the following SQL migration to add two new columns to the `students` table:

```text
ALTER TABLE students ADD COLUMN internal_test_price NUMERIC DEFAULT 0;
ALTER TABLE students ADD COLUMN external_test_price NUMERIC DEFAULT 0;
```

## Details

- **internal_test_price**: Stores the price for internal driving tests (default: 0)
- **external_test_price**: Stores the price for external driving tests (default: 0)
- No code changes needed -- the UI components (AddStudentModal, EditStudentModal, StudentProfile, AddLessonModal) already reference these fields in the current codebase
- GitHub sync happens automatically in Lovable

## Technical Notes

- The migration is safe to run: these columns do not currently exist in the database
- Using `NUMERIC` type with `DEFAULT 0` matches the existing `lesson_price` column pattern
- The `types.ts` file will auto-regenerate after the migration to include the new columns

