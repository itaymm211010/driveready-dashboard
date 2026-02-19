# Lesson Types — Implementation Guide

## Overview
The system supports 3 lesson types:
| Type | Hebrew | Notes Prefix | Price Field |
|------|--------|-------------|-------------|
| Regular | שיעור רגיל | _(none)_ | `lesson_price` |
| Internal Test | טסט פנימי | `[טסט פנימי]` | `internal_test_price` |
| External Test | טסט חיצוני | `[טסט חיצוני]` | `external_test_price` |

## How It Works

### Storage
Lesson type is encoded as a prefix in the lesson's `notes` field. This avoids a DB migration for a new column.

- Regular lesson notes: `"some note"` or `null`
- Test lesson notes: `"[טסט פנימי] some note"` or `"[טסט פנימי]"`

### Detection Pattern
```typescript
const isInternalTest = lesson.notes?.startsWith('[טסט פנימי]');
const isExternalTest = lesson.notes?.startsWith('[טסט חיצוני]');
const isTest = isInternalTest || isExternalTest;
```

### Stripping Prefix (for display/edit)
```typescript
let userNotes = lesson.notes ?? '';
if (userNotes.startsWith('[טסט פנימי]')) userNotes = userNotes.slice('[טסט פנימי]'.length).trim();
else if (userNotes.startsWith('[טסט חיצוני]')) userNotes = userNotes.slice('[טסט חיצוני]'.length).trim();
```

## Files Involved

### Creating Lessons
- **`AddLessonModal.tsx`** — 3-button type selector, auto-fills price from student, prepends prefix to notes on save. Allows 0 price for tests.

### Active Lesson
- **`ActiveLesson.tsx`** — Detects test type from notes, skips skill selection modal, hides "add skill" button.

### Editing/Canceling
- **`EditLessonModal.tsx`** — Strips prefix before showing notes to user, re-adds on save.
- **`CancelLessonModal.tsx`** — Preserves prefix when storing cancel reason.

### Display
- **`LessonCard.tsx`** (Today page) — Shows type label next to time.
- **`CalendarLessonCard.tsx`** (Week view) — Shows type label next to student name.
- **`DayView.tsx`** (Day view) — Shows type label next to student name.
- **`LessonDetailsModal.tsx`** — Shows lesson type in info section, strips prefix from displayed notes.
- **`StudentProfile.tsx`** — Shows colored badge (blue/purple) in lesson history list.

### Student Pricing
- **`AddStudentModal.tsx`** / **`EditStudentModal.tsx`** — 3 price input fields.
- **`StudentProfile.tsx`** — Displays all 3 prices in bottom card.

## DB Schema
```sql
-- Students table (added 2026-02-19)
ALTER TABLE students ADD COLUMN internal_test_price NUMERIC DEFAULT 0;
ALTER TABLE students ADD COLUMN external_test_price NUMERIC DEFAULT 0;
```

## Known Limitations
- Lesson type is stored in `notes` field (not a dedicated column) — prefix-based detection
- Reports don't separate test lessons from regular lessons yet
- Monthly summary doesn't track test lesson count separately
