import { cn } from '@/lib/utils';
import type { CalendarLesson } from '@/hooks/use-calendar-lessons';

interface CalendarLessonCardProps {
  lesson: CalendarLesson;
  compact?: boolean;
  onClick?: () => void;
}

function getStatusColor(lesson: CalendarLesson) {
  if (lesson.status === 'cancelled') return 'bg-muted/60 border-muted-foreground/20 opacity-60';
  if (lesson.status === 'in_progress') return 'bg-warning/15 border-warning/40';
  if (lesson.payment_status === 'paid') return 'bg-success/15 border-success/40';
  if (lesson.student.balance < 0) return 'bg-destructive/15 border-destructive/40';
  return 'bg-primary/10 border-primary/30';
}

export function CalendarLessonCard({ lesson, compact, onClick }: CalendarLessonCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-right rounded-lg border p-2 transition-smooth hover:scale-[1.02] cursor-pointer',
        getStatusColor(lesson),
        compact ? 'text-[0.625rem] leading-tight' : 'text-xs'
      )}
    >
      <p className="font-semibold truncate">
        {lesson.student.name}
        {lesson.notes?.startsWith('[טסט פנימי]') && <span className="text-blue-600 font-normal"> · טסט פנימי</span>}
        {lesson.notes?.startsWith('[טסט חיצוני]') && <span className="text-purple-600 font-normal"> · טסט חיצוני</span>}
      </p>
      {lesson.taught_by_teacher_name && (
        <p className="text-amber-600 truncate">↪ {lesson.taught_by_teacher_name}</p>
      )}
      {!compact && (
        <p className="text-muted-foreground">
          {lesson.time_start} - {lesson.time_end}
        </p>
      )}
      {!compact && (
        <p className="font-medium">₪{Number(lesson.amount).toLocaleString()}</p>
      )}
    </button>
  );
}
