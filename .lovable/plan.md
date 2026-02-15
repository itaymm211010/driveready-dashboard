

# DRIVEKAL - Premium CRM for Driving Instructors

## Overview
A mobile-first web app with two distinct interfaces: a utility-focused **Teacher App** (light mode) for managing lessons and tracking skills, and a gamified **Student Dashboard** (dark mode) with a premium "Driver Card" aesthetic.

---

## Phase 1: Foundation & Design System

### Design Tokens & Theming
- Teacher theme: Emerald green primary, high-contrast light mode optimized for sunlight
- Student theme: Neon blue/purple dark mode with glassmorphism and glow effects
- RTL-ready layout using logical CSS properties
- Large tap targets (44px+) throughout

### Mock Data Layer
- Create comprehensive mock data: 5 students, today's lessons, full skill tree with categories and history
- Simulated API delays for realistic feel

### Shared Components
- Bottom navigation bar (Teacher app)
- Circular and linear progress bars
- Lesson cards with debt indicators
- Skill status toggle (Not Learned / In Progress / Mastered)

---

## Phase 2: Teacher App - Core Screens

### Screen 1: Today's Dashboard (`/teacher/today`)
- Date header with daily stats (lesson count, expected income)
- Scrollable lesson cards showing student name, time, debt status
- Action buttons per lesson: Navigate (Waze deep link), Call (tel: link), Start Lesson
- Color-coded debt indicators (red border for owing students, green for clear)

### Screen 2: Active Lesson & Skill Tracking (`/teacher/lesson/:id`)
- Sticky header with student name, auto-running timer, and overall progress bar
- Skills grouped by category with sticky category headers
- Collapsed skill rows showing: name, last proficiency %, times practiced, truncated last note
- Expandable full history view per skill with all past lesson entries
- 3-state toggle buttons (pill style) for instant status updates
- Optional note field per skill
- Smart badges: ⚠️ for low proficiency, ⏰ for skills not practiced recently
- Sticky bottom bar with "End Lesson & Bill" CTA

### Screen 3: Student Profile (`/teacher/student/:id`)
- Header with readiness percentage and balance
- Quick action grid: WhatsApp, Report, Charge
- Lesson history timeline showing skills practiced and payment status

### Screen 4: End Lesson & Payment (Modal)
- Lesson summary (duration, amount)
- Three payment options: Cash, Generate Receipt, Add to Debt
- Success animation on completion, auto-return to dashboard

---

## Phase 3: Student Dashboard

### Screen 5: Driver Card (`/student/:id/report`)
- Dark mode premium aesthetic with glassmorphism cards
- Large circular progress indicator showing overall readiness %
- Radar chart (recharts) visualizing 5 skill categories
- Progress timeline line chart showing improvement over months
- Action plan card with next lesson focus and latest teacher feedback
- Shareable link (no auth required)

---

## Phase 4: Polish & Nice-to-Haves

### Animations & Micro-interactions
- Page transitions with fade + slide
- Button press scale feedback
- Skill status change animations
- Success states with checkmark animations

### Additional Features (time permitting)
- Students list page with search/filter
- Monthly reports page with income charts
- WhatsApp share with pre-filled message
- Teacher suggestions based on skill history patterns

