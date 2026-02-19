import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';

export function useStudentReport(studentId: string | undefined) {
  const { rootTeacherId } = useAuth();

  return useQuery({
    queryKey: ['student-report', studentId, rootTeacherId],
    enabled: !!studentId && !!rootTeacherId,
    queryFn: async () => {
      const { data: student, error: sErr } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId!)
        .maybeSingle();
      if (sErr) throw sErr;
      if (!student) return null;

      const { data: categories } = await supabase
        .from('skill_categories')
        .select('*')
        .eq('teacher_id', rootTeacherId!)
        .order('sort_order');

      const { data: skills } = await supabase
        .from('skills')
        .select('*')
        .eq('teacher_id', rootTeacherId!)
        .order('sort_order');

      const { data: studentSkills } = await supabase
        .from('student_skills')
        .select('*')
        .eq('student_id', studentId!);

      // Fetch skill_history for progress timeline
      const studentSkillIds = (studentSkills ?? []).map((ss) => ss.id);
      let historyData: Array<{ lesson_date: string; score: number; student_skill_id: string }> = [];
      if (studentSkillIds.length > 0) {
        const { data } = await supabase
          .from('skill_history')
          .select('lesson_date, score, student_skill_id')
          .in('student_skill_id', studentSkillIds)
          .order('lesson_date', { ascending: true });
        historyData = data ?? [];
      }

      const ssMap = new Map((studentSkills ?? []).map((ss) => [ss.skill_id, ss]));

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
          (s) => (s.studentSkill?.current_score ?? 0) >= 4
        ).length;
        const inProgress = cat.skills.filter(
          (s) => { const sc = s.studentSkill?.current_score ?? 0; return sc > 0 && sc < 4; }
        ).length;
        const notLearned = total - mastered - inProgress;
        const score = mastered + inProgress * 0.5;
        return {
          category: cat.name,
          value: total > 0 ? Math.round((score / total) * 100) : 0,
          fullMark: 100,
          mastered,
          inProgress,
          notLearned,
          total,
        };
      });

      // Progress timeline: track mastered skill count over time from history
      const totalSkillCount = (skills ?? []).length;
      const dateGroups = new Map<string, { student_skill_id: string; score: number }[]>();
      for (const entry of historyData) {
        const group = dateGroups.get(entry.lesson_date) ?? [];
        group.push(entry);
        dateGroups.set(entry.lesson_date, group);
      }

      const skillStates = new Map<string, number>();
      const sortedDates = Array.from(dateGroups.keys()).sort();
      const progressData = sortedDates.map((dateStr) => {
        for (const e of dateGroups.get(dateStr)!) {
          skillStates.set(e.student_skill_id, e.score);
        }
        const masteredCount = [...skillStates.values()].filter(s => s >= 4).length;
        return {
          date: format(new Date(dateStr), 'MMM d'),
          mastered: masteredCount,
          pct: totalSkillCount > 0 ? Math.round((masteredCount / totalSkillCount) * 100) : 0,
        };
      });

      return { student, skillTree, radarData, progressData };
    },
  });
}
