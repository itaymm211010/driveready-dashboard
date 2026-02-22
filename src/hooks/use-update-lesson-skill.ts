import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UpdateLessonSkillParams {
  lessonId: string;
  studentId: string;
  skillId: string;
  newScore?: number;
  newNote?: string;
}

/**
 * Updates a skill's score and/or note for a specific completed lesson.
 * - Updates skill_history row for this lesson+skill
 * - If this is the most recent lesson for the skill, also updates student_skills
 */
export function useUpdateLessonSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, studentId, skillId, newScore, newNote }: UpdateLessonSkillParams) => {
      // 1. Find the student_skill record
      const { data: studentSkill, error: ssErr } = await supabase
        .from('student_skills')
        .select('id, last_practiced_date, current_score, last_note')
        .eq('student_id', studentId)
        .eq('skill_id', skillId)
        .maybeSingle();

      if (ssErr) throw ssErr;
      if (!studentSkill) return;

      // 2. Find the skill_history entry for this lesson
      const { data: historyRow, error: histErr } = await supabase
        .from('skill_history')
        .select('id, lesson_date')
        .eq('lesson_id', lessonId)
        .eq('student_skill_id', studentSkill.id)
        .maybeSingle();

      if (histErr) throw histErr;

      // 3. Update skill_history
      if (historyRow) {
        const historyUpdate: Record<string, unknown> = {};
        if (newScore !== undefined) historyUpdate.score = newScore;
        if (newNote !== undefined) historyUpdate.teacher_note = newNote;

        if (Object.keys(historyUpdate).length > 0) {
          const { error: updateHistErr } = await supabase
            .from('skill_history')
            .update(historyUpdate)
            .eq('id', historyRow.id);

          if (updateHistErr) throw updateHistErr;
        }

        // 4. If this is the most recent lesson for this skill, update student_skills too
        const isLatest = historyRow.lesson_date === studentSkill.last_practiced_date;
        if (isLatest) {
          const skillUpdate: Record<string, unknown> = {};
          if (newScore !== undefined) skillUpdate.current_score = newScore;
          if (newNote !== undefined) skillUpdate.last_note = newNote;

          if (Object.keys(skillUpdate).length > 0) {
            const { error: updateSkillErr } = await supabase
              .from('student_skills')
              .update(skillUpdate)
              .eq('id', studentSkill.id);

            if (updateSkillErr) throw updateSkillErr;
          }
        }
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['student-skill-tree', vars.studentId] });
      queryClient.invalidateQueries({ queryKey: ['lesson', vars.lessonId] });
    },
  });
}
