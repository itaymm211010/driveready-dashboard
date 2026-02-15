export interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  balance: number;
  readiness_percentage: number;
  total_lessons: number;
  avatar_url?: string;
}

export interface Lesson {
  id: string;
  student_id: string;
  date: string;
  time_start: string;
  time_end: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  amount: number;
  skills_practiced?: string[];
  payment_status?: 'paid' | 'debt' | 'pending';
}

export type SkillStatus = 'not_learned' | 'in_progress' | 'mastered';

export interface SkillHistory {
  lesson_id: string;
  lesson_number: number;
  lesson_date: string;
  status: SkillStatus;
  proficiency_estimate?: number;
  teacher_note?: string;
  practice_duration_minutes?: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  current_status: SkillStatus;
  times_practiced: number;
  last_practiced_date?: string;
  last_proficiency?: number;
  last_note?: string;
  history: SkillHistory[];
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  skills: Skill[];
  average_score: number;
}

// ─── Students ───

export const mockStudents: Student[] = [
  { id: '1', name: 'Danny Cohen', phone: '054-1234567', email: 'danny@example.com', balance: -600, readiness_percentage: 67, total_lessons: 18 },
  { id: '2', name: 'Sarah Levi', phone: '052-9876543', email: 'sarah@example.com', balance: 0, readiness_percentage: 85, total_lessons: 24 },
  { id: '3', name: 'Yoni Mizrahi', phone: '050-5551234', email: 'yoni@example.com', balance: -200, readiness_percentage: 42, total_lessons: 10 },
  { id: '4', name: 'Maya Ben-Ari', phone: '053-7778899', email: 'maya@example.com', balance: 0, readiness_percentage: 91, total_lessons: 28 },
  { id: '5', name: 'Amit Shapira', phone: '058-3334455', email: 'amit@example.com', balance: -400, readiness_percentage: 55, total_lessons: 14 },
];

// ─── Today's Lessons ───

export const mockTodayLessons: Lesson[] = [
  { id: 'l1', student_id: '1', date: '2026-02-15', time_start: '08:00', time_end: '09:30', status: 'completed', amount: 200, skills_practiced: ['Mirror Adjustment', 'Parallel Parking'], payment_status: 'debt' },
  { id: 'l2', student_id: '3', date: '2026-02-15', time_start: '10:00', time_end: '11:30', status: 'scheduled', amount: 200, payment_status: 'pending' },
  { id: 'l3', student_id: '2', date: '2026-02-15', time_start: '12:00', time_end: '13:30', status: 'scheduled', amount: 200, payment_status: 'pending' },
  { id: 'l4', student_id: '1', date: '2026-02-15', time_start: '14:00', time_end: '15:30', status: 'scheduled', amount: 200, payment_status: 'pending' },
  { id: 'l5', student_id: '5', date: '2026-02-15', time_start: '16:00', time_end: '17:30', status: 'scheduled', amount: 200, payment_status: 'pending' },
];

// ─── Skill Tree ───

const makeHistory = (entries: Partial<SkillHistory>[]): SkillHistory[] =>
  entries.map((e, i) => ({
    lesson_id: `lh${i}`,
    lesson_number: 15 - i * 3,
    lesson_date: new Date(2026, 1, 12 - i * 7).toISOString().slice(0, 10),
    status: 'not_learned' as SkillStatus,
    ...e,
  }));

