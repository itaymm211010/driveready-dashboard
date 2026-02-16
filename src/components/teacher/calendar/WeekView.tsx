import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { CalendarLessonCard } from './CalendarLessonCard';
import type { CalendarLesson } from '@/hooks/use-calendar-lessons';

interface WeekViewProps {
  date: Date;
  lessons: CalendarLesson[];
  onLessonClick: (lesson: CalendarLesson) => void;
  onEmptySlotClick: (date: Date, time: string) => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6);

export function WeekView({ date, lessons, onLessonClick, onEmptySlotClick }: WeekViewProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  // RTL: Days ordered right-to-left (Sunday on the right = first in array, rendered from right)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  // Group lessons by date+hour
  const grid: Record<string, CalendarLesson[]> = {};
  for (const l of lessons) {
    const h = parseInt(l.time_start.split(':')[0], 10);
    const key = `${l.date}-${h}`;
    if (!grid[key]) grid[key] = [];
    grid[key].push(l);
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="min-w-[700px]">
        {/* Header - RTL: time column on the right, days flow right-to-left */}
        <div className="grid grid-cols-[repeat(7,1fr)_40px] gap-px mb-1">
          {days.map((d) => (
            <div
              key={d.toISOString()}
              className={`text-center text-[10px] font-medium py-1.5 rounded-lg ${isSameDay(d, today) ? 'bg-primary/15 text-primary font-bold' : 'text-muted-foreground'}`}
            >
              <div>{format(d, 'EEE', { locale: he })}</div>
              <div className="text-sm font-heading">{format(d, 'd')}</div>
            </div>
          ))}
          <div />
        </div>

        {/* Grid */}
        <div className="space-y-px">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-[repeat(7,1fr)_40px] gap-px min-h-[48px]">
              {days.map((d) => {
                const dateStr = format(d, 'yyyy-MM-dd');
                const key = `${dateStr}-${hour}`;
                const cellLessons = grid[key] ?? [];
                return (
                  <div
                    key={key}
                    className="border border-border/20 rounded p-0.5 min-h-[44px] cursor-pointer hover:bg-primary/5 transition-smooth"
                    onClick={() => cellLessons.length === 0 && onEmptySlotClick(d, `${String(hour).padStart(2, '0')}:00`)}
                  >
                    {cellLessons.map((l) => (
                      <CalendarLessonCard key={l.id} lesson={l} compact onClick={() => onLessonClick(l)} />
                    ))}
                  </div>
                );
              })}
              <span className="text-[9px] text-muted-foreground pt-1 text-center" dir="ltr">{`${String(hour).padStart(2, '0')}:00`}</span>
            </div>
          ))}
        </div>

        {/* Summary footer */}
        <div className="flex gap-4 justify-center mt-3 text-xs text-muted-foreground">
          <span>שיעורים: {lessons.filter(l => l.status !== 'cancelled').length}</span>
          <span>₪{lessons.filter(l => l.status !== 'cancelled').reduce((s, l) => s + Number(l.amount), 0).toLocaleString()}</span>
          <span className="text-destructive">{lessons.filter(l => l.status === 'cancelled').length} ביטולים</span>
        </div>
      </div>
    </div>
  );
}
