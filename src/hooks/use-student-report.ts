import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const TEACHER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

/** Derive a display status from a 0-5 score */
function scoreToStatus(score: number): string {
  if (score >= 4) return 'mastered';
  if (score > 0) return 'in_progress';
  return 'not_learned';
}

export function useStudentReport(studentId: string | undefined) {
  return useQuery({
    queryKey: ['student-report', studentId],
    enabled: !!studentId,
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
          (s) => scoreToStatus(s.studentSkill?.current_score ?? 0) === 'mastered'
        ).length;
        const inProgress = cat.skills.filter(
          (s) => scoreToStatus(s.studentSkill?.current_score ?? 0) === 'in_progress'
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

      // Progress timeline: cumulative mastered count per lesson_date
      const dateStatusMap = new Map<string, Set<string>>();
      for (const entry of historyData) {
        if (entry.score >= 4) {
          const dateKey = entry.lesson_date;
          if (!dateStatusMap.has(dateKey)) {
            dateStatusMap.set(dateKey, new Set());
          }
          dateStatusMap.get(dateKey)!.add(entry.student_skill_id);
        }
      }

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
