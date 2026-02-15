import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const TEACHER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export function useStudentReport(studentId: string | undefined) {
  return useQuery({
    queryKey: ['student-report', studentId],
    enabled: !!studentId,
    queryFn: async () => {
      // Fetch student
      const { data: student, error: sErr } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId!)
        .maybeSingle();
      if (sErr) throw sErr;
      if (!student) return null;

      // Fetch skill categories
      const { data: categories } = await supabase
        .from('skill_categories')
        .select('*')
        .eq('teacher_id', TEACHER_ID)
        .order('sort_order');

      // Fetch skills
      const { data: skills } = await supabase
        .from('skills')
        .select('*')
        .eq('teacher_id', TEACHER_ID)
        .order('sort_order');

      // Fetch student_skills
      const { data: studentSkills } = await supabase
        .from('student_skills')
        .select('*')
        .eq('student_id', studentId!);

      // Fetch skill_history for progress timeline
      const studentSkillIds = (studentSkills ?? []).map((ss) => ss.id);
      let historyData: Array<{ lesson_date: string; status: string; student_skill_id: string }> = [];
      if (studentSkillIds.length > 0) {
        const { data } = await supabase
          .from('skill_history')
          .select('lesson_date, status, student_skill_id')
          .in('student_skill_id', studentSkillIds)
          .order('lesson_date', { ascending: true });
        historyData = data ?? [];
      }

      const ssMap = new Map((studentSkills ?? []).map((ss) => [ss.skill_id, ss]));

      // Build skill tree with student status
      const skillTree = (categories ?? []).map((cat) => {
        const catSkills = (skills ?? [])
          .filter((s) => s.category_id === cat.id)
          .map((s) => ({
            ...s,
            studentSkill: ssMap.get(s.id) ?? null,
          }));
        return { ...cat, skills: catSkills };
      });

      // Radar chart data: mastery % per category
      const radarData = skillTree.map((cat) => {
        const total = cat.skills.length;
        const mastered = cat.skills.filter(
          (s) => s.studentSkill?.current_status === 'mastered'
        ).length;
        return {
          category: cat.name,
          value: total > 0 ? Math.round((mastered / total) * 100) : 0,
          fullMark: 100,
        };
      });

      // Progress timeline: cumulative mastered count per lesson_date
      // Group history by date, track cumulative mastered status
      const dateStatusMap = new Map<string, Set<string>>();
      for (const entry of historyData) {
        if (entry.status === 'mastered') {
          const dateKey = entry.lesson_date;
          if (!dateStatusMap.has(dateKey)) {
            dateStatusMap.set(dateKey, new Set());
          }
          dateStatusMap.get(dateKey)!.add(entry.student_skill_id);
        }
      }

      // Build cumulative timeline
      const allMastered = new Set<string>();
      const sortedDates = Array.from(dateStatusMap.keys()).sort();
      const progressData = sortedDates.map((dateStr) => {
        const newlyMastered = dateStatusMap.get(dateStr)!;
        newlyMastered.forEach((id) => allMastered.add(id));
        return {
          date: format(new Date(dateStr), 'MMM d'),
          mastered: allMastered.size,
        };
      });

      return { student, skillTree, radarData, progressData };
    },
  });
}
