

## Calendar System for DRIVEKAL

### Overview
Adding a full lesson calendar with Week, Day, and Month views, plus modals for viewing, editing, and cancelling lessons. This is a large feature that will be built incrementally.

### Phase 1: Database Updates

Add cancellation-related columns to the `lessons` table:
- `cancellation_reason` (text, nullable)
- `cancelled_at` (timestamptz, nullable)
- `cancelled_by` (text, nullable -- 'teacher' or 'student')

Add a performance index on `(teacher_id, date)` for fast calendar queries.

### Phase 2: Data Hooks

**New hook: `use-calendar-lessons.ts`**
- Accepts `view` (week/day/month) and a reference `date`
- Calculates the date range based on view type
- Fetches lessons + joined student data (name, phone, balance) for that range
- Returns lessons grouped by date, plus summary stats (total lessons, expected revenue, students with debt, cancelled count)

**New hook: `use-lesson-conflicts.ts`**
- Accepts date, time_start, duration, and optional exclude_lesson_id
- Queries for overlapping lessons
- Returns conflict list for display in add/edit modals

### Phase 3: Calendar Page and Views

**New page: `src/pages/teacher/CalendarPage.tsx`**
- Route: `/teacher/calendar`
- Header with date navigation arrows and [+] add button
- View switcher tabs (Week / Day / Month)
- Renders the active sub-view
- Applies the existing glassmorphism design system

**Week View (`src/components/teacher/calendar/WeekView.tsx`)**
- 7-column grid with time slots (06:00-20:00)
- Horizontally scrollable on mobile
- Lesson cards color-coded by payment status (green = paid, red = debt, amber = in progress, gray = cancelled)
- Tap lesson card opens details modal; tap empty slot opens add modal with pre-filled time
- Summary footer with week stats

**Day View (`src/components/teacher/calendar/DayView.tsx`)**
- Vertical timeline for a single day
- Larger lesson cards showing student name, phone, price, balance
- Quick action buttons (call, WhatsApp, navigate, start lesson)
- Available slots clearly marked with dashed borders

**Month View (`src/components/teacher/calendar/MonthView.tsx`)**
- Standard calendar grid
- Each day cell shows lesson count badge
- Color indicators: red dot for debt days, warning for cancellations
- Tap a day navigates to Day View for that date
- Month summary panel at bottom

### Phase 4: Modals

**Lesson Details Modal (`LessonDetailsModal.tsx`)**
- Shows full lesson info + student summary (phone, balance, readiness, total lessons)
- Quick actions: Call, WhatsApp, View Profile
- Bottom actions: Cancel Lesson, Edit, Start Lesson

**Edit Lesson Modal (`EditLessonModal.tsx`)**
- Pre-filled form (student name shown but not editable)
- Can change date, time, duration, price, notes
- Auto-calculates end time from start + duration
- Conflict detection warning
- Uses existing duration presets (30/60/90/120 min)

**Cancel Lesson Modal (`CancelLessonModal.tsx`)**
- Confirmation dialog with lesson details
- Reason selector (radio: Student cancelled / Teacher unavailable / Weather / Other)
- Updates lesson status to 'cancelled' and writes cancellation fields

**Enhanced Add Lesson Modal**
- Upgrade existing `AddLessonModal` with duration presets and auto-calculated end time
- Add conflict detection warning
- Add optional notes field
- Invalidate calendar queries on success

### Phase 5: Navigation Integration

Update `BottomNav.tsx`:
```
[Home Today] [Calendar] [Students] [Reports]
```
Add calendar icon tab pointing to `/teacher/calendar`.

Update `App.tsx` with new route:
- `/teacher/calendar` -- CalendarPage

### Technical Details

**New files to create:**
1. `src/pages/teacher/CalendarPage.tsx`
2. `src/components/teacher/calendar/WeekView.tsx`
3. `src/components/teacher/calendar/DayView.tsx`
4. `src/components/teacher/calendar/MonthView.tsx`
5. `src/components/teacher/calendar/CalendarLessonCard.tsx`
6. `src/components/teacher/calendar/ViewSwitcher.tsx`
7. `src/components/teacher/LessonDetailsModal.tsx`
8. `src/components/teacher/EditLessonModal.tsx`
9. `src/components/teacher/CancelLessonModal.tsx`
10. `src/hooks/use-calendar-lessons.ts`
11. `src/hooks/use-lesson-conflicts.ts`

**Files to modify:**
- `src/App.tsx` -- add calendar route
- `src/components/teacher/BottomNav.tsx` -- add calendar tab
- `src/components/teacher/AddLessonModal.tsx` -- add duration presets, conflict detection, notes field, invalidate calendar queries

**Dependencies:** No new packages needed. Uses existing `date-fns`, `framer-motion`, `lucide-react`, and shadcn/ui components.

**Scope note:** Recurring lessons, drag-and-drop rescheduling, and external calendar sync are deferred to Phase 2 as specified in the document.

