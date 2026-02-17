# Future Features & Enhancements

**Project:** DriveReady Dashboard
**Last Updated:** 2026-02-17

This document tracks features that are planned but not yet implemented, along with their priority and estimated effort.

---

## 🔴 Critical Priority (Must Have Before Launch)

### 1. Authentication System
**Status:** Not Implemented
**Estimated Effort:** 1-2 weeks
**Dependencies:** Supabase Auth

**Description:**
Implement proper teacher authentication using Supabase Auth.

**Requirements:**
- Email/password signup and login
- Email verification (optional for MVP)
- Password reset flow
- Session management
- Logout functionality

**Security:**
- Row Level Security (RLS) policies
- Teachers can only access their own students/lessons
- Secure password requirements

**Files to Create:**
- `src/pages/Auth/Login.tsx`
- `src/pages/Auth/Signup.tsx`
- `src/pages/Auth/ResetPassword.tsx`
- `src/hooks/useAuth.ts`
- `supabase/migrations/add_rls_policies.sql`

**Reference:** See drivetrack-v4.jsx `ScreenLogin` for UX inspiration (but implement properly with Supabase)

---

### 2. Test Readiness Calculation Logic
**Status:** Not Implemented
**Estimated Effort:** 3-5 days
**Dependencies:** None (just logic)

**Description:**
Implement the exact test readiness formula from specification.

**Formula:**
```typescript
interface ReadinessResult {
  ready: boolean;
  avg: number;
  cat4Avg: number;
  hasLow: boolean;
  percentage: number;
}

function calculateReadiness(studentSkills: StudentSkill[]): ReadinessResult {
  const rated = studentSkills.filter(s => s.current_status > 0);

  if (rated.length === 0) {
    return { ready: false, percentage: 0, avg: 0, hasLow: false, cat4Avg: 0 };
  }

  // 1. Overall average
  const avg = rated.reduce((sum, s) => sum + s.current_status, 0) / rated.length;

  // 2. Check for any skill below 3
  const hasLow = rated.some(s => s.current_status < 3);

  // 3. Category 4 (Advanced Skills) average
  const cat4Skills = rated.filter(s =>
    s.skill.category.name === "מצבים מתקדמים" ||
    s.skill.category.id === "cat4_id"  // Use appropriate identifier
  );
  const cat4Avg = cat4Skills.length > 0
    ? cat4Skills.reduce((sum, s) => sum + s.current_status, 0) / cat4Skills.length
    : 0;

  // Final readiness determination
  const ready = avg >= 4 && !hasLow && cat4Avg >= 4;
  const percentage = (avg / 5) * 100;

  return { ready, percentage, avg, hasLow, cat4Avg };
}
```

**Criteria for Test Ready:**
1. ✅ Overall average ≥ 4.0
2. ✅ No skill (that has been rated) < 3
3. ✅ Category 4 average ≥ 4.0

**Implementation:**
- Add calculation function
- Update on every skill change (database trigger or app logic)
- Store in `students.readiness_percentage`
- Add `students.ready_for_test` boolean field
- Display in UI with green checkmarks

**Files to Create/Modify:**
- `src/lib/calculations.ts` - Add function
- `src/hooks/useReadiness.ts` - React hook
- Database migration to add `ready_for_test` field

---

### 3. Default Skill Categories & Skills Seed Data
**Status:** Not Implemented
**Estimated Effort:** 2-3 days
**Dependencies:** None

**Description:**
Add the 4 standard driving school skill categories as default data.

**Categories:**

#### Category 1: שליטה והפעלת הרכב 🚗
**Color:** `#38BDF8`
**Skills (8):**
1. התנעה וכיבוי
2. התחלת נסיעה
3. שימוש נכון במצמד / גלישה
4. העלאה והורדת הילוכים
5. היגוי בקו ישר ופניות
6. זינוק בעלייה
7. עצירת מטרה
8. שליטה כללית ברכב

#### Category 2: התנהלות בדרך 🛣️
**Color:** `#34D399`
**Skills (9):**
1. נסיעה בימין הדרך
2. זיהוי כביש חד/דו סטרי
3. הרגלי הסתכלות
4. התקרבות לצומת
5. ציות לתמרורים ורמזורים
6. פניות ימינה
7. פניות שמאלה ופרסה
8. מעבר נתיבים
9. נסיעה לאחור וחניה

#### Category 3: התנהלות בתנועה 🚦
**Color:** `#F472B6`
**Skills (7):**
1. מהירות וקצב נסיעה
2. שמירת רווח ואומדן רוחב
3. מתן זכות קדימה
4. התייחסות להולכי רגל
5. התנהגות במעגל תנועה
6. השתלבות בתנועה
7. עקיפות

