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
- **Teacher ID:** Hardcoded `a1b2c3d4-e5f6-7890-abcd-ef1234567890` (no auth yet)
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

### Hebrew / RTL
- All UI text is Hebrew. Component labels, toasts, and placeholders are in Hebrew.
- All pages use `dir="rtl"`.
- Date formatting uses `he` locale from date-fns.

## File Structure
```
src/
  components/teacher/     # Teacher UI components (modals, cards, calendar)
  pages/teacher/          # Page-level components (TeacherToday, CalendarPage, StudentProfile, ActiveLesson)
  hooks/                  # React Query hooks (use-teacher-data, use-students-list, etc.)
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
