

## הוספת היסטוריית מיומנויות ב-Skill Breakdown בפרופיל תלמיד

### הבעיה
כרגע, אזור ה-Skill Breakdown בפרופיל התלמיד מציג רק את הסטטוס הנוכחי של כל מיומנות (Badge צבעוני), אבל אי אפשר ללחוץ על מיומנות ולראות את ההיסטוריה שלה לאורך השיעורים. הרכיב `SkillHistoryModal` כבר קיים בפרויקט ומשמש בדף השיעור הפעיל, אבל לא מחובר לפרופיל.

### הפתרון
לחבר את המודאל הקיים לפרופיל התלמיד, עם שני שינויים:

1. **שליפת נתוני היסטוריה (`use-student-profile.ts`)** -- כרגע ה-hook שולף `student_skills` אבל לא שולף `skill_history`. צריך להוסיף שליפה של טבלת `skill_history` (כמו שכבר נעשה ב-`useStudentSkillTree`) ולצרף את הנתונים לכל מיומנות בעץ.

2. **הפיכת ה-Badges ללחיצים (`StudentProfile.tsx`)** -- כל Badge מיומנות יהפוך ללחיץ (cursor-pointer + hover effect). לחיצה תפתח את `SkillHistoryModal` עם ההיסטוריה המלאה של אותה מיומנות.

### פרטים טכניים

**קובץ: `src/hooks/use-student-profile.ts`**
- שליפת `skill_history` לפי `student_skill_id` (כמו שנעשה ב-`useStudentSkillTree`)
- בניית מפת היסטוריה (`historyBySSId`) וצירוף מערך `history` לכל skill באובייקט `skillTree`

**קובץ: `src/pages/teacher/StudentProfile.tsx`**
- הוספת state: `historySkill` (המיומנות שנבחרה לצפייה בהיסטוריה)
- הפיכת כל `Badge` ל-`cursor-pointer` עם `onClick` שמעדכן את `historySkill`
- הוספת רכיב `SkillHistoryModal` בתחתית הדף, מחובר ל-state

לא נדרשים שינויים במסד הנתונים -- כל המידע כבר קיים בטבלת `skill_history`.