#### Category 4: מצבים מתקדמים ⭐
**Color:** `#FBBF24`
**Skills (7):**
1. נהיגה בין עירונית
2. נהיגה בדרך מהירה
3. התמזגויות
4. התייחסות לרכב ביטחון
5. נת"צ
6. קבלת החלטות עצמאית
7. נהיגה רציפה ללא התערבות

**Total: 31 skills**

**Implementation:**
- Create migration with seed data
- OR create on teacher first login
- Allow teachers to customize (add/edit/delete)

**Files to Create:**
- `supabase/migrations/seed_default_skills.sql`
- `src/data/defaultSkills.ts` (for reference)

---

### 4. Score Levels Definition
**Status:** Partially Implemented (database has field, but no UI constants)
**Estimated Effort:** 1-2 days
**Dependencies:** None

**Description:**
Define the 0-5 scoring system with labels and colors.

**Scale:**
```typescript
export const SCORE_LEVELS = {
  0: { label: "לא דורג",         color: "#374151", bg: "#37415122" },
  1: { label: "לא שולט",         color: "#EF4444", bg: "#EF444422" },
  2: { label: "שולט חלקית",      color: "#F97316", bg: "#F9731622" },
  3: { label: "ברוב המקרים",     color: "#EAB308", bg: "#EAB30822" },
  4: { label: "טוב ויציב",       color: "#22C55E", bg: "#22C55E22" },
  5: { label: "מוכן לטסט",       color: "#38BDF8", bg: "#38BDF822" },
} as const;

export type ScoreLevel = keyof typeof SCORE_LEVELS;
```

**Files to Create:**
- `src/lib/constants.ts` - Add SCORE_LEVELS
- Ensure database `current_status` field is 0-5 integer

---

## 🟡 High Priority (Important for Launch)

### 5. ScorePicker UI Component
**Status:** Not Implemented
**Estimated Effort:** 2-3 days
**Dependencies:** SCORE_LEVELS constant

**Description:**
Create a visual score picker with circular buttons (1-5).

**Design:**
- 5 circular buttons in a row
- Numbers 1-5 displayed
- Color-coded by score level
- Active state shows filled background
- Click to select, click again to deselect (set to 0)
- Optional compact mode for lists

**Reference:** See drivetrack-v4.jsx lines 87-104

**Component:**
```typescript
interface ScorePickerProps {
  value: number;
  onChange: (score: number) => void;
  compact?: boolean;
  disabled?: boolean;
}

export function ScorePicker({ value, onChange, compact, disabled }: ScorePickerProps) {
  // Implementation
}
```

**Files to Create:**
- `src/components/ui/score-picker.tsx`
- Storybook story (optional)

---

### 6. Badge Component for Scores
**Status:** Not Implemented
**Estimated Effort:** 1 day
**Dependencies:** SCORE_LEVELS constant

**Description:**
Small badge showing score label with color.

**Reference:** See drivetrack-v4.jsx lines 81-85

**Component:**
```typescript
interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  // Shows label like "טוב ויציב" with green color
}
```

**Files to Create:**
- `src/components/ui/score-badge.tsx`

---

### 7. Student Profile Tabs
**Status:** Partial (might have some tabs, need verification)
**Estimated Effort:** 3-5 days
**Dependencies:** None

**Description:**
Add 4 tabs to student profile:

**Tabs:**
1. **📅 Lessons** - List of all lessons (past and planned)
2. **📊 Skills** - All skills organized by category with current scores
3. **📈 Progress** - Charts and visualizations
4. **📝 Notes** - Timeline of all notes across all skills

**Reference:** See drivetrack-v4.jsx lines 445-450, 493-648

**Files to Modify:**
- `src/pages/teacher/StudentProfile.tsx` - Add tabs

---

### 8. Lesson Summary Screen
**Status:** Not Implemented
**Estimated Effort:** 2-3 days
**Dependencies:** None

**Description:**
After finishing a lesson, show summary screen with:
- Skills that improved (green)
- Skills that declined (red)
- Skills unchanged (gray)
- Updated readiness status
- Celebration emoji if test-ready

**Reference:** See drivetrack-v4.jsx lines 833-880

**Files to Create:**
- `src/components/teacher/LessonSummary.tsx`

---

### 9. Average Calculations Display
**Status:** Not Implemented
**Estimated Effort:** 2-3 days
**Dependencies:** Calculation functions

**Description:**
Display category averages and overall average in student profile.

