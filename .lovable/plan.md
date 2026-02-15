

# Add New Lesson Feature

## Overview
Add the ability to create a new lesson for a student. The feature will be accessible from two places:
1. The **Today** page (`TeacherToday`) -- a floating "+" button to schedule a lesson for today
2. The **Student Profile** page -- a button in the Lesson History section to add a lesson for that specific student

## What Gets Built

### 1. New Component: `AddLessonModal.tsx`
A reusable modal (Dialog) for creating a new lesson with the following fields:
- **Student** -- a dropdown select (pre-filled if opened from a student profile)
- **Date** -- a date picker (defaults to today)
- **Start Time** -- time input (e.g. "14:00")
- **End Time** -- time input (e.g. "14:45")
- **Amount** -- number input for payment amount in shekels

On submit, inserts a row into the `lessons` table with `status: 'scheduled'` and `payment_status: 'pending'`.

### 2. Integration Points
- **TeacherToday.tsx**: Add a floating action button (FAB) at the bottom-right corner with a "+" icon. Opens the modal without a pre-selected student.
- **StudentProfile.tsx**: Add a "+" button next to the "Lesson History" card title. Opens the modal with the student pre-selected and the select field disabled.

### 3. Data Flow
- The modal fetches the students list for the dropdown (reuses the existing `students` table query)
- On successful creation, invalidates `today-lessons` and `student-profile` queries so both pages refresh
- Shows a success toast via `sonner`

## Technical Details

### New File: `src/components/teacher/AddLessonModal.tsx`
```
Props:
- open: boolean
- onOpenChange: (open: boolean) => void
- preselectedStudentId?: string  // when opened from student profile
```

Uses:
- `Dialog` from Shadcn UI
- `Input` for time and amount fields
- `Select` from Shadcn UI for student picker
- `Popover` + `Calendar` for date picker (following the Shadcn datepicker pattern with `pointer-events-auto`)
- `useMutation` from TanStack Query to insert into `lessons`

### Insert Shape
```typescript
{
  student_id: selectedStudentId,
  teacher_id: currentTeacherId,  // hardcoded or from context for now
  date: selectedDate,
  time_start: startTime,
  time_end: endTime,
  amount: amount,
  status: 'scheduled',
  payment_status: 'pending'
}
```

Note: Since there's no authentication yet, `teacher_id` will need a temporary placeholder (same pattern used elsewhere in the app).

### Edited Files
| File | Change |
|------|--------|
| `src/components/teacher/AddLessonModal.tsx` | Create -- lesson creation modal |
| `src/pages/teacher/TeacherToday.tsx` | Edit -- add floating "+" button |
| `src/pages/teacher/StudentProfile.tsx` | Edit -- add "+" button in Lesson History header |

