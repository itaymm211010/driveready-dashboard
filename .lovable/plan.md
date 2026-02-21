

## איפוס סיסמה למשתמש itay@smartsoftweb.co.il

### מה נעשה
ניצור Edge Function חד-פעמית בשם `reset-password` שתאפס את הסיסמה של המשתמש ל-`Loca111` באמצעות ה-Admin API.

### שלבים

1. **יצירת Edge Function** `supabase/functions/reset-password/index.ts`
   - תקבל `email` ו-`new_password` בגוף הבקשה
   - תשתמש ב-Service Role Key כדי לעדכן את הסיסמה דרך `adminClient.auth.admin.updateUserById()`
   - תכלול בדיקת הרשאות (רק אדמין יכול לאפס)

2. **הפעלת הפונקציה** עם הפרמטרים:
   - email: `itay@smartsoftweb.co.il`
   - new_password: `Loca111`

3. **בדיקה** - ניסיון התחברות עם הסיסמה החדשה

### פרטים טכניים

הפונקציה תמצא את ה-user ID לפי האימייל באמצעות `listUsers`, ואז תעדכן את הסיסמה באמצעות `updateUserById`. לאחר האיפוס נבדוק שההתחברות עובדת.