export const mockSkillCategories: SkillCategory[] = [
  {
    id: 'cat1', name: 'Vehicle Operation', icon: '🚗', average_score: 85,
    skills: [
      { id: 's1', name: 'Pre-Drive Setup', category: 'Vehicle Operation', current_status: 'mastered', times_practiced: 6, last_practiced_date: '2026-02-12', last_proficiency: 95, last_note: 'Perfect routine', history: makeHistory([{ status: 'mastered', proficiency_estimate: 95, teacher_note: 'Perfect routine' }, { status: 'in_progress', proficiency_estimate: 70, teacher_note: 'Forgot mirrors once' }]) },
      { id: 's2', name: 'Steering Control', category: 'Vehicle Operation', current_status: 'mastered', times_practiced: 8, last_practiced_date: '2026-02-12', last_proficiency: 90, last_note: 'Smooth handling', history: makeHistory([{ status: 'mastered', proficiency_estimate: 90, teacher_note: 'Smooth handling' }]) },
      { id: 's3', name: 'Gear Shifting', category: 'Vehicle Operation', current_status: 'in_progress', times_practiced: 5, last_practiced_date: '2026-02-10', last_proficiency: 60, last_note: 'Still rough on 3rd gear', history: makeHistory([{ status: 'in_progress', proficiency_estimate: 60, teacher_note: 'Still rough on 3rd gear' }, { status: 'in_progress', proficiency_estimate: 40, teacher_note: 'Needs more clutch control' }]) },
      { id: 's4', name: 'Braking Technique', category: 'Vehicle Operation', current_status: 'mastered', times_practiced: 7, last_practiced_date: '2026-02-12', last_proficiency: 88, last_note: 'Good progressive braking', history: makeHistory([{ status: 'mastered', proficiency_estimate: 88, teacher_note: 'Good progressive braking' }]) },
    ],
  },
  {
    id: 'cat2', name: 'Road Behavior', icon: '🛣️', average_score: 70,
    skills: [
      { id: 's5', name: 'Lane Discipline', category: 'Road Behavior', current_status: 'in_progress', times_practiced: 4, last_practiced_date: '2026-02-10', last_proficiency: 65, last_note: 'Drifts right occasionally', history: makeHistory([{ status: 'in_progress', proficiency_estimate: 65, teacher_note: 'Drifts right occasionally' }]) },
      { id: 's6', name: 'Speed Management', category: 'Road Behavior', current_status: 'in_progress', times_practiced: 5, last_practiced_date: '2026-02-12', last_proficiency: 70, last_note: 'Better awareness of limits', history: makeHistory([{ status: 'in_progress', proficiency_estimate: 70, teacher_note: 'Better awareness of limits' }]) },
      { id: 's7', name: 'Following Distance', category: 'Road Behavior', current_status: 'mastered', times_practiced: 6, last_practiced_date: '2026-02-12', last_proficiency: 85, last_note: 'Consistently good', history: makeHistory([{ status: 'mastered', proficiency_estimate: 85, teacher_note: 'Consistently good' }]) },
      { id: 's8', name: 'Mirror Checks', category: 'Road Behavior', current_status: 'in_progress', times_practiced: 3, last_practiced_date: '2026-02-05', last_proficiency: 55, last_note: 'Forgets before lane changes', history: makeHistory([{ status: 'in_progress', proficiency_estimate: 55, teacher_note: 'Forgets before lane changes' }, { status: 'not_learned', teacher_note: 'Rarely checks' }]) },
    ],
  },
  {
    id: 'cat3', name: 'Intersections', icon: '🔀', average_score: 60,
    skills: [
      { id: 's9', name: 'Right of Way', category: 'Intersections', current_status: 'in_progress', times_practiced: 4, last_practiced_date: '2026-02-10', last_proficiency: 60, last_note: 'Hesitates at unmarked crossings', history: makeHistory([{ status: 'in_progress', proficiency_estimate: 60, teacher_note: 'Hesitates at unmarked crossings' }]) },
      { id: 's10', name: 'Traffic Lights', category: 'Intersections', current_status: 'mastered', times_practiced: 6, last_practiced_date: '2026-02-12', last_proficiency: 90, last_note: 'Confident and correct', history: makeHistory([{ status: 'mastered', proficiency_estimate: 90, teacher_note: 'Confident and correct' }]) },
      { id: 's11', name: 'Roundabouts', category: 'Intersections', current_status: 'not_learned', times_practiced: 1, last_practiced_date: '2026-01-20', last_proficiency: 20, last_note: 'Very hesitant, needs practice', history: makeHistory([{ status: 'not_learned', proficiency_estimate: 20, teacher_note: 'Very hesitant, needs practice' }]) },
      { id: 's12', name: 'Left Turns', category: 'Intersections', current_status: 'in_progress', times_practiced: 3, last_practiced_date: '2026-02-05', last_proficiency: 50, last_note: 'Timing still off', history: makeHistory([{ status: 'in_progress', proficiency_estimate: 50, teacher_note: 'Timing still off' }]) },
    ],
  },
  {
    id: 'cat4', name: 'Other Road Users', icon: '🚶', average_score: 75,
    skills: [
      { id: 's13', name: 'Pedestrian Awareness', category: 'Other Road Users', current_status: 'mastered', times_practiced: 5, last_practiced_date: '2026-02-12', last_proficiency: 85, last_note: 'Always yields correctly', history: makeHistory([{ status: 'mastered', proficiency_estimate: 85, teacher_note: 'Always yields correctly' }]) },
      { id: 's14', name: 'Cyclist Safety', category: 'Other Road Users', current_status: 'in_progress', times_practiced: 2, last_practiced_date: '2026-02-05', last_proficiency: 55, last_note: 'Passes too close sometimes', history: makeHistory([{ status: 'in_progress', proficiency_estimate: 55, teacher_note: 'Passes too close sometimes' }]) },
      { id: 's15', name: 'Bus & Truck Awareness', category: 'Other Road Users', current_status: 'mastered', times_practiced: 4, last_practiced_date: '2026-02-10', last_proficiency: 80, last_note: 'Good blind spot awareness', history: makeHistory([{ status: 'mastered', proficiency_estimate: 80, teacher_note: 'Good blind spot awareness' }]) },
    ],
  },
  {
    id: 'cat5', name: 'Special Maneuvers', icon: '🅿️', average_score: 50,
    skills: [
      { id: 's16', name: 'Parallel Parking', category: 'Special Maneuvers', current_status: 'in_progress', times_practiced: 3, last_practiced_date: '2026-02-12', last_proficiency: 30, last_note: 'Needs more work on distance judgment', history: makeHistory([{ status: 'in_progress', proficiency_estimate: 30, teacher_note: 'Needs more work on distance judgment' }, { status: 'in_progress', proficiency_estimate: 20, teacher_note: 'First time trying. Struggled with steering angle.' }, { status: 'not_learned', teacher_note: 'Observed only' }]) },
      { id: 's17', name: 'Reverse Parking', category: 'Special Maneuvers', current_status: 'not_learned', times_practiced: 1, last_practiced_date: '2026-01-15', last_proficiency: 15, last_note: 'Brief intro only', history: makeHistory([{ status: 'not_learned', proficiency_estimate: 15, teacher_note: 'Brief intro only' }]) },
      { id: 's18', name: 'Hill Start', category: 'Special Maneuvers', current_status: 'in_progress', times_practiced: 2, last_practiced_date: '2026-02-05', last_proficiency: 45, last_note: 'Rolled back twice', history: makeHistory([{ status: 'in_progress', proficiency_estimate: 45, teacher_note: 'Rolled back twice' }, { status: 'not_learned', proficiency_estimate: 10, teacher_note: 'Stalled multiple times' }]) },
      { id: 's19', name: 'Emergency Stop', category: 'Special Maneuvers', current_status: 'mastered', times_practiced: 4, last_practiced_date: '2026-02-10', last_proficiency: 85, last_note: 'Quick reaction, good control', history: makeHistory([{ status: 'mastered', proficiency_estimate: 85, teacher_note: 'Quick reaction, good control' }]) },
      { id: 's20', name: 'U-Turn', category: 'Special Maneuvers', current_status: 'not_learned', times_practiced: 0, history: [] },
    ],
  },
];

