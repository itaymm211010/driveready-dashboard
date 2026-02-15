import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hardcoded teacher ID until auth is implemented
const TEACHER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export type DbStudent = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  balance: number;
  readiness_percentage: number;
  total_lessons: number;
  avatar_url: string | null;
};

export type DbLesson = {
  id: string;
  student_id: string;
  date: string;
  time_start: string;
  time_end: string;
  status: string;
  amount: number;
  skills_practiced: string[] | null;
  payment_status: string | null;
  notes: string | null;
};

export type DbSkillCategory = {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  skills: DbSkill[];
};

export type DbSkill = {
  id: string;
  name: string;
  category_id: string;
  sort_order: number;
  student_skill?: DbStudentSkill;
  history: DbSkillHistory[];
};

export type DbStudentSkill = {
  id: string;
  current_status: string;
  times_practiced: number;
  last_practiced_date: string | null;
  last_proficiency: number | null;
  last_note: string | null;
};

export type DbSkillHistory = {
  id: string;
  lesson_number: number | null;
  lesson_date: string;
  status: string;
  proficiency_estimate: number | null;
  teacher_note: string | null;
  practice_duration_minutes: number | null;
};

export function useTodayLessons() {
  return useQuery({
    queryKey: ['today-lessons'],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);

      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('teacher_id', TEACHER_ID)
        .eq('date', today)
        .order('time_start');

      if (lessonsError) throw lessonsError;
      if (!lessons?.length) return [];

      const studentIds = [...new Set(lessons.map((l) => l.student_id))];
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .in('id', studentIds);

      if (studentsError) throw studentsError;

      const studentMap = new Map((students ?? []).map((s) => [s.id, s]));

      return lessons.map((lesson) => ({
        ...lesson,
        student: studentMap.get(lesson.student_id)!,
      }));
    },
  });
}

export function useLessonWithStudent(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lesson', lessonId],
    enabled: !!lessonId,
    queryFn: async () => {
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId!)
        .maybeSingle();

      if (lessonError) throw lessonError;
      if (!lesson) return null;

      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', lesson.student_id)
        .maybeSingle();

      if (studentError) throw studentError;

      return { lesson, student };
    },
  });
}

export function useStudentSkillTree(studentId: string | undefined) {
  return useQuery({
    queryKey: ['skill-tree', studentId],
    enabled: !!studentId,
    queryFn: async () => {
      // Fetch categories
      const { data: categories, error: catError } = await supabase
        .from('skill_categories')
        .select('*')
        .eq('teacher_id', TEACHER_ID)
        .order('sort_order');

      if (catError) throw catError;

      // Fetch skills
      const { data: skills, error: skillError } = await supabase
        .from('skills')
        .select('*')
        .eq('teacher_id', TEACHER_ID)
        .order('sort_order');

      if (skillError) throw skillError;

      // Fetch student_skills for this student
      const { data: studentSkills, error: ssError } = await supabase
        .from('student_skills')
        .select('*')
        .eq('student_id', studentId!);

      if (ssError) throw ssError;

      // Fetch skill_history for these student_skills
      const ssIds = (studentSkills ?? []).map((ss) => ss.id);
      let historyRows: any[] = [];
      if (ssIds.length > 0) {
        const { data, error: hError } = await supabase
          .from('skill_history')
          .select('*')
          .in('student_skill_id', ssIds)
          .order('lesson_date', { ascending: false });

        if (hError) throw hError;
        historyRows = data ?? [];
      }

      // Build maps
      const ssMap = new Map((studentSkills ?? []).map((ss) => [ss.skill_id, ss]));
      const historyBySSId = new Map<string, typeof historyRows>();
      for (const h of historyRows) {
        const arr = historyBySSId.get(h.student_skill_id) ?? [];
        arr.push(h);
        historyBySSId.set(h.student_skill_id, arr);
      }

      // Assemble tree
      const result: DbSkillCategory[] = (categories ?? []).map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        sort_order: cat.sort_order,
        skills: (skills ?? [])
          .filter((s) => s.category_id === cat.id)
          .map((s) => {
            const ss = ssMap.get(s.id);
            return {
              id: s.id,
              name: s.name,
              category_id: s.category_id,
              sort_order: s.sort_order,
              student_skill: ss
                ? {
                    id: ss.id,
                    current_status: ss.current_status,
                    times_practiced: ss.times_practiced,
                    last_practiced_date: ss.last_practiced_date,
                    last_proficiency: ss.last_proficiency,
                    last_note: ss.last_note,
                  }
                : undefined,
              history: ss ? (historyBySSId.get(ss.id) ?? []) : [],
            };
          }),
      }));

      return result;
    },
  });
}
