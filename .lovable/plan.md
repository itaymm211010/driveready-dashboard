

# Student Dashboard (Driver Card) - `/student/:id/report`

## Overview

A public-facing, dark-mode "FIFA Ultimate Team"-style report card that a student (or anyone with the link) can view and share. It displays the student's driving readiness, skill radar chart, progress timeline, and a shareable link -- all fetched from the live database.

## What Gets Built

### 1. New Data Hook: `use-student-report.ts`
- Fetches student info, skill categories with student_skills, and skill_history for progress over time
- Computes radar chart data (one axis per skill category, value = average proficiency or mastery %)
- Computes progress timeline data (readiness or mastered-count over lesson dates from skill_history)
- No authentication required -- this is a public report page (existing "Temp: allow all reads" RLS policies cover it)

### 2. New Page: `src/pages/student/StudentReport.tsx`
- **Dark mode forced** via a wrapper `<div className="dark">` so the page always renders in the dark/neon theme defined in `index.css`
- **Layout sections:**

  **A. Header Card (Driver Card)**
  - Student avatar (or initials fallback), name, total lessons
  - Large circular readiness percentage using the existing `CircularProgress` component with neon glow styling
  - Glassmorphism card background (`glass` + `glow-primary` CSS utilities already exist)

  **B. Radar Chart -- Skill Categories**
  - One axis per skill category (Vehicle Control, Road Awareness, etc.)
  - Value = percentage of mastered skills in that category
  - Uses Recharts `RadarChart`, `PolarGrid`, `PolarAngleAxis`, `Radar` with neon blue fill
  - Wrapped in the existing `ChartContainer` component

  **C. Progress Timeline -- Line Chart**
  - X-axis: lesson dates (from skill_history, grouped by lesson_date)
  - Y-axis: cumulative mastered skill count at each date
  - Uses Recharts `LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`
  - Neon gradient stroke with glow effect

  **D. Skill Breakdown Grid**
  - Cards per category showing mastered/in_progress/not_learned counts
  - Each skill displayed as a small badge with status color (reusing existing status config pattern)

  **E. Share Section**
  - "Share Report" button that copies the current URL to clipboard using `navigator.clipboard`
  - WhatsApp share button that opens `https://wa.me/?text=...` with the report URL
  - Uses `sonner` toast to confirm "Link copied!"

### 3. Route Registration in `App.tsx`
- Add route: `/student/:id/report`
- Points to the new `StudentReport` page

### 4. Link from Teacher Side
- Add a "View Report" / "Share" button on the existing `StudentProfile.tsx` page that navigates to `/student/{id}/report`

## Technical Details

### Radar Chart Data Shape
```typescript
// One entry per skill_category
[
  { category: "Vehicle Control", value: 75 },  // 3/4 mastered = 75%
  { category: "Road Awareness", value: 50 },
  ...
]
```

### Progress Timeline Data Shape
```typescript
// Grouped by lesson_date from skill_history, counting cumulative mastered
[
  { date: "Jan 20", mastered: 3 },
  { date: "Feb 05", mastered: 5 },
  { date: "Feb 12", mastered: 8 },
]
```

### Dark Mode Approach
The page wraps all content in `<div className="dark">` which activates the existing `.dark` CSS variables (neon blue/purple theme). No theme provider or `next-themes` needed -- it's purely a class-based override.

### Styling
- Reuse existing CSS utilities: `glass`, `glow-primary`, `glow-accent`
- Neon color palette from CSS variables: `--primary` (blue), `--secondary` (purple), `--accent` (cyan)
- Framer Motion for entrance animations (fade-in, slide-up on cards)

### Files Changed
| File | Action |
|------|--------|
| `src/hooks/use-student-report.ts` | Create -- data fetching + chart data computation |
| `src/pages/student/StudentReport.tsx` | Create -- full report page UI |
| `src/App.tsx` | Edit -- add `/student/:id/report` route |
| `src/pages/teacher/StudentProfile.tsx` | Edit -- add "View Report" link button |

