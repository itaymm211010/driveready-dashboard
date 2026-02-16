

## Lesson Time Logging + Student Profile Enhancement

### Overview
Two improvements from the uploaded spec:
1. **Lesson Time Logging** -- Track actual start/end times, calculate duration variance, show smart timer with color-coded remaining time
2. **Student Profile Enhancement** -- Redesigned profile with radar chart, progress over time graph, next lesson card, teacher notes, and improved lesson history with time data

---

### Part 1: Lesson Time Logging

#### 1.1 Database Changes

Add columns to `lessons` table:
- `actual_start_time` (timestamptz, nullable) -- when teacher clicked "Start"
- `actual_end_time` (timestamptz, nullable) -- when teacher clicked "End"
- `actual_duration_minutes` (int, nullable) -- calculated actual duration
- `scheduled_duration_minutes` (int, nullable) -- planned duration from time_start/time_end
- `duration_variance_minutes` (int, nullable) -- actual minus scheduled

New table `lesson_time_log`:
- `id` UUID primary key
- `lesson_id` UUID references lessons(id) ON DELETE CASCADE
- `event_type` text NOT NULL ('started', 'ended')
- `timestamp` timestamptz default now()
- `notes` text nullable
- Indexes on `lesson_id` and `timestamp`

#### 1.2 Start Lesson Flow

**Modify `LessonCard.tsx`** (or wherever "Start Lesson" is triggered):
- When clicking "Start", write `actual_start_time = NOW()` and `status = 'in_progress'` to the lesson
- Insert a `lesson_time_log` entry with event_type = 'started'
- Calculate `scheduled_duration_minutes` from `time_start`/`time_end` and save it

**Modify `ActiveLesson.tsx`**:
- On mount, read `actual_start_time` from the lesson data
- Use `actual_start_time` as the timer base instead of starting from 0
- Show enhanced timer header with:
  - Running timer (color-coded: green = on time, amber = approaching end, red = overtime)
  - "Started at: HH:MM"
  - "Scheduled end: HH:MM"  
  - "X minutes remaining" or "Over by X minutes"

#### 1.3 End Lesson Flow

**Modify `use-save-lesson.ts`**:
- Write `actual_end_time = NOW()` when ending
- Calculate `actual_duration_minutes` from start to end
- Calculate `duration_variance_minutes` = actual - scheduled
- Insert a `lesson_time_log` entry with event_type = 'ended'

**Modify `EndLessonModal.tsx`**:
- Show time summary section: started at, ended at, actual duration, scheduled duration, variance (+/- X min)
- Pass actual duration data from ActiveLesson

#### 1.4 New Hook: `use-start-lesson.ts`

A mutation hook that:
- Updates the lesson with `actual_start_time`, `scheduled_duration_minutes`, `status = 'in_progress'`
- Inserts a `lesson_time_log` entry
- Invalidates relevant queries
- Returns the updated lesson

---

### Part 2: Student Profile Enhancement

#### 2.1 Enhanced Lesson History

**Modify `StudentProfile.tsx`** lesson history section:
- Show actual time range (e.g., "08:05 - 09:42 (97 min)")
- Show variance badge: "+7 min" in red or "-5 min" in green
- Show skills practiced count
- Show payment status badge

#### 2.2 Radar Chart for Skill Categories

**Add to `StudentProfile.tsx`**:
- Use `recharts` RadarChart to show mastery % per skill category
- Each axis = one skill category
- Value = percentage of mastered skills in that category

#### 2.3 Progress Over Time Line Chart

**Add to `StudentProfile.tsx`**:
- Use `recharts` LineChart showing readiness % over time
- X-axis = lesson dates (aggregated monthly)
- Y-axis = cumulative mastered skills percentage
- Data derived from `skill_history` entries

#### 2.4 Next Lesson Card

**Add to `StudentProfile.tsx`**:
- Query upcoming scheduled lessons for this student
- Show date, time, and "in X days" countdown
- Quick action buttons: navigate to lesson, prepare plan

#### 2.5 Teacher Notes Section

**Database**: Add `teacher_notes` (text, nullable) column to `students` table

**Add to `StudentProfile.tsx`**:
- Editable notes textarea
- Auto-save on blur with debounce
- Shows "Private teacher notes" label

#### 2.6 Quick Action Cards

**Modify `StudentProfile.tsx`**:
- Add a horizontal scrollable row of quick action buttons:
  - Call, WhatsApp, Schedule Lesson, View Report, Send Payment Reminder

---

### Technical Details

**New files:**
- `src/hooks/use-start-lesson.ts` -- mutation for starting a lesson with time tracking

**Modified files:**
- `src/pages/teacher/ActiveLesson.tsx` -- smart timer based on actual_start_time, color-coded, remaining time
- `src/components/teacher/EndLessonModal.tsx` -- time summary section with variance
- `src/hooks/use-save-lesson.ts` -- write actual_end_time, duration fields, time log entry
- `src/pages/teacher/StudentProfile.tsx` -- radar chart, progress chart, next lesson card, teacher notes, enhanced history
- `src/components/teacher/LessonCard.tsx` -- call start-lesson hook on "Start" click

**Database migration:**
- Add 5 columns to `lessons` table
- Create `lesson_time_log` table with indexes
- Add `teacher_notes` column to `students` table

**Dependencies:** No new packages. Uses existing `recharts`, `date-fns`, `framer-motion`.

