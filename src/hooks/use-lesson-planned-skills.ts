import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useLessonPlannedSkills(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lesson-planned-skills', lessonId],
    enabled: !!lessonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_planned_skills')
        .select('skill_id, added_before_lesson')
        .eq('lesson_id', lessonId!);

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddPlannedSkills() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, skillIds, addedBeforeLesson }: {
      lessonId: string;
      skillIds: string[];
      addedBeforeLesson: boolean;
    }) => {
      if (skillIds.length === 0) return;

      const rows = skillIds.map(skillId => ({
        lesson_id: lessonId,
        skill_id: skillId,
        added_before_lesson: addedBeforeLesson,
      }));

      const { error } = await supabase
        .from('lesson_planned_skills')
        .upsert(rows, { onConflict: 'lesson_id,skill_id' });

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-planned-skills', vars.lessonId] });
    },
  });
}

export function useRemovePlannedSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, skillId }: { lessonId: string; skillId: string }) => {
      const { error } = await supabase
        .from('lesson_planned_skills')
        .delete()
        .eq('lesson_id', lessonId)
        .eq('skill_id', skillId);

      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-planned-skills', vars.lessonId] });
    },
  });
}
