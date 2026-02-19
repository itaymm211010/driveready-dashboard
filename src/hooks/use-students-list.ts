import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export function useStudentsList() {
  const { rootTeacherId } = useAuth();

  return useQuery({
    queryKey: ['students-list', rootTeacherId],
    enabled: !!rootTeacherId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('teacher_id', rootTeacherId!)
        .order('name');

      if (error) throw error;
      return data ?? [];
    },
  });
}
