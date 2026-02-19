import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export function useMonthlySummary(month: Date) {
  const { rootTeacherId } = useAuth();

  return useQuery({
    queryKey: ['monthly-summary', format(month, 'yyyy-MM'), rootTeacherId],
    enabled: !!rootTeacherId,
    queryFn: async () => {
      const monthStart = format(startOfMonth(month), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(month), 'yyyy-MM-dd');

      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('id, amount, status, payment_status, date, notes')
        .eq('teacher_id', rootTeacherId!)
        .gte('date', monthStart)
        .lte('date', monthEnd);

      if (error) throw error;

      const all = lessons ?? [];
      const completed = all.filter((l) => l.status === 'completed');
      const totalLessons = all.length;
      const completedLessons = completed.length;
      const totalIncome = completed.reduce((s, l) => s + Number(l.amount), 0);
      const paidIncome = completed
        .filter((l) => l.payment_status === 'paid')
        .reduce((s, l) => s + Number(l.amount), 0);
      const debtAmount = completed
        .filter((l) => l.payment_status === 'debt')
        .reduce((s, l) => s + Number(l.amount), 0);

      const internalTests = completed.filter((l) => l.notes?.startsWith('[טסט פנימי]')).length;
      const externalTests = completed.filter((l) => l.notes?.startsWith('[טסט חיצוני]')).length;

      return {
        totalLessons,
        completedLessons,
        totalIncome,
        paidIncome,
        debtAmount,
        internalTests,
        externalTests,
        monthLabel: format(month, 'MMMM yyyy'),
      };
    },
  });
}
