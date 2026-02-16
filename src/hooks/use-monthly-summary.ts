import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const TEACHER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export function useMonthlySummary() {
  return useQuery({
    queryKey: ['monthly-summary'],
    queryFn: async () => {
      const now = new Date();
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('id, amount, status, payment_status, date')
        .eq('teacher_id', TEACHER_ID)
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

      return {
        totalLessons,
        completedLessons,
        totalIncome,
        paidIncome,
        debtAmount,
        monthLabel: format(now, 'MMMM yyyy'),
      };
    },
  });
}
