import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

export type CalendarView = 'week' | 'day' | 'month';

export interface CalendarLesson {
  id: string;
  date: string;
  time_start: string;
  time_end: string;
  amount: number;
  status: string;
  payment_status: string | null;
  notes: string | null;
  student_id: string;
  student: {
    id: string;
    name: string;
    phone: string | null;
    balance: number;
  };
}

function getDateRange(view: CalendarView, date: Date) {
  switch (view) {
    case 'week':
      return { start: startOfWeek(date, { weekStartsOn: 0 }), end: endOfWeek(date, { weekStartsOn: 0 }) };
    case 'day':
      return { start: startOfDay(date), end: endOfDay(date) };
    case 'month':
      return { start: startOfMonth(date), end: endOfMonth(date) };
  }
}

export function useCalendarLessons(view: CalendarView, date: Date) {
  const { rootTeacherId } = useAuth();
  const { start, end } = getDateRange(view, date);
  const startStr = format(start, 'yyyy-MM-dd');
  const endStr = format(end, 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['calendar-lessons', view, startStr, endStr, rootTeacherId],
    enabled: !!rootTeacherId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, date, time_start, time_end, amount, status, payment_status, notes, student_id, students(id, name, phone, balance)')
        .eq('teacher_id', rootTeacherId!)
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date')
        .order('time_start');

      if (error) throw error;

      const lessons: CalendarLesson[] = (data ?? []).map((l: any) => ({
        ...l,
        student: l.students,
      }));

      // Group by date
      const grouped: Record<string, CalendarLesson[]> = {};
      for (const lesson of lessons) {
        if (!grouped[lesson.date]) grouped[lesson.date] = [];
        grouped[lesson.date].push(lesson);
      }

      // Stats
      const active = lessons.filter(l => l.status !== 'cancelled');
      const totalLessons = active.length;
      const expectedRevenue = active.reduce((s, l) => s + Number(l.amount), 0);
      const studentsWithDebt = new Set(active.filter(l => l.student.balance < 0).map(l => l.student_id)).size;
      const cancelledCount = lessons.filter(l => l.status === 'cancelled').length;

      return { lessons, grouped, stats: { totalLessons, expectedRevenue, studentsWithDebt, cancelledCount } };
    },
  });
}
