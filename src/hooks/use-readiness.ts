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

export function useReadiness(studentId: string | undefined) {
  const { rootTeacherId } = useAuth();

  return useQuery({
    queryKey: ['readiness', studentId, rootTeacherId],
    enabled: !!studentId && !!rootTeacherId,
    queryFn: async (): Promise<ReadinessResult> => {
      const { data: studentSkills, error: ssErr } = await supabase
        .from('student_skills')
        .select('*')
        .eq('student_id', studentId!);

      if (ssErr) throw ssErr;

      const { data: skills, error: skErr } = await supabase
        .from('skills')
        .select('*')
        .eq('teacher_id', rootTeacherId!);

      if (skErr) throw skErr;

      const { data: categories, error: catErr } = await supabase
        .from('skill_categories')
        .select('*')
        .eq('teacher_id', rootTeacherId!);

      if (catErr) throw catErr;

      const advancedCategory = (categories ?? []).find(
        (c) => c.name === ADVANCED_CATEGORY_NAME,
      );

      // Build a record for every skill — score=0 for never-practiced ones.
      // This ensures coverage is computed against the full skill set.
      const ssMap = new Map((studentSkills ?? []).map((ss) => [ss.skill_id, ss]));

      const joined: StudentSkillWithCategory[] = (skills ?? []).map((s) => {
        const ss = ssMap.get(s.id);
        return {
          id: ss?.id ?? `virtual-${s.id}`,
          student_id: studentId!,
          skill_id: s.id,
          current_score: ss?.current_score ?? 0,
          times_practiced: ss?.times_practiced ?? 0,
          last_practiced_date: ss?.last_practiced_date ?? null,
          last_note: ss?.last_note ?? null,
          updated_at: ss?.updated_at ?? new Date().toISOString(),
          skill: { id: s.id, category_id: s.category_id, name: s.name },
        };
      });

      return calculateReadiness(joined, advancedCategory?.id);
    },
  });
}
