

# Fix: Lesson Data Not Showing on Student Profile

## Problem Analysis

I found **3 bugs** preventing lesson data from appearing correctly on the student profile:

### Bug 1: Database Constraint Violation (Critical)
When ending a lesson, the code tries to save `payment_status: 'unpaid'` but the database only allows: `'paid'`, `'debt'`, or `'pending'`. This causes the entire save to fail silently -- no data gets written.

This matches the database error log: *"new row for relation lessons violates check constraint lessons_payment_status_check"*

**Fix**: Change `'unpaid'` to `'debt'` in `use-save-lesson.ts`.

### Bug 2: Total Lessons Never Updated
When a lesson is completed, the `total_lessons` counter on the student record is never incremented. The profile always shows the original seed value.

**Fix**: Add an update to increment `students.total_lessons` in the save-lesson mutation.

### Bug 3: Readiness Percentage Never Recalculated
The `readiness_percentage` on the student record is never updated after skill statuses change during a lesson.

**Fix**: After updating skills, recalculate readiness as `(mastered skills / total skills) * 100` and update the student record.

## Technical Changes

### File: `src/hooks/use-save-lesson.ts`

1. **Fix payment status value** (line ~26):
   - Change `const paymentStatus = paymentMethod === 'debt' ? 'unpaid' : 'paid';` 
   - To: `const paymentStatus = paymentMethod === 'debt' ? 'debt' : 'paid';`

2. **Increment `total_lessons`** after lesson update:
   - Read current `total_lessons` from the student record
   - Update it to `total_lessons + 1`

3. **Recalculate `readiness_percentage`** after all skill updates:
   - Count total skills for this teacher
   - Count mastered student_skills for this student
   - Compute `Math.round((mastered / total) * 100)`
   - Update the student record

4. **Invalidate `student-profile` query** in `onSuccess` so the profile page refreshes.

### Summary of Changes

| File | Change |
|------|--------|
| `src/hooks/use-save-lesson.ts` | Fix payment_status value, add total_lessons increment, add readiness recalculation, add query invalidation |

