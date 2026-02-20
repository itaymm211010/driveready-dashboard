# DriveKal — מבנה אתר השיווק המלא

**Brand:** DriveKal (דרייבקל)
**Product:** DriveReady Dashboard
**Target Audience:** מורי נהגיה עצמאיים ובתי ספר לנהיגה בישראל
**Last Updated:** 2026-02-19
**Author:** Marketing Strategist Agent

---

## Table of Contents

1. [Brand Positioning](#1-brand-positioning)
2. [Site Architecture — All Pages](#2-site-architecture--all-pages)
3. [Navigation Structure](#3-navigation-structure)
4. [Homepage — Full Section Breakdown](#4-homepage--full-section-breakdown)
5. [Inner Pages](#5-inner-pages)
6. [CTA & Conversion Strategy](#6-cta--conversion-strategy)
7. [Technical Notes & Integrations](#7-technical-notes--integrations)
8. [SEO Strategy](#8-seo-strategy)
9. [Design System Notes](#9-design-system-notes)
10. [Content Calendar Tie-in](#10-content-calendar-tie-in)

---

## 1. Brand Positioning

### Brand Essence
**DriveKal** = ניהול נהיגה — חכם, מהיר, בעברית.

### Tagline Options (pick one for launch)
- **ראשי:** "כל תלמיד. כל שיעור. בראש שקט."
- **אלטרנטיבה א':** "תפסיק לנהל בראש — תתחיל לנהל בדרייבקל"
- **אלטרנטיבה ב':** "הדשבורד שמורי נהגיה חיכו לו"

### Tone of Voice
- לא פורמלי, חמים, ישראלי
- ישיר — מדבר אל "אתה/את" (הגדרת פרסונה: זכר ונקבה)
- מתחיל עם כאב, ממשיך לפתרון, מסיים עם ביטחון
- משפטים קצרים. **פסקאות מודגשות** לנקודות מפתח.

### Competitive Differentiation
המתחרים העיקריים הם: **Excel, דפי נייר, WhatsApp notes**. אין כמעט פתרון SaaS ממוקד לשוק הישראלי.
הודעת מיצוב: "הכלי הראשון שנבנה **בשביל** מורה הנהיגה הישראלי"

---

## 2. Site Architecture — All Pages

```
drivekal.co.il/
├── /                          (Homepage — Landing Page ראשי)
├── /features                  (תכונות — פירוט מלא)
├── /pricing                   (מחירים)
├── /about                     (אודות)
├── /contact                   (צור קשר / דמו)
├── /blog/                     (בלוג — תוכן SEO)
│   ├── /blog/tips             (טיפים למורי נהגיה)
│   └── /blog/[slug]           (מאמרים בודדים)
├── /privacy                   (מדיניות פרטיות)
├── /terms                     (תנאי שימוש)
└── /app                       (הפניה → אפליקציה)
```

### Page Priority for Launch (MVP)
1. **Homepage** — חובה לפני השקה
2. **Pricing** — חובה לפני השקה
3. **Contact / Demo Request** — חובה לפני השקה
4. **Features** — גרסה מינימלית לפני השקה
5. **About** — לאחר השקה (גל שני)
6. **Blog** — לאחר השקה (גל שני, SEO ארוך טווח)

---

## 3. Navigation Structure

### Primary Navigation (Header)
```
RTL order: [לוגו DriveKal] ← [תכונות] [מחירים] [אודות] [צור קשר] | [CTA: התחל בחינם →]
```

**Notes:**
- Header: fixed/sticky, 60-70px high
- Background: white or semi-transparent on scroll
- Mobile: hamburger menu (right side, RTL)
- CTA button: prominent, brand color (blue or green — see design section)
- Logo: top-right (RTL convention)

### Mobile Navigation
- Hamburger icon: top-right corner
- Full-screen overlay menu on open
- Items stacked vertically
- WhatsApp floating button: bottom-left (fixed), always visible
- CTA button at bottom of mobile menu

### Footer Navigation
```
Column 1 — מוצר:        Column 2 — חברה:          Column 3 — תמיכה:
תכונות                  אודות                     שאלות נפוצות
מחירים                  בלוג                      צור קשר
הרשמה לניסיון           מדיניות פרטיות            WhatsApp ישיר
```
Footer also includes: copyright, social links (Facebook, Instagram), tagline

---

## 4. Homepage — Full Section Breakdown

Homepage URL: `/`
**Goal:** Convert a visiting instructor into a free trial signup or demo request.
**Funnel:** Awareness → Interest → Trial

---

### Section 1: HERO

**Purpose:** הצגת הערך תוך 3 שניות. תפיסת תשומת לב ויצירת סקרנות.

**Layout:** Full-viewport height (100vh), RTL, centered or right-aligned text, visual on left.

**Headline (H1):**
> "סוף לגיליונות אקסל.
> ניהול תלמידים חכם — לגמרי בעברית."

**Sub-headline:**
> "דרייבקל הוא הדשבורד שמאפשר לך לעקוב אחרי כל תלמיד, כל שיעור, ומדד המוכנות לטסט — הכל במקום אחד, מהנייד."

**Primary CTA:**
- Button: `התחל ניסיון חינם — 14 יום`
- Color: Green (#22C55E) or brand blue
- Size: Large, full-width on mobile

**Secondary CTA:**
- Link: `צפה בהדגמה קצרה ←`
- Opens: embedded YouTube video or Loom demo in lightbox

**Visual (Left side / above CTA on mobile):**
- Option A: Animated GIF / screenshot of the dashboard (TeacherToday screen)
- Option B: Short 15-sec loop video of the app in use on a phone
- Mockup: iPhone frame showing the mobile dashboard
- Alt text: "דשבורד ניהול שיעורי נהיגה"

**Trust Bar (directly below hero CTA):**
> "ללא כרטיס אשראי • ניסיון חינם 14 יום • ביטול בכל עת"

**Background:**
- Clean white or very light gray (#F9FAFB)
- Subtle diagonal stripe or wave divider at bottom
- Optional: light blue/green gradient tint

---

### Section 2: PAIN POINTS

**Purpose:** גרימת זיהוי עצמי אצל הקורא — "הוא מדבר עלי". בניית אמפתיה לפני הצגת הפתרון.

**Headline (H2):**
> "מכיר את זה?"

**Layout:** 3-column grid (desktop), vertical stack (mobile). Each card has icon + text.

**Pain Point Cards:**

| Icon | כותרת | תיאור |
|------|-------|-------|
| 📋 (clipboard) | "מנהל הכל בראש — ומאבד פרטים" | "שוכח מה תרגלת עם כל תלמיד? עם 15-20 תלמידים זה כמעט בלתי אפשרי לזכור." |
| 📊 (chart) | "לא יודע מתי תלמיד מוכן לטסט" | "אין לך מדד ברור. אתה מחליט על פי תחושה — ולפעמים שולח תלמיד מוקדם מדי." |
| ⏰ (clock) | "בזבזת יותר מדי זמן על ניהול" | "Excel, WhatsApp, פתקים — הניהול גוזל לך זמן שהיה יכול להיות שיעור נוסף." |

**Transition text (below cards):**
> "אם הנהנת לאחת מהנקודות האלה — דרייבקל נבנה בדיוק בשבילך."

**Design note:** Cards with subtle shadow, rounded corners (rounded-xl), light background (#F0F9FF or similar).

---

### Section 3: SOLUTION / PRODUCT INTRO

**Purpose:** הצגת דרייבקל כפתרון — מהיר, ברור, עם ויזואל.

**Headline (H2):**
> "דרייבקל — כל מה שצריך מורה נהיגה, במסך אחד"

**Sub-headline:**
> "ניהול תלמידים, מעקב שיעורים, מדד מוכנות לטסט ולוח שנה — הכל מחובר, הכל בעברית, הכל בנייד."

**Layout:** Full-width screenshot of app (TeacherToday or Student Profile) with callout annotations.

**Callout annotations on screenshot (4-5 points):**
1. "מדד המוכנות לטסט — מחושב אוטומטית"
2. "כל שיעורי היום בלוח אחד"
3. "פרופיל תלמיד + מיומנויות לפי קטגוריה"
4. "הוספת שיעור תוך 10 שניות"
5. "עובד מהנייד — בלי להוריד אפליקציה"

**Design note:** Screenshot can be a browser mockup (desktop) OR phone mockup (mobile-first). On mobile, show the phone mockup. On desktop, show the full dashboard.

---

### Section 4: FEATURES

**Purpose:** הצגת התכונות המרכזיות בצורה ויזואלית ומשכנעת. Feature-per-row layout or 3-column cards.

**Headline (H2):**
> "מה מקבלים עם דרייבקל"

**Layout Option A (Alternating rows — desktop):**
Each feature: text on one side, screenshot/icon on the other. Alternates right/left.

**Layout Option B (Cards grid):**
3-column grid of feature cards with icon, title, 2-line description.

**Recommended: Option A for top 3 features, then Option B for remaining.**

---

#### Feature 1: ניהול תלמידים
**Icon:** 👤
**Headline:** "פרופיל מלא לכל תלמיד"
**Copy:**
> "שם, טלפון, סטטוס תשלום, היסטוריית שיעורים ומדד מוכנות לטסט — הכל במקום אחד.
> לא עוד חיפוש בין גיליונות ופתקים."

**Visual:** Screenshot of StudentProfile page

---

#### Feature 2: מעקב מיומנויות
**Icon:** 📊
**Headline:** "מדד מוכנות לטסט — מחושב אוטומטית"
**Copy:**
> "31 מיומנויות נהיגה מחולקות ל-4 קטגוריות.
> אחרי כל שיעור, עדכן ציון לכל מיומנות — והמערכת מחשבת אם התלמיד מוכן לטסט.
> **ציון ממוצע ≥ 4.0, ללא מיומנות מתחת ל-3, ממוצע מצבים מתקדמים ≥ 4.0 — ירוק!**"

**Visual:** Screenshot of skills section with score badges

---

#### Feature 3: ניהול שיעורים
**Icon:** 📅
**Headline:** "3 סוגי שיעורים — שיעור רגיל, טסט פנימי, טסט חיצוני"
**Copy:**
> "כל שיעור מוגדר בסוגו. המחיר מתמלא אוטומטי לפי הגדרות התלמיד.
> בזמן שיעור אפשרי לתעד מיומנויות בזמן אמת."

**Visual:** Screenshot of AddLessonModal or active lesson screen

---

#### Feature 4: לוח שנה
**Icon:** 🗓️
**Headline:** "לוח שנה שבועי ויומי"
**Copy:**
> "ראה את כל השיעורים המתוכננים בתצוגה ברורה.
> לחץ על שיעור לפרטים — ועדכן במקום."

**Visual:** Screenshot of CalendarPage

---

#### Feature 5: חיוב ותשלומים
**Icon:** 💰
**Headline:** "מעקב תשלומים לפי תלמיד"
**Copy:**
> "כל תלמיד יש לו מחיר שיעור מותאם אישית.
> המערכת מחשבת יתרה ועוקבת אחרי תשלומים — פשוט ומדויק."

---

#### Feature 6: עבודה מהנייד
**Icon:** 📱
**Headline:** "מותאם לנייד — ללא הורדת אפליקציה"
**Copy:**
> "פותחים בדפדפן, עובדים מהנייד.
> כל הפיצ'רים זמינים גם בנייד — כי אתה תמיד בתנועה."

---

**Below feature cards — small CTA:**
> "רוצה לראות את זה בפעולה?" → `[צפה בהדגמה]`

---

### Section 5: SOCIAL PROOF

**Purpose:** בניית אמון. מורים ישראלים סומכים על מורים ישראלים.

**Headline (H2):**
> "מה מורים אומרים"

**Layout:** 3 testimonial cards (desktop), swipeable carousel (mobile).

**Testimonial Card Structure:**
- Photo (avatar / initials if no photo)
- Full name + city
- Star rating (5 stars)
- Quote (2-4 lines)

**Placeholder Testimonials (replace with real ones at launch):**

> **"סוף סוף יש לי תמונה ברורה על כל תלמיד"**
> "עד שהתחלתי להשתמש בדרייבקל ניהלתי הכל ב-WhatsApp ובפתקים. היום אני רואה את כל התלמידים שלי בלחיצה אחת ויודע בדיוק מי מוכן לטסט."
> — *דוד כהן, מורה נהיגה, פתח תקווה*

> **"חסך לי שעות בשבוע"**
> "אני מורה עצמאי עם 22 תלמידים. לפני דרייבקל בזבזתי שעה בשבוע על עדכון Excel. היום זה 5 דקות."
> — *מיכל לוי, מורה נהיגה, חיפה*

> **"הכלי שחיכיתי לו"**
> "מה שמדהים אותי זה מדד המוכנות לטסט. אני לא מנחש יותר — המערכת אומרת לי ברור אם התלמיד מוכן."
> — *אמיר ברק, בעל בית ספר לנהיגה, תל אביב*

**Below testimonials — social proof numbers (once real data exists):**
```
[  X+ מורים  ]  [  Y+ שיעורים נרשמו  ]  [  Z% שביעות רצון  ]
```
*(Hold placeholder until real data available. Launch without if needed.)*

---

### Section 6: HOW IT WORKS

**Purpose:** הפחתת חיכוך — להראות שהמערכת פשוטה להתחלה.

**Headline (H2):**
> "מתחילים תוך דקות"

**Layout:** 3-step horizontal flow (desktop), vertical numbered steps (mobile).

**Step 1:**
- **Icon/Number:** 1
- **Title:** "נרשמים בחינם"
- **Copy:** "הרשמה פשוטה עם אימייל. ללא כרטיס אשראי. 14 יום ניסיון מלא."

**Step 2:**
- **Icon/Number:** 2
- **Title:** "מוסיפים תלמידים"
- **Copy:** "מזינים שם, טלפון ומחיר שיעור. פחות מ-30 שניות לתלמיד."

**Step 3:**
- **Icon/Number:** 3
- **Title:** "מתחילים לנהל"
- **Copy:** "מתזמנים שיעורים, מעדכנים מיומנויות, ורואים מי מוכן לטסט — הכל בדשבורד אחד."

**CTA below steps:**
> `[התחל עכשיו — בחינם]`

---

### Section 7: PRICING PREVIEW

**Purpose:** הסרת חסם מחיר. מראה שהמוצר נגיש ואין הפתעות.

**Headline (H2):**
> "מחיר שמתאים לכל מורה"

**Sub-headline:**
> "תשלום חודשי פשוט. ביטול בכל עת. ללא עמלות נסתרות."

**Layout:** 2-3 pricing cards (see /pricing page for full detail). On homepage — simplified.

**Simplified Display (Homepage):**
> "החל מ-**X ₪ לחודש** — פחות ממה שגוביית שיעור אחד."

**CTA:**
> `[צפה בכל תוכניות המחיר]` → links to /pricing

**Note:** Exact pricing TBD. Recommended: ₪49-79/month solo, ₪99-149/month for school. Annual discount 20%.

---

### Section 8: FAQ

**Purpose:** טיפול בהתנגדויות נפוצות. מניעת נטישה לפני ההרשמה.

**Headline (H2):**
> "שאלות נפוצות"

**Layout:** Accordion (expand/collapse). 6-8 questions.

**FAQ Items:**

**ש: האם צריך להוריד אפליקציה?**
> ת: לא. דרייבקל פועל ישירות מהדפדפן — בנייד, בטאבלט ובמחשב. אין הורדה, אין עדכונים.

**ש: כמה תלמידים אפשר להוסיף?**
> ת: בתוכנית הבסיסית עד X תלמידים, בתוכנית המתקדמת — ללא הגבלה.

**ש: מה קורה לנתונים שלי?**
> ת: הנתונים שלך מאובטחים בענן ושייכים רק לך. ניתן לייצא בכל עת.

**ש: האם יש חוזה מחייב?**
> ת: לא. תשלום חודשי שניתן לבטל בכל עת.

**ש: כמה זמן לוקח ללמוד את המערכת?**
> ת: רוב המורים מתחילים לעבוד ביום הראשון. הממשק בעברית, פשוט וברור.

**ש: האם מתאים גם לבית ספר עם כמה מורים?**
> ת: כרגע המערכת מתאימה לכל מורה בנפרד. תמיכה במולטי-מורה — בקרוב.

**ש: מה אם יש לי שאלה או בעיה?**
> ת: יש לנו תמיכה ב-WhatsApp. אפשר לפנות אלינו ישירות ונחזור בהקדם.

---

### Section 9: FINAL CTA / BOTTOM HERO

**Purpose:** הזדמנות אחרונה להמיר. מי שהגיע עד כאן — מעוניין.

**Headline (H2):**
> "מוכן לנהל את התלמידים שלך בצורה חכמה יותר?"

**Sub-headline:**
> "הצטרף למורים שכבר חוסכים זמן עם דרייבקל."

**CTA:**
> `[התחל ניסיון חינם — 14 יום]`
> *(ללא כרטיס אשראי • ביטול בכל עת)*

**Design:** Full-width section with brand color background (deep blue or gradient). White text. Centered.

---

### Section 10: FOOTER

**Columns (RTL order, right to left):**

```
Column 1 (right): Logo + Tagline + Social icons (Facebook, Instagram)
Column 2: מוצר — תכונות | מחירים | הרשמה
Column 3: חברה — אודות | בלוג | צור קשר
Column 4 (left): תמיכה — שאלות נפוצות | WhatsApp | מדיניות פרטיות | תנאי שימוש
```

**Bottom bar:**
> "© 2026 DriveKal. כל הזכויות שמורות. | פותח על ידי Smartsoftweb"

---

## 5. Inner Pages

### /features — תכונות מלאות

**Purpose:** SEO + Consideration stage. מי שרוצה לדעת יותר לפני ההרשמה.

**Structure:**
1. Hero (short) — "כל מה שדרייבקל עושה"
2. Feature deep-dive cards (same 6 features as homepage, but expanded)
3. Screenshots gallery (lightbox)
4. Comparison table: DriveKal vs Excel vs נייר
5. CTA block

**Comparison Table:**

| תכונה | DriveKal | Excel | נייר/WhatsApp |
|-------|---------|-------|---------------|
| מדד מוכנות לטסט | ✅ אוטומטי | ❌ | ❌ |
| פרופיל תלמיד | ✅ | חלקי | ❌ |
| לוח שנה | ✅ | ❌ | ❌ |
| גישה מהנייד | ✅ | חלקי | ✅ |
| מעקב תשלומים | ✅ | ❌ (ידני) | ❌ |
| גיבוי אוטומטי | ✅ | ❌ | ❌ |
| בעברית מלאה | ✅ | ❌ | ✅ |
| זמן הגדרה | דקות | שעות | — |

---

### /pricing — מחירים

**Purpose:** Conversion page. הסרת חסם מחיר.

**Structure:**
1. Headline: "תמחור פשוט. ללא הפתעות."
2. Toggle: חודשי / שנתי (20% הנחה שנתי)
3. Pricing cards (2-3 plans)
4. Feature checklist per plan
5. FAQ section (billing specific)
6. Money-back / trial guarantee
7. CTA

**Recommended Plans:**

**תוכנית מורה עצמאי (Solo):**
- מחיר: ₪X/חודש (₪Y/שנה)
- עד 30 תלמידים
- כל הפיצ'רים הבסיסיים
- תמיכה WhatsApp
- CTA: "התחל ניסיון 14 יום"

**תוכנית מקצועי (Pro):**
- מחיר: ₪XX/חודש (₪YY/שנה)
- ללא הגבלת תלמידים
- כל הפיצ'רים כולל עתידיים
- תמיכה מועדפת
- **Badge: "הכי פופולרי"**
- CTA: "התחל ניסיון 14 יום"

**תוכנית בית ספר (School):** *(לאחר השקת מולטי-מורה)*
- צור קשר למחיר
- כמה מורים
- ניהול מרכזי
- CTA: "צור קשר"

---

### /contact — צור קשר ודמו

**Purpose:** Lead capture. מי שרוצה לדבר עם אדם אמיתי לפני הרכישה.

**Structure:**
1. Headline: "נשמח לעזור"
2. Contact form (see Technical Notes)
3. WhatsApp direct link (prominent)
4. Email (optional)
5. Expected response time: "נחזור תוך שעה בשעות עבודה"

**Form Fields:**
- שם מלא (required)
- טלפון (required)
- אימייל (optional)
- "ספר לנו קצת עליך" — dropdown: מורה עצמאי / בית ספר לנהיגה / אחר
- "מה הכי מעניין אותך?" — checkboxes: ניסיון חינם / הדגמה / מידע על מחירים
- הערות (optional textarea)
- Submit: "שלח ←"

**Post-submit:** Thank you message + WhatsApp link

---

### /about — אודות

**Purpose:** Trust building. מי עומד מאחורי המוצר.

**Structure:**
1. Story: "למה בנינו את דרייבקל"
   - הכאב שזיהינו (ניהול ידני, בזבוז זמן)
   - הפתרון שבנינו
2. Team / Founder intro (brief, personal)
3. Vision: "המטרה שלנו — לשחרר מורי נהיגה מהניהול"
4. Values: מקצועיות, פשטות, עברית ראשית
5. CTA: "הצטרף אלינו"

---

### /blog — בלוג

**Purpose:** SEO ארוך טווח. Lead generation אורגני.

**Structure:**
- Grid of post cards: תמונה + כותרת + תיאור קצר + תאריך
- Categories: טיפים / מדריכים / חדשות המוצר

**First 5 Blog Posts to Write:**
1. "5 דברים שכל מורה נהיגה צריך לעקוב אחריהם" (SEO)
2. "מתי תלמיד מוכן לטסט? המדריך המלא" (SEO high-intent)
3. "למה Excel לא מספיק לניהול בית ספר לנהיגה" (Comparison/competitor)
4. "איך לחסוך 3 שעות בשבוע כמורה נהיגה עצמאי" (Pain point)
5. "הכירו את דרייבקל — תוכנת הניהול למורי נהגיה" (Product intro)

---

## 6. CTA & Conversion Strategy

### Primary CTA (Global)
**Text:** "התחל ניסיון חינם — 14 יום"
**Sub-text:** "ללא כרטיס אשראי"
**Placement:**
- Hero section (above fold)
- End of every content section (as secondary CTA)
- Sticky header (desktop)
- Fixed bottom bar (mobile)
- Footer

### Secondary CTA
**Text:** "צפה בהדגמה קצרה"
**Type:** Opens Loom video or YouTube embed in modal
**Placement:** Hero section, Features page

### Micro CTAs (contextual)
- After pain points section: "נשמע מוכר? בוא נראה לך איך לפתור את זה →"
- After features: "רוצה לנסות? 14 יום חינם, ללא כרטיס אשראי"
- After FAQ: "עוד שאלות? נדבר ב-WhatsApp →"

### WhatsApp Conversion Path
**For hesitant users:** WhatsApp button always visible (floating, bottom-left on mobile)
**Message template (pre-filled):**
> "שלום! ראיתי את דרייבקל ורציתי לדעת יותר..."

### Funnel Logic
```
Visitor arrives
    ↓
Reads hero → Clicks "ניסיון חינם" OR "הדגמה"
    ↓
If clicked Trial: Signup form → App onboarding
If clicked Demo: Loom video → Email capture → Follow-up
If hesitant: WhatsApp button → Direct conversation → Conversion
```

### Email Capture (Pre-launch / Coming Soon)
If the app is not yet ready for public signup, use a waitlist page:
- Headline: "דרייבקל — בקרוב"
- Sub: "השאר פרטים ונעדכן אותך ראשון"
- Email field + Submit
- After: "תודה! נחזור אליך בקרוב. בינתיים — עקוב אחרינו ב-Facebook"

---

## 7. Technical Notes & Integrations

### Forms
- **Technology recommendation:** React Hook Form + Zod validation (consistent with app stack) OR simple static HTML form with Netlify Forms / Formspree for the marketing site
- **Alternatively:** Separate marketing site (Next.js or plain HTML) connected to N8N webhook
- **Lead destination:** ClickUp CRM (לידים list: 151501933) via N8N webhook
- **Notification:** WhatsApp notification to Itay when new lead arrives

### Lead Capture Flow (N8N)
```
Form submit → Webhook → N8N Workflow:
    → Create lead in ClickUp (לידים list)
    → Send WhatsApp notification
    → Send auto-reply email to lead
```

### Analytics
- **Install:** Google Analytics 4 (GA4) + Google Search Console
- **Events to track:**
  - `cta_hero_click` — Hero CTA clicked
  - `demo_video_play` — Demo video started
  - `pricing_view` — /pricing page viewed
  - `form_submit` — Contact form submitted
  - `whatsapp_click` — WhatsApp button clicked
  - `signup_complete` — Free trial started
- **Conversion:** Track "signup_complete" as primary conversion in GA4

### Performance
- Images: WebP format, compressed, lazy-loaded
- Videos: Hosted on YouTube/Loom (no self-hosting)
- Fonts: System font stack OR Google Fonts (Hebrew: Rubik or Assistant)
- CSS: Tailwind (purged) for minimal bundle
- Lighthouse target: ≥90 mobile performance score

### Hosting Options (Marketing Site)
- **Option A:** Vercel (Next.js) — fast, free tier, easy deployment
- **Option B:** Netlify — simpler, good for static/JAMstack
- **Option C:** Same domain as app (Lovable) — harder to separate concerns
- **Recommendation:** Vercel + Next.js (separate repo from the app)

### Domain
- **Primary:** drivekal.co.il
- **Redirect:** www.drivekal.co.il → drivekal.co.il
- **SSL:** Required (Let's Encrypt via Vercel/Netlify)

### WhatsApp Integration
- **Floating button:** bottom-left (fixed position, always visible on mobile)
- **Link format:** `https://wa.me/972XXXXXXXXX?text=שלום%2C+ראיתי+את+דרייבקל+ורציתי+לדעת+יותר`
- **Library:** None needed — plain `<a>` tag

---

## 8. SEO Strategy

### Primary Keywords (Hebrew)
| Keyword | Intent | Monthly Volume Est. |
|---------|--------|---------------------|
| תוכנה לבית ספר לנהיגה | Commercial | Medium |
| ניהול תלמידים נהיגה | Commercial | Low-Medium |
| אפליקציה למורה נהיגה | Commercial | Low |
| דשבורד מורה נהיגה | Navigational | Low |
| מעקב התקדמות תלמיד נהיגה | Informational | Low |
| מתי תלמיד מוכן לטסט | Informational | Medium |

### On-Page SEO
- **Title tag (homepage):** `דרייבקל — תוכנת ניהול לבית ספר לנהיגה | ניסיון חינם`
- **Meta description:** `ניהול תלמידים, מעקב מיומנויות ומדד מוכנות לטסט — הכל בעברית, הכל בנייד. נסה דרייבקל חינם 14 יום.`
- **H1:** One per page, keyword-rich
- **Alt text:** Hebrew, descriptive for all images
- **Schema markup:** SoftwareApplication, Organization, FAQPage

### Local SEO
- Google Business Profile: "DriveKal — תוכנה למורי נהגיה"
- NAP consistency (Name, Address, Phone) across all platforms

### Content SEO (Blog)
- Publish 1 article/week minimum
- Target long-tail: "כיצד לעקוב אחרי מיומנויות נהיגה של תלמיד"
- Internal linking: all blog posts link to homepage CTA

---

## 9. Design System Notes

### Brand Colors (Recommended)
```
Primary Blue:    #1E40AF  (buttons, links, accents)
Primary Green:   #16A34A  (CTA button, success states, "מוכן לטסט")
Light Blue:      #DBEAFE  (section backgrounds, cards)
Dark Navy:       #0F172A  (headings, footer)
Mid Gray:        #6B7280  (body text, secondary)
Light Gray:      #F9FAFB  (page background, alt sections)
White:           #FFFFFF
```

### Typography
```
Font Family:  'Rubik', 'Assistant', or system-ui (Hebrew support required)
Headings (H1): 40-56px, bold (700), dark navy
Headings (H2): 28-36px, bold (700), dark navy
Body:         16-18px, regular (400), mid gray
CTA buttons:  16-18px, semibold (600), white on colored bg
```

### Spacing
- Section padding: 80px top/bottom (desktop), 48px (mobile)
- Container max-width: 1200px, centered
- Card padding: 24-32px
- Border radius: rounded-xl (12px) for cards, rounded-lg (8px) for buttons

### RTL Specifics
- All `dir="rtl"` at `<html>` level
- `text-align: right` as default
- Flexbox: use `flex-row-reverse` where needed, or rely on RTL auto-flip
- Icons: directional icons (arrows) must be mirrored for RTL
- WhatsApp button: bottom-left (becomes visually prominent in RTL)
- Padding/margin: double-check that padding-right/left are not reversed unintentionally

### Mobile-First Rules
1. Design for 375px width first
2. All tap targets ≥ 44px height
3. CTA button: full-width on mobile
4. Font size: minimum 16px for body (prevents iOS auto-zoom on inputs)
5. Navigation: hamburger menu, no horizontal scroll
6. Images: max-width: 100%, object-fit: cover
7. Cards: full-width stack on mobile, grid on desktop

### Dark/Light Mode
- Marketing site: light mode only (simpler, higher trust for Israeli B2B)
- The app itself supports dark mode — can mention this in features

---

## 10. Content Calendar Tie-in

The website feeds into the broader marketing content strategy. Each week:

| Day | Marketing Website Action | Social/Email |
|-----|--------------------------|--------------|
| Monday | Blog post published | Share on Facebook group |
| Wednesday | Feature spotlight updated | Instagram Reel + story |
| Friday | New testimonial added (when available) | WhatsApp broadcast |

### Launch Checklist
- [ ] Domain registered: drivekal.co.il
- [ ] Hosting configured (Vercel recommended)
- [ ] Google Analytics 4 installed
- [ ] Facebook Pixel installed
- [ ] WhatsApp number set up
- [ ] N8N lead capture webhook active
- [ ] ClickUp CRM ready for leads
- [ ] Demo video recorded (Loom, 2-3 minutes max)
- [ ] At least 1 real testimonial OR placeholder removed
- [ ] All CTAs tested end-to-end
- [ ] Mobile tested on real device (iPhone + Android)
- [ ] Hebrew spell-check complete
- [ ] Page speed tested (Lighthouse ≥ 90)
- [ ] SSL certificate active
- [ ] SEO meta tags on all pages
- [ ] Privacy policy page live (required for Google Ads)

---

## Appendix A — Page Copy Snippets (Ready to Use)

### Hero — Full Copy Block
```
H1: כל תלמיד. כל שיעור. בראש שקט.

SUB: דרייבקל הוא הדשבורד שמאפשר לך לעקוב אחרי כל תלמיד,
     כל שיעור, ומדד המוכנות לטסט — הכל במקום אחד, מהנייד.

CTA1: [התחל ניסיון חינם — 14 יום]
CTA2: צפה בהדגמה קצרה ←

TRUST: ללא כרטיס אשראי  •  ניסיון חינם 14 יום  •  ביטול בכל עת
```

### Section End CTA — Standard Block
```
"מוכן להתחיל?"
[התחל ניסיון חינם →]
ללא כרטיס אשראי. ביטול בכל עת.
```

### 404 Page
```
H1: אופס, הדף לא נמצא
P: נראה שהלכת לדרך הלא נכונה. אבל לא נדאג — בחזרה לבית:
[→ חזרה לדף הבית]
[→ צור קשר אם יש בעיה]
```

---

## Appendix B — Competitor Positioning Map

```
                    HIGH COMPLEXITY
                          |
       Enterprise ERP  [  ]
       (SAP, etc.)        |
                          |
                          |
GENERIC ─────────────────────────────── DRIVING-SPECIFIC
(Excel, Google)           |                    [DriveKal ★]
                          |
                          |
                  [Paper/WhatsApp]
                          |
                    LOW COMPLEXITY
```

**DriveKal's Position:** Low complexity + Driving-specific = unique quadrant, no direct competitor.

---

*Document created by Marketing Strategist Agent — 2026-02-19*
*Review and update before website development begins.*
*Coordinate with UI Designer for wireframe implementation.*
