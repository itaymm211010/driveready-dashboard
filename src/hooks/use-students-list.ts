import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const TEACHER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export function useStudentsList() {
  return useQuery({
    queryKey: ['students-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', TEACHER_ID)
        .order('name');

      if (error) throw error;
      return data ?? [];
    },
  });
}
