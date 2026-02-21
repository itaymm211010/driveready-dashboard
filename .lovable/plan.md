

# תיקון שגיאות בנייה + הרצת מיגרציה + שחזור lesson_cost

## הבעיה

שגיאות הבנייה ב-`StudentProfile.tsx` נגרמות כי `Map` מיובא מ-`lucide-react` (שורה 2) ודורס את ה-`Map` הגלובלי של JavaScript. לכן `new Map<string, ...>()` נכשל.

בנוסף, ה-`lesson_cost` הוסר מקוד ה-UI בטעות בעריכה הקודמת, וצריך לשחזר אותו אחרי שנריץ את המיגרציה.

## שלבים

### 1. הרצת מיגרציה (כל 5 הסעיפים)

```sql
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS pickup_address TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS pickup_address TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS school_address TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS work_address TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS lesson_cost NUMERIC(10,2);

ALTER TABLE public.lessons DROP CONSTRAINT IF EXISTS lessons_taught_by_teacher_id_fkey;
ALTER TABLE public.lessons
  ADD CONSTRAINT lessons_taught_by_teacher_id_fkey
  FOREIGN KEY (taught_by_teacher_id) REFERENCES public.teachers(id) ON DELETE SET NULL;

CREATE POLICY "teachers_update_substitutes" ON public.teachers
  FOR UPDATE USING (auth.uid() = parent_teacher_id);
```

### 2. תיקון שגיאת Map ב-StudentProfile.tsx

- שינוי שם הייבוא של אייקון `Map` מ-lucide-react ל-`MapIcon` (או `MapPin`)
- זה ישחרר את `Map` הגלובלי ויתקן את שגיאות שורות 263 ו-270

### 3. שחזור lesson_cost ב-UI

- **SubstitutesPage.tsx** - החזרת `lesson_cost` לממשק `Substitute` ולהצגה בכרטיס
- **EditSubstituteModal.tsx** - החזרת שדה עלות שיעור (state, input, ושליחה ל-DB)

### 4. תיקון fallback של readiness

- הוספת `totalCount` ו-`coverage` לאובייקט ה-fallback בשורה ~204 של `StudentProfile.tsx`

## פרטים טכניים

| קובץ | שינוי |
|---|---|
| `StudentProfile.tsx` שורה 2 | `Map` -> `MapIcon` בייבוא מ-lucide-react |
| `StudentProfile.tsx` | כל שימוש ב-`<Map` -> `<MapIcon` |
| `StudentProfile.tsx` | הוספת `totalCount: 0, coverage: 0` ל-fallback |
| `SubstitutesPage.tsx` | שחזור `lesson_cost` בממשק ובתצוגה |
| `EditSubstituteModal.tsx` | שחזור שדה `lesson_cost` בטופס ובשליחה |

