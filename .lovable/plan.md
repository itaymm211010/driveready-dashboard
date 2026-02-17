
# Plan: Sync Database and Code with New Skill Structure

## Current State
- Database has **3 old categories** (שליטה ברכב, מודעות בכביש, תמרונים) with **9 skills** -- these use old names and have no `color` values
- The `seed_default_skills` function exists but hasn't been called yet
- The `color` column was added to `skill_categories` but is NULL for existing rows
- Code references category 4 ("מצבים מתקדמים") which doesn't exist in the DB yet

## Step 1: Database Migration -- Clean and Re-seed

Run a SQL migration that:
1. Deletes the old 3 categories and their 9 skills (and any dependent `student_skills` / `skill_history` for them)
2. Calls `seed_default_skills('a1b2c3d4-e5f6-7890-abcd-ef1234567890')` to insert the new 4 categories with 31 skills and proper colors

```sql
-- Remove old skill data for this teacher
DELETE FROM skill_history WHERE student_skill_id IN (
  SELECT ss.id FROM student_skills ss
  JOIN skills s ON s.id = ss.skill_id
  WHERE s.teacher_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
);

DELETE FROM student_skills WHERE skill_id IN (
  SELECT id FROM skills WHERE teacher_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
);

DELETE FROM lesson_planned_skills WHERE skill_id IN (
  SELECT id FROM skills WHERE teacher_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
);

DELETE FROM skills WHERE teacher_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
DELETE FROM skill_categories WHERE teacher_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Seed the new 4 categories + 31 skills
SELECT seed_default_skills('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
```

**Note:** This will delete any existing skill practice history for the demo teacher. Since this is test data, that should be fine.

## Step 2: Update `DbSkillCategory` Type

In `src/hooks/use-teacher-data.ts`, add `color` to the `DbSkillCategory` type:

```typescript
export type DbSkillCategory = {
  id: string;
  name: string;
  icon: string;
  color: string | null;  // <-- new
  sort_order: number;
  skills: DbSkill[];
};
```

## Step 3: Update `useStudentSkillTree` to Include `color`

In `src/hooks/use-teacher-data.ts`, the `useStudentSkillTree` result assembly already uses `...cat` spread from the Supabase query, but the explicit `DbSkillCategory` construction at line 183 doesn't include `color`. Add it:

```typescript
const result: DbSkillCategory[] = (categories ?? []).map((cat) => ({
  id: cat.id,
  name: cat.name,
  icon: cat.icon,
  color: cat.color ?? null,  // <-- new
  sort_order: cat.sort_order,
  skills: ...
}));
```

## Step 4: Remove Hardcoded `CATEGORY_COLORS` Fallback

In `src/pages/teacher/StudentProfile.tsx`, the `CATEGORY_COLORS` map (lines 45-50) can remain as a fallback but will no longer be the primary source since colors now come from the DB. The existing line `cat.color ?? CATEGORY_COLORS[cat.name] ?? '#94A3B8'` at line 119 already handles this gracefully -- no change needed here.

## Summary of Changes

| What | Where | Change |
|------|-------|--------|
| Delete old categories/skills, seed new ones | SQL migration | Delete + call `seed_default_skills()` |
| Add `color` to type | `use-teacher-data.ts` | Add `color: string \| null` to `DbSkillCategory` |
| Include `color` in query result | `use-teacher-data.ts` | Add `color: cat.color` to result assembly |

After these changes, the DB will have 4 categories with 31 skills and proper colors, matching what the code expects for readiness calculations.
