import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  calculateCategoryAverage,
  type StudentSkillWithCategory,
} from '@/lib/calculations';

const TEACHER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export interface CategoryAverage {
  categoryId: string;
  categoryName: string;
  icon: string;
  sortOrder: number;
  average: number;
}

/**
 * Fetch student skills joined with skill and category metadata, then
 * compute the average proficiency per category.
 */
export function useCategoryAverages(studentId: string | undefined) {
  return useQuery({
    queryKey: ['category-averages', studentId],
    enabled: !!studentId,
    queryFn: async (): Promise<CategoryAverage[]> => {
      const { data: studentSkills, error: ssErr } = await supabase
        .from('student_skills')
        .select('*')
        .eq('student_id', studentId!);

      if (ssErr) throw ssErr;

      const { data: skills, error: skErr } = await supabase
        .from('skills')
        .select('*')
        .eq('teacher_id', TEACHER_ID);

      if (skErr) throw skErr;

      const { data: categories, error: catErr } = await supabase
        .from('skill_categories')
        .select('*')
        .eq('teacher_id', TEACHER_ID)
        .order('sort_order');

      if (catErr) throw catErr;

      // Build joined array
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

      // Compute average per category
      return (categories ?? []).map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.name,
        icon: cat.icon,
        sortOrder: cat.sort_order,
        average: calculateCategoryAverage(joined, cat.id),
      }));
    },
  });
}
