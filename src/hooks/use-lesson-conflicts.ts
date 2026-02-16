import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useLessonConflicts(
  date: string | null,
  timeStart: string | null,
  timeEnd: string | null,
  excludeLessonId?: string
) {
  return useQuery({
    queryKey: ['lesson-conflicts', date, timeStart, timeEnd, excludeLessonId],
    enabled: !!date && !!timeStart && !!timeEnd,
    queryFn: async () => {
      if (!date || !timeStart || !timeEnd) return [];

      let query = supabase
        .from('lessons')
        .select('id, time_start, time_end, students(name)')
        .eq('date', date)
        .neq('status', 'cancelled')
        .lt('time_start', timeEnd)
        .gt('time_end', timeStart);

      if (excludeLessonId) {
        query = query.neq('id', excludeLessonId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((c: any) => ({
        id: c.id,
        time_start: c.time_start,
        time_end: c.time_end,
        studentName: c.students?.name ?? 'Unknown',
      }));
    },
  });
}
