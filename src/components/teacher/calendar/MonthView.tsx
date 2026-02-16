import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CalendarLesson } from '@/hooks/use-calendar-lessons';

interface MonthViewProps {
  date: Date;
  lessons: CalendarLesson[];
  onDayClick: (date: Date) => void;
}

export function MonthView({ date, lessons, onDayClick }: MonthViewProps) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Group by date
  const byDate: Record<string, CalendarLesson[]> = {};
  for (const l of lessons) {
    if (!byDate[l.date]) byDate[l.date] = [];
    byDate[l.date].push(l);
  }

  const weeks: Date[][] = [];
  let current = calStart;
  while (current <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(current);
      current = addDays(current, 1);
    }
    weeks.push(week);
  }

  // RTL Hebrew day names: Sunday (א׳) first on the right
  const dayNames = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

  // Month stats
  const active = lessons.filter(l => l.status !== 'cancelled');
  const totalRevenue = active.reduce((s, l) => s + Number(l.amount), 0);
  const cancelledCount = lessons.filter(l => l.status === 'cancelled').length;

  return (
    <div className="space-y-3">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1">
          {week.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayLessons = byDate[dateStr] ?? [];
            const activeLessons = dayLessons.filter(l => l.status !== 'cancelled');
            const hasDebt = dayLessons.some(l => l.student.balance < 0 && l.status !== 'cancelled');
            const hasCancelled = dayLessons.some(l => l.status === 'cancelled');
            const inMonth = isSameMonth(day, date);

            return (
              <button
                key={dateStr}
                onClick={() => onDayClick(day)}
                className={cn(
                  'relative aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-smooth text-xs',
                  !inMonth && 'opacity-30',
                  isToday(day) && 'bg-primary/15 font-bold ring-1 ring-primary/30',
                  inMonth && !isToday(day) && 'hover:bg-muted/50'
                )}
              >
                <span className={cn('font-heading', isToday(day) && 'text-primary')}>
                  {format(day, 'd')}
                </span>
                {activeLessons.length > 0 && (
                  <span className="text-[9px] bg-primary/20 text-primary rounded-full px-1.5 font-medium">
                    {activeLessons.length}
                  </span>
                )}
                <div className="flex gap-0.5 absolute bottom-0.5">
                  {hasDebt && <span className="h-1 w-1 rounded-full bg-destructive" />}
                  {hasCancelled && <span className="h-1 w-1 rounded-full bg-warning" />}
                </div>
              </button>
            );
          })}
        </div>
      ))}

      {/* Month summary */}
      <div className="glass rounded-xl p-3 flex justify-around text-center text-xs">
        <div>
          <p className="text-muted-foreground">שיעורים</p>
          <p className="font-heading font-bold text-lg">{active.length}</p>
        </div>
        <div>
          <p className="text-muted-foreground">הכנסות</p>
          <p className="font-heading font-bold text-lg">₪{totalRevenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-muted-foreground">ביטולים</p>
          <p className="font-heading font-bold text-lg text-destructive">{cancelledCount}</p>
        </div>
      </div>
    </div>
  );
}
