# DriveReady Dashboard — Claude Guidelines

## Project Overview
Driving school management app (Hebrew RTL). Built with React + TypeScript + Supabase + Vite + Tailwind + shadcn/ui.

## Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- **Data:** Supabase (Postgres), TanStack React Query
- **Routing:** react-router-dom
- **Charts:** Recharts
- **Hosting:** Lovable (synced via GitHub)

## Key Architecture
- **Auth:** Supabase Auth. Teachers log in with email/password. Admins have `is_admin = true` in `teachers` table.
- **rootTeacherId:** Sourced from `AuthContext`. For teachers = their own ID (or parent if substitute). For admins = `null` unless impersonating.
- **Admin impersonation:** Admin can view any teacher's data via `setViewingAs(id, name)` in `AuthContext`. This sets `rootTeacherId` to the target teacher's ID, enabling all existing hooks to work without changes. Exit via `ImpersonationBanner`.
- **State management:** React Query for server state, local useState for UI
- **DB types:** Auto-generated at `src/integrations/supabase/types.ts` — update manually when adding columns, Lovable will regenerate on sync

## Conventions

### Lesson Types
Lessons have 3 types: regular, internal test (טסט פנימי), external test (טסט חיצוני).
- **Storage:** Lesson type is stored as a **prefix in the `notes` field**: `[טסט פנימי]` or `[טסט חיצוני]`. Regular lessons have no prefix.
- **Detection:** Always use `notes?.startsWith('[טסט פנימי]')` / `notes?.startsWith('[טסט חיצוני]')`.
- **Editing:** When editing or canceling, strip prefix before showing to user, re-add on save.
- **Skills:** Test lessons skip skill selection entirely (no planned skills, no skill modal).

### Student Pricing
Each student has 3 price fields:
- `lesson_price` — regular lesson
- `internal_test_price` — internal test
- `external_test_price` — external test

AddLessonModal auto-fills amount based on selected lesson type + student price.

### Duration Presets
Lesson duration presets: **40, 80, 120, 160** minutes. Default: **40**.

### Calendar Hours
Day/Week views show hours **06:00–22:00** (17 slots). Defined as `HOURS = Array.from({ length: 17 }, (_, i) => i + 6)` in `DayView.tsx` and `WeekView.tsx`.

### Font Sizes
All font sizes use **rem units** (not px) so they scale with `FontSizeProvider`. Use `text-[0.625rem]` instead of `text-[10px]`, `text-[0.5625rem]` instead of `text-[9px]`.

### Lesson Start Guard
A lesson can only be started when `canStartLesson(date, timeStart)` returns `true` (i.e., `now >= scheduled start time`). Located in `src/lib/utils.ts`. Enforced in `LessonCard` and `LessonDetailsModal`.

### Lesson Planning Flow
Teachers can plan skills **before** a lesson starts via `LessonPlanModal`:
- Opens from "📋 תכנן מיומנויות" in `LessonDetailsModal` for scheduled/in-progress lessons
- Before lesson time → saves skills with `addedBeforeLesson: true`, shows "שמור תכנון"
- At/after lesson time → shows "התחל שיעור" button (calls `useStartLesson` + navigates)
- Skills stored in `lesson_planned_skills` table; `ActiveLesson` picks them up automatically

### Post-Completion Editing
For completed lessons, `LessonDetailsModal` allows:
- **Notes**: inline textarea edit → saves to `lessons.notes` (preserves test type prefix)
- **Skill scores/notes**: via `EditLessonSkillsModal` → calls `useUpdateLessonSkill`
  - Updates `skill_history` row for this lesson
  - If this was the latest lesson for the skill, also updates `student_skills.current_score` / `last_note`
- **Cannot** add/remove skills from a completed lesson

### Hebrew / RTL
- All UI text is Hebrew. Component labels, toasts, and placeholders are in Hebrew.
- All pages use `dir="rtl"`.
- Date formatting uses `he` locale from date-fns.

## File Structure
```
src/
  components/teacher/     # Teacher UI components (modals, cards, calendar, BottomNav)
  components/admin/       # Admin components (AdminBottomNav, ImpersonationBanner)
  pages/teacher/          # Page-level components (TeacherToday, CalendarPage, StudentProfile, ActiveLesson)
  pages/admin/            # Admin pages (TeachersPage, project-management/)
  hooks/                  # React Query hooks (use-teacher-data, use-students-list, etc.)
  contexts/               # AuthContext — auth + impersonation state
  integrations/supabase/  # Supabase client + types
  lib/                    # Utilities (calculations, scoring, utils)
supabase/migrations/      # SQL migrations (run manually in Lovable SQL Editor)
```

## Workflow
1. Edit code locally
2. `npx tsc --noEmit` — zero errors
3. `npm run build` — successful build
4. `git commit && git push` to GitHub
5. Lovable syncs from GitHub automatically
6. SQL migrations run manually in Lovable SQL Editor

## Important Notes
- Lovable may push commits to the repo (auto-generated types, etc.) — always `git pull --rebase` before pushing
- `select('*')` queries auto-include new columns — no need to update hooks when adding DB columns
- Test with `npx vitest run` — existing tests in `src/lib/calculations.test.ts`