**Implementation:**
```typescript
// Helper functions
function calculateCategoryAverage(skills: StudentSkill[], categoryId: string): number {
  const categorySkills = skills.filter(s =>
    s.skill.category_id === categoryId && s.current_status > 0
  );

  if (categorySkills.length === 0) return 0;

  return categorySkills.reduce((sum, s) => sum + s.current_status, 0) / categorySkills.length;
}

function calculateOverallAverage(skills: StudentSkill[]): number {
  const rated = skills.filter(s => s.current_status > 0);

  if (rated.length === 0) return 0;

  return rated.reduce((sum, s) => sum + s.current_status, 0) / rated.length;
}
```

**Display:**
- Show in student profile header
- Show in student list (overall avg)
- Color-code by level (red < 3, yellow 3-4, green ≥ 4)

**Files to Create:**
- `src/lib/calculations.ts` - Add functions
- Modify student profile to display

---

## 🟠 Medium Priority (Nice to Have)

### 10. Progress Chart (Line Graph)
**Status:** Not Implemented
**Estimated Effort:** 3-5 days
**Dependencies:** Recharts library (already in dependencies)

**Description:**
Line chart showing lesson averages over time.

**Features:**
- X-axis: Lesson dates
- Y-axis: Average score (0-5)
- Horizontal threshold line at 4.0 (test ready)
- Dots colored by score level (red/yellow/green)
- Area fill under line
- Gradient color

**Reference:** See drivetrack-v4.jsx lines 170-230

**Files to Create:**
- `src/components/teacher/ProgressChart.tsx`

---

### 11. Comparison Widget
**Status:** Not Implemented
**Estimated Effort:** 1-2 days
**Dependencies:** None

**Description:**
Compare last lesson average vs overall average.

