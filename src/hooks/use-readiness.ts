import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import {
  calculateReadiness,
  type StudentSkillWithCategory,
  type ReadinessResult,
} from '@/lib/calculations';

/** Name used to identify the advanced-driving category (category 4). */
const ADVANCED_CATEGORY_NAME = 'מצבים מתקדמים';

/**
 * Fetch student skills joined with skill metadata, calculate readiness,
 * and return the result alongside React Query loading / error states.
 */
export function useReadiness(studentId: string | undefined) {
  const { rootTeacherId } = useAuth();

  return useQuery({
    queryKey: ['readiness', studentId, rootTeacherId],
    enabled: !!studentId && !!rootTeacherId,
    queryFn: async (): Promise<ReadinessResult> => {
      // Fetch student_skills for this student
      const { data: studentSkills, error: ssErr } = await supabase
        .from('student_skills')
        .select('*')
        .eq('student_id', studentId!);

      if (ssErr) throw ssErr;

      // Fetch skills (to get category_id and name)
      const { data: skills, error: skErr } = await supabase
        .from('skills')
        .select('*')
        .eq('teacher_id', rootTeacherId!);

      if (skErr) throw skErr;

      // Fetch categories to find the advanced one
      const { data: categories, error: catErr } = await supabase
        .from('skill_categories')
        .select('*')
        .eq('teacher_id', rootTeacherId!);

      if (catErr) throw catErr;

      const advancedCategory = (categories ?? []).find(
        (c) => c.name === ADVANCED_CATEGORY_NAME,
      );

      // Build the joined shape that calculateReadiness expects
      const skillMap = new Map(
        (skills ?? []).map((s) => [s.id, s]),
      );

      const joined: StudentSkillWithCategory[] = (studentSkills ?? [])
        .filter((ss) => skillMap.has(ss.skill_id))
        .map((ss) => {
          const s = skillMap.get(ss.skill_id)!;
          return {
            ...ss,
            skill: { id: s.id, category_id: s.category_id, name: s.name },
          };
        });

      return calculateReadiness(joined, advancedCategory?.id);
    },
  });
}
