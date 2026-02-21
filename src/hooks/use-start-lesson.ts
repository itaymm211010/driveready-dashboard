import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StartLessonParams {
  lessonId: string;
  timeStart: string; // "HH:MM"
  timeEnd: string;   // "HH:MM"
}

function calculateScheduledMinutes(timeStart: string, timeEnd: string): number {
  const [sh, sm] = timeStart.split(':').map(Number);
  const [eh, em] = timeEnd.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export function useStartLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, timeStart, timeEnd }: StartLessonParams) => {
      const scheduledMinutes = calculateScheduledMinutes(timeStart, timeEnd);
      const now = new Date().toISOString();

      const { error: lessonErr } = await supabase
        .from('lessons')
        .update({
          status: 'in_progress',
          actual_start_time: now,
          scheduled_duration_minutes: scheduledMinutes,
        })
        .eq('id', lessonId);

      if (lessonErr) throw lessonErr;

      const { error: logErr } = await supabase
        .from('lesson_time_log')
        .insert({
          lesson_id: lessonId,
          event_type: 'started',
        });

      if (logErr) throw logErr;

      return { actualStartTime: now, scheduledMinutes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lesson'] });
    },
  });
}
