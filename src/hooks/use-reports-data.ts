import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const TEACHER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export function useReportsData(currentMonth: Date) {
  return useQuery({
    queryKey: ['reports-data', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      // Fetch last 6 months of lessons for trend analysis
      const sixMonthsAgo = format(startOfMonth(subMonths(currentMonth, 5)), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('id, amount, status, payment_status, date, student_id, actual_duration_minutes, scheduled_duration_minutes, notes')
        .eq('teacher_id', TEACHER_ID)
        .gte('date', sixMonthsAgo)
        .lte('date', monthEnd)
        .order('date', { ascending: true });

      if (error) throw error;

      const { data: students } = await supabase
        .from('students')
        .select('id, name, total_lessons, readiness_percentage, balance, lesson_price')
        .eq('teacher_id', TEACHER_ID)
        .order('name');

      const all = lessons ?? [];

      const getLessonType = (notes: string | null): 'regular' | 'internal_test' | 'external_test' => {
        if (notes?.startsWith('[טסט פנימי]')) return 'internal_test';
        if (notes?.startsWith('[טסט חיצוני]')) return 'external_test';
        return 'regular';
      };

      // Monthly trend data (last 6 months)
      const monthlyTrend: Array<{
        month: string;
        income: number;
        lessons: number;
        paid: number;
        debt: number;
        cancelled: number;
        internalTests: number;
        externalTests: number;
      }> = [];

      for (let i = 5; i >= 0; i--) {
        const m = subMonths(currentMonth, i);
        const mStart = startOfMonth(m);
        const mEnd = endOfMonth(m);
        const mLabel = format(m, 'MMM yy');
        const mLessons = all.filter((l) => {
          const d = new Date(l.date);
          return d >= mStart && d <= mEnd;
        });
        const completed = mLessons.filter((l) => l.status === 'completed');
        const cancelled = mLessons.filter((l) => l.status === 'cancelled').length;

        monthlyTrend.push({
          month: mLabel,
          income: completed.reduce((s, l) => s + Number(l.amount), 0),
          lessons: completed.length,
          paid: completed.filter((l) => l.payment_status === 'paid').reduce((s, l) => s + Number(l.amount), 0),
          debt: completed.filter((l) => l.payment_status === 'debt').reduce((s, l) => s + Number(l.amount), 0),
          cancelled,
          internalTests: completed.filter((l) => getLessonType(l.notes) === 'internal_test').length,
          externalTests: completed.filter((l) => getLessonType(l.notes) === 'external_test').length,
        });
      }

      // Current month breakdown
      const cmStart = startOfMonth(currentMonth);
      const cmEnd = endOfMonth(currentMonth);
      const currentMonthLessons = all.filter((l) => {
        const d = new Date(l.date);
        return d >= cmStart && d <= cmEnd;
      });
      const cmCompleted = currentMonthLessons.filter((l) => l.status === 'completed');
      const cmCancelled = currentMonthLessons.filter((l) => l.status === 'cancelled');
      const cmScheduled = currentMonthLessons.filter((l) => l.status === 'scheduled' || l.status === 'in_progress');

      const cmRegular = cmCompleted.filter((l) => getLessonType(l.notes) === 'regular');
      const cmInternal = cmCompleted.filter((l) => getLessonType(l.notes) === 'internal_test');
      const cmExternal = cmCompleted.filter((l) => getLessonType(l.notes) === 'external_test');

      const currentMonthStats = {
        totalLessons: currentMonthLessons.length,
        completed: cmCompleted.length,
        cancelled: cmCancelled.length,
        scheduled: cmScheduled.length,
        totalIncome: cmCompleted.reduce((s, l) => s + Number(l.amount), 0),
        paidIncome: cmCompleted.filter((l) => l.payment_status === 'paid').reduce((s, l) => s + Number(l.amount), 0),
        debtAmount: cmCompleted.filter((l) => l.payment_status === 'debt').reduce((s, l) => s + Number(l.amount), 0),
        pendingAmount: cmCompleted.filter((l) => l.payment_status === 'pending').reduce((s, l) => s + Number(l.amount), 0),
        regularLessons: cmRegular.length,
        regularIncome: cmRegular.reduce((s, l) => s + Number(l.amount), 0),
        internalTests: cmInternal.length,
        internalTestIncome: cmInternal.reduce((s, l) => s + Number(l.amount), 0),
        externalTests: cmExternal.length,
        externalTestIncome: cmExternal.reduce((s, l) => s + Number(l.amount), 0),
      };

      // Per-student breakdown for current month
      const studentMap = new Map((students ?? []).map((s) => [s.id, s]));
      const studentBreakdown = new Map<string, { name: string; lessons: number; income: number; paid: number; debt: number }>();

      for (const l of cmCompleted) {
        const st = studentMap.get(l.student_id);
        const name = st?.name ?? 'לא ידוע';
        const existing = studentBreakdown.get(l.student_id) ?? { name, lessons: 0, income: 0, paid: 0, debt: 0 };
        existing.lessons += 1;
        existing.income += Number(l.amount);
        if (l.payment_status === 'paid') existing.paid += Number(l.amount);
        if (l.payment_status === 'debt') existing.debt += Number(l.amount);
        studentBreakdown.set(l.student_id, existing);
      }

      // Payment status distribution for pie chart
      const paymentDistribution = [
        { name: 'שולם', value: currentMonthStats.paidIncome, color: 'hsl(var(--success))' },
        { name: 'חוב', value: currentMonthStats.debtAmount, color: 'hsl(var(--destructive))' },
        { name: 'ממתין', value: currentMonthStats.pendingAmount, color: 'hsl(var(--warning))' },
      ].filter((d) => d.value > 0);

      return {
        monthlyTrend,
        currentMonthStats,
        paymentDistribution,
        studentBreakdown: Array.from(studentBreakdown.values()).sort((a, b) => b.income - a.income),
        students: students ?? [],
        monthLabel: format(currentMonth, 'MMMM yyyy'),
      };
    },
  });
}
