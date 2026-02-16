import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const TEACHER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export function useStudentProfile(studentId: string | undefined) {
  return useQuery({
    queryKey: ['student-profile', studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const { data: student, error: sErr } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId!)
        .maybeSingle();

      if (sErr) throw sErr;
      if (!student) return null;

      const { data: lessons, error: lErr } = await supabase
        .from('lessons')
        .select('*')
        .eq('student_id', studentId!)
        .order('date', { ascending: false })
        .order('time_start', { ascending: false });

      if (lErr) throw lErr;

      // Skill tree
      const { data: categories } = await supabase
        .from('skill_categories')
        .select('*')
        .eq('teacher_id', TEACHER_ID)
        .order('sort_order');

      const { data: skills } = await supabase
        .from('skills')
        .select('*')
        .eq('teacher_id', TEACHER_ID)
        .order('sort_order');

      const { data: studentSkills } = await supabase
        .from('student_skills')
        .select('*')
        .eq('student_id', studentId!);

      const ssMap = new Map((studentSkills ?? []).map((ss) => [ss.skill_id, ss]));

      // Fetch skill history
      const ssIds = (studentSkills ?? []).map((ss) => ss.id);
      let historyRows: any[] = [];
      if (ssIds.length > 0) {
        const { data: hData } = await supabase
          .from('skill_history')
          .select('*')
          .in('student_skill_id', ssIds)
          .order('lesson_date', { ascending: false });
        historyRows = hData ?? [];
      }
      const historyBySSId = new Map<string, any[]>();
      for (const h of historyRows) {
        const arr = historyBySSId.get(h.student_skill_id) ?? [];
        arr.push(h);
        historyBySSId.set(h.student_skill_id, arr);
      }

      const skillTree = (categories ?? []).map((cat) => ({
        ...cat,
        skills: (skills ?? [])
          .filter((s) => s.category_id === cat.id)
          .map((s) => {
            const ss = ssMap.get(s.id) ?? null;
            return {
              ...s,
              studentSkill: ss,
              student_skill: ss,
              history: ss ? (historyBySSId.get(ss.id) ?? []) : [],
            };
          }),
      }));

      return { student, lessons: lessons ?? [], skillTree };
    },
  });
}