**Display:**
- Two cards side-by-side
- Last lesson average (with date)
- Overall average (with # of lessons)
- Trend indicator: ↑ improving, ↓ declining, → stable

**Reference:** See drivetrack-v4.jsx lines 233-261

**Files to Create:**
- `src/components/teacher/ComparisonWidget.tsx`

---

### 12. Notes Timeline View
**Status:** Not Implemented
**Estimated Effort:** 2-3 days
**Dependencies:** None

**Description:**
Timeline view of all notes across all skills, sorted chronologically.

**Features:**
- Grouped by date
- Shows time for each note
- Skill name with category icon
- Teacher name
- Note text in italic quote style
- Visual timeline connector line

**Reference:** See drivetrack-v4.jsx lines 614-648

**Files to Create:**
- `src/components/teacher/NotesTimeline.tsx`

---

### 13. PDF Export
**Status:** Not Implemented
**Estimated Effort:** 1 week
**Dependencies:** None

**Description:**
Generate comprehensive PDF report for student.

**Report Sections:**
1. Header (student name, date, DriveReady logo)
2. Test readiness status badge
3. Readiness checklist (3 criteria with ✅/❌)
4. Category averages display
5. Comparison (last lesson vs overall)
6. Skills table (all categories with scores and labels)
7. Lesson history table
8. Notes timeline

**Implementation Options:**

**Option A: Browser Print** (Recommended for MVP)
- Open HTML in new window
- Use window.print()
- Styled with @media print CSS
- Reference: drivetrack-v4.jsx lines 264-380

**Option B: PDF Library**
- Use jsPDF or pdfmake
- More control over layout
- Larger bundle size

**Files to Create:**
- `src/lib/pdfExport.ts`
- `src/components/teacher/StudentReport.tsx` (print template)

---

### 14. Ring Progress Indicators
**Status:** Not Implemented
**Estimated Effort:** 2-3 days
**Dependencies:** None

**Description:**
Circular progress rings for visual appeal.

**Usage:**
- Show category averages as rings
- 0-5 scale represented as percentage (0-100%)
- Color-coded by category
- Animated on load

**Reference:** See drivetrack-v4.jsx lines 106-125

**Files to Create:**
- `src/components/ui/ring-progress.tsx`

---

### 15. Category Progress Bars
**Status:** Not Implemented
**Estimated Effort:** 1-2 days
**Dependencies:** None

**Description:**
Horizontal progress bars showing category averages.

**Features:**
- Bar length represents 0-5 scale
- Color matches category
- Shows numeric average at end
- Animated on load

**Reference:** See drivetrack-v4.jsx lines 547-564

**Files to Create:**
- `src/components/teacher/CategoryBars.tsx`

---

## 🟢 Low Priority (Future Enhancements)

### 16. Lesson Planning - Category Collapse/Expand
**Status:** Might be implemented (have SkillSelectionModal)
**Estimated Effort:** 2-3 days

**Description:**
When planning a lesson, show collapsible categories.

**Features:**
- Click category header to expand/collapse
- "Select All" button per category
- Shows count of selected skills
- Previous score displayed next to each skill

**Reference:** See drivetrack-v4.jsx lines 653-729

---

### 17. Mobile Bottom Navigation
**Status:** Have BottomNav.tsx (might be implemented)
**Estimated Effort:** 1-2 days

**Description:**
Bottom navigation bar for mobile view.

**Tabs:**
- Today (dashboard)
- Students (list)
- Calendar
- Profile

---

### 18. Export/Import Data (Backup)
**Status:** Not Implemented
**Estimated Effort:** 1 week

**Description:**
Allow teachers to export all their data (students, lessons, skills).

**Formats:**
- JSON (full backup)
- CSV (for spreadsheets)

**Features:**
- Export all data
- Import from backup
- Transfer between accounts

---

### 19. Student Portal
**Status:** Not Implemented (folder exists but likely empty)
**Estimated Effort:** 2-3 weeks

**Description:**
Separate portal where students can:
- View their own progress
- See upcoming lessons
- View their readiness status
- Read teacher notes (optional)

**Security:**
- Separate login
- Can only see own data
- Read-only access

---

### 20. SMS/Email Notifications
**Status:** Not Implemented
**Estimated Effort:** 1 week

**Description:**
Send automated notifications:

**For Students:**
- Lesson reminder (24hr before)
- Lesson canceled notification
- Test-ready notification

**For Teachers:**
- Daily schedule summary
- Student reached test-ready

**Integration:**
- Twilio for SMS
- Resend/SendGrid for email

---

### 21. Multi-Language Support
**Status:** Not Implemented
**Estimated Effort:** 1-2 weeks

**Description:**
Support multiple languages (Hebrew, English, Arabic).

**Implementation:**
- i18next library
- RTL support for Hebrew/Arabic
- LTR for English
- Language switcher in settings

---

### 22. Analytics Dashboard
**Status:** Not Implemented
**Estimated Effort:** 2 weeks

**Description:**
Teacher analytics:
- Total students
- Students test-ready
- Average readiness percentage
- Most challenging skills (lowest avg)
- Lessons per month
- Revenue tracking (if using payment features)

**Charts:**
- Students progress over time
- Skill mastery distribution
- Lesson completion rate

---

### 23. Lesson Templates
**Status:** Not Implemented
**Estimated Effort:** 1 week

**Description:**
Create and save lesson templates.

**Examples:**
- "First Lesson" - Basic control skills
- "City Driving" - Traffic skills
- "Highway Prep" - Advanced skills
- "Test Prep" - All skills

**Features:**
- Save custom templates
- Quick apply to new lesson
- Share templates (future)

---

### 24. Skill Video Library
**Status:** Not Implemented
**Estimated Effort:** 2+ weeks (+ content creation)

**Description:**
Video library demonstrating each skill.

**Features:**
- Video per skill (YouTube embeds or uploaded)
- Share with students
- Watch progress tracking
- Organized by category

---

## 📋 Nice-to-Have Features (Backlog)

### 25. Voice Notes During Lesson
**Description:** Record voice notes instead of typing during active lesson.

### 26. Photo Attachments
**Description:** Attach photos to lessons (e.g., parking attempts, difficult situations).

### 27. Integration with Driving Test Centers
**Description:** Book test appointments directly from app (if API available).

### 28. Student Comparison
**Description:** Compare multiple students' progress side-by-side.

### 29. Gamification
**Description:** Badges, achievements for students (e.g., "Parking Master", "10 Lessons Complete").

### 30. Scheduling Automation
**Description:** AI suggests optimal lesson times based on student progress and calendar.

---

## Implementation Priority Roadmap

### Sprint 1 (Week 1-2): Core Logic
- [ ] Test readiness calculation
- [ ] Average calculations
- [ ] Score levels definition
- [ ] Default skills seed data

### Sprint 2 (Week 3-4): Essential UI
- [ ] ScorePicker component
- [ ] Badge component
- [ ] Student profile tabs
- [ ] Lesson summary screen

### Sprint 3 (Week 5-6): Authentication
- [ ] Supabase Auth implementation
- [ ] RLS policies
- [ ] Teacher onboarding

### Sprint 4 (Week 7-8): Polish
- [ ] Progress chart
- [ ] Notes timeline
- [ ] Comparison widget
- [ ] Testing and bug fixes

### Sprint 5 (Week 9-10): Advanced Features
- [ ] PDF export
- [ ] Ring indicators
- [ ] Category bars
- [ ] Mobile optimization

---

## How to Use This Document

1. **Prioritize:** Review priorities quarterly
2. **Estimate:** Update effort estimates as you learn more
3. **Track:** Move completed features to CHANGELOG.md
4. **Reference:** Link to this doc in issues/PRs

---

*Document created: 2026-02-17*
*Review and update monthly*