// ─── Student lesson history for profile ───

export const mockLessonHistory: Lesson[] = [
  { id: 'lh1', student_id: '1', date: '2026-02-15', time_start: '08:00', time_end: '09:30', status: 'completed', amount: 200, skills_practiced: ['Mirror Adjustment', 'Parallel Parking'], payment_status: 'debt' },
  { id: 'lh2', student_id: '1', date: '2026-02-12', time_start: '14:00', time_end: '15:30', status: 'completed', amount: 200, skills_practiced: ['Steering Control', 'Braking', 'Speed Management'], payment_status: 'paid' },
  { id: 'lh3', student_id: '1', date: '2026-02-10', time_start: '10:00', time_end: '11:30', status: 'completed', amount: 200, skills_practiced: ['Lane Discipline', 'Right of Way'], payment_status: 'paid' },
  { id: 'lh4', student_id: '1', date: '2026-02-05', time_start: '14:00', time_end: '15:30', status: 'completed', amount: 200, skills_practiced: ['Left Turns', 'Mirror Checks', 'Hill Start'], payment_status: 'debt' },
  { id: 'lh5', student_id: '1', date: '2026-01-29', time_start: '10:00', time_end: '11:30', status: 'completed', amount: 200, skills_practiced: ['Roundabouts', 'Parallel Parking'], payment_status: 'paid' },
];

// ─── Progress data for student dashboard charts ───

export const mockProgressData = [
  { month: 'Oct', readiness: 15 },
  { month: 'Nov', readiness: 28 },
  { month: 'Dec', readiness: 40 },
  { month: 'Jan', readiness: 55 },
  { month: 'Feb', readiness: 67 },
];

// ─── Helpers ───

export function getStudentById(id: string): Student | undefined {
  return mockStudents.find(s => s.id === id);
}

export function getLessonsForStudent(studentId: string): Lesson[] {
  return mockLessonHistory.filter(l => l.student_id === studentId);
}

export function getTodayLessonsWithStudents() {
  return mockTodayLessons.map(lesson => ({
    ...lesson,
    student: mockStudents.find(s => s.id === lesson.student_id)!,
  }));
}
