import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Phone, MessageCircle, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { CalendarLesson } from '@/hooks/use-calendar-lessons';
import { cn } from '@/lib/utils';

interface DayViewProps {
  date: Date;
  lessons: CalendarLesson[];
  onLessonClick: (lesson: CalendarLesson) => void;
  onEmptySlotClick: (time: string) => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 06:00-20:00

function getStatusColor(lesson: CalendarLesson) {
  if (lesson.status === 'cancelled') return 'border-muted-foreground/30 bg-muted/40 opacity-60';
  if (lesson.status === 'in_progress') return 'border-warning/50 bg-warning/10';
  if (lesson.payment_status === 'paid') return 'border-success/50 bg-success/10';
  if (lesson.student.balance < 0) return 'border-destructive/50 bg-destructive/10';
  return 'border-primary/40 bg-primary/8';
}

export function DayView({ date, lessons, onLessonClick, onEmptySlotClick }: DayViewProps) {
  const navigate = useNavigate();
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayLessons = lessons.filter(l => l.date === dateStr);

  // Map lessons to their hour slots
  const lessonsByHour: Record<number, CalendarLesson[]> = {};
  for (const l of dayLessons) {
    const h = parseInt(l.time_start.split(':')[0], 10);
    if (!lessonsByHour[h]) lessonsByHour[h] = [];
    lessonsByHour[h].push(l);
  }

  return (
    <div className="space-y-1">
      <p className="text-center text-sm font-heading font-semibold text-muted-foreground mb-3">
        {format(date, 'EEEE, d MMMM', { locale: he })}
      </p>
      {HOURS.map((hour) => {
        const hourLessons = lessonsByHour[hour] ?? [];
        const timeStr = `${String(hour).padStart(2, '0')}:00`;
        return (
          <div key={hour} className="flex flex-row-reverse gap-2 min-h-[56px]">
            <span className="text-[10px] text-muted-foreground w-10 pt-1 text-left shrink-0" dir="ltr">
              {timeStr}
            </span>
            <div className="flex-1 border-t border-border/30">
              {hourLessons.length > 0 ? (
                hourLessons.map((lesson) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      'rounded-xl border p-3 mb-1 cursor-pointer transition-smooth hover:scale-[1.01]',
                      getStatusColor(lesson)
                    )}
                    onClick={() => onLessonClick(lesson)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-sm truncate">
                          {lesson.student.name}
                          {lesson.notes?.startsWith('[טסט פנימי]') && <span className="text-blue-600 font-normal text-xs"> · טסט פנימי</span>}
                          {lesson.notes?.startsWith('[טסט חיצוני]') && <span className="text-purple-600 font-normal text-xs"> · טסט חיצוני</span>}
                        </p>
                        {lesson.taught_by_teacher_name && (
                          <p className="text-[10px] text-amber-600 font-medium">מחליף: {lesson.taught_by_teacher_name}</p>
                        )}
                        <p className="text-xs text-muted-foreground" dir="ltr">{lesson.time_start} - {lesson.time_end}</p>
                        <p className="text-xs font-medium mt-0.5">₪{Number(lesson.amount).toLocaleString()}</p>
                        {lesson.student.balance < 0 && (
                          <p className="text-[10px] text-destructive">חוב: ₪{Math.abs(lesson.student.balance)}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0 me-2">
                        {lesson.student.phone && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={(e) => { e.stopPropagation(); window.open(`tel:${lesson.student.phone}`); }}
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lesson.student.phone?.replace(/\D/g, '')}`); }}
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        {lesson.status === 'scheduled' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-primary"
                            onClick={(e) => { e.stopPropagation(); navigate(`/teacher/lesson/${lesson.id}`); }}
                          >
                            <Play className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <button
                  onClick={() => onEmptySlotClick(timeStr)}
                  className="w-full h-10 border border-dashed border-border/40 rounded-lg text-[10px] text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-smooth"
                >
                  + הוסף שיעור
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
