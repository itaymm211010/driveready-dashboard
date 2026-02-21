# PROJECT_MANAGEMENT.md — מודול ניהול פרויקט (Admin)

## סקירה כללית

מודול ניהול פרויקט מאפשר לאדמין הראשי לעקוב אחר משימות פיתוח, ספרינטים, באגים, פריסות ולוגים — הכל מתוך ממשק ה-Admin של DriveKal.

**מקור:** הועתק והותאם מפרויקט [smart-woo-dashboard](/projects/bf95ed21-9695-47bb-bea2-c1f45246d48b).

---

## ארכיטקטורה

### נתיב (Route)
```
/admin/project-management
```
מוגן ע"י `AdminRoute` — רק משתמשים עם `is_admin = true` יכולים לגשת.

### מבנה קבצים
```
src/pages/admin/project-management/
├── Index.tsx                    # עמוד ראשי עם 6 טאבים
├── OverviewTab.tsx              # סקירה כללית + סטטיסטיקות
├── TasksTab.tsx                 # ניהול משימות
├── SprintsTab.tsx               # ניהול ספרינטים
├── BugReportsTab.tsx            # דיווחי באגים
├── LogsTab.tsx                  # לוגי מערכת
├── DeploymentsTab.tsx           # ניהול פריסות
└── dialogs/
    ├── CreateTaskDialog.tsx
    ├── EditTaskDialog.tsx
    ├── CreateBugDialog.tsx
    ├── EditBugDialog.tsx
    ├── CreateSprintDialog.tsx
    ├── EditSprintDialog.tsx
    ├── CreateDeploymentDialog.tsx
    └── EditDeploymentDialog.tsx
```

---

## טבלאות בסיס נתונים

### 1. `tasks` — משימות
| עמודה | סוג | תיאור |
|--------|------|--------|
| id | UUID (PK) | מזהה ייחודי |
| title | TEXT | כותרת המשימה |
| description | TEXT | תיאור |
| type | TEXT | feature / bug / improvement / documentation |
| status | TEXT | todo / in_progress / review / done |
| priority | TEXT | low / medium / high / urgent |
| estimated_hours | NUMERIC | שעות משוערות |
| actual_hours | NUMERIC | שעות בפועל |
| sprint_id | UUID (FK→sprints) | ספרינט משויך |
| created_by | UUID (FK→teachers) | יוצר המשימה |
| created_at | TIMESTAMPTZ | תאריך יצירה |
| updated_at | TIMESTAMPTZ | תאריך עדכון |

### 2. `sprints` — ספרינטים
| עמודה | סוג | תיאור |
|--------|------|--------|
| id | UUID (PK) | מזהה ייחודי |
| name | TEXT | שם הספרינט |
| description | TEXT | תיאור |
| start_date | DATE | תאריך התחלה |
| end_date | DATE | תאריך סיום |
| status | TEXT | planned / active / completed |
| created_by | UUID (FK→teachers) | יוצר |
| created_at / updated_at | TIMESTAMPTZ | חותמות זמן |

### 3. `bug_reports` — דיווחי באגים
| עמודה | סוג | תיאור |
|--------|------|--------|
| id | UUID (PK) | מזהה ייחודי |
| title | TEXT | כותרת |
| description | TEXT | תיאור הבאג |
| severity | TEXT | minor / moderate / major / critical / blocker |
| status | TEXT | open / in_progress / resolved / closed |
| steps_to_reproduce | TEXT | שלבים לשחזור |
| reporter_id | UUID (FK→teachers) | מדווח |
| resolved_at | TIMESTAMPTZ | תאריך פתרון |
| created_at / updated_at | TIMESTAMPTZ | חותמות זמן |

### 4. `deployments` — פריסות
| עמודה | סוג | תיאור |
|--------|------|--------|
| id | UUID (PK) | מזהה ייחודי |
| version | TEXT | גרסה (1.0.0) |
| environment | TEXT | development / staging / production |
| status | TEXT | pending / in_progress / success / failed |
| git_commit_hash | TEXT | hash של ה-commit |
| notes | TEXT | הערות |
| error_log | TEXT | לוג שגיאות |
| sprint_id | UUID (FK→sprints) | ספרינט משויך |
| deployed_by | UUID (FK→teachers) | מבצע הפריסה |
| created_at / updated_at | TIMESTAMPTZ | חותמות זמן |

### 5. `task_logs` — לוגי מערכת
| עמודה | סוג | תיאור |
|--------|------|--------|
| id | UUID (PK) | מזהה ייחודי |
| level | TEXT | info / debug / warning / error / critical |
| message | TEXT | הודעת הלוג |
| file_path | TEXT | נתיב קובץ |
| line_number | INTEGER | מספר שורה |
| created_at | TIMESTAMPTZ | חותמת זמן |

### 6. `project_alerts` — התראות פרויקט
| עמודה | סוג | תיאור |
|--------|------|--------|
| id | UUID (PK) | מזהה ייחודי |
| message | TEXT | הודעת ההתראה |
| severity | TEXT | info / warning / high |
| is_read | BOOLEAN | נקראה? |
| created_at | TIMESTAMPTZ | חותמת זמן |

---

## אבטחה (RLS)

כל 6 הטבלאות מוגנות ב-RLS עם פוליסה אחידה:
```sql
CREATE POLICY "Admins manage [table]"
  ON public.[table] FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
```

רק אדמינים (`is_admin = true` בטבלת `teachers`) יכולים לקרוא/לכתוב/למחוק.

---

## התאמות מהפרויקט המקורי

| נושא | מקורי (smart-woo-dashboard) | DriveKal |
|-------|------|---------|
| FK ליוצר | `profiles` (first_name, last_name, email) | `teachers` (name) |
| Auth context | `useAuth()` → `user` | `useAuthContext()` → `currentUser` |
| Layout wrapper | `<Shell>` component | ישירות ב-div עם padding |
| פורמט תאריכים | `MMM d, yyyy` (EN) | `dd/MM/yyyy` (IL) |
| טקסטים | מעורב EN/HE | עברית מלאה |
| Query keys | `tasks`, `sprints` | `pm_tasks`, `pm_sprints` (למניעת התנגשויות) |
| RLS | per-user | admin-only |

---

## שימוש

1. התחבר כאדמין
2. נווט ל- `/admin/project-management`
3. השתמש בטאבים לניהול משימות, ספרינטים, באגים ופריסות

---

## פיתוח עתידי

- [ ] הוספת drag-and-drop לשינוי סטטוס משימות (Kanban board)
- [ ] קישור בין משימות לבאגים
- [ ] דשבורד Burndown chart לספרינטים
- [ ] התראות אוטומטיות (webhook / email)
- [ ] ייצוא נתונים ל-CSV
- [ ] הוספת לוגים אוטומטית מ-edge functions
