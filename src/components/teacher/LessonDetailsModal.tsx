import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import { Phone, MessageCircle, User, Play, Edit, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { CalendarLesson } from '@/hooks/use-calendar-lessons';

interface LessonDetailsModalProps {
  lesson: CalendarLesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (lesson: CalendarLesson) => void;
  onCancel: (lesson: CalendarLesson) => void;
}

export function LessonDetailsModal({ lesson, open, onOpenChange, onEdit, onCancel }: LessonDetailsModalProps) {
  const navigate = useNavigate();
  if (!lesson) return null;

  const isCancelled = lesson.status === 'cancelled';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>פרטי שיעור</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student info */}
          <div className="glass rounded-xl p-3 space-y-1">
            <p className="font-heading font-bold text-lg">{lesson.student.name}</p>
            {lesson.student.phone && (
              <p className="text-sm text-muted-foreground" dir="ltr">{lesson.student.phone}</p>
            )}
            <div className="flex gap-2 text-xs">
              <span>יתרה: <span className={lesson.student.balance < 0 ? 'text-destructive font-bold' : 'text-success'}>₪{lesson.student.balance}</span></span>
            </div>
          </div>

          {/* Lesson info */}
          <div className="glass rounded-xl p-3 space-y-1 text-sm">
            <p><span className="text-muted-foreground">תאריך:</span> {format(parseISO(lesson.date), 'EEEE, d MMMM yyyy', { locale: he })}</p>
            <p><span className="text-muted-foreground">שעה:</span> <span dir="ltr">{lesson.time_start} - {lesson.time_end}</span></p>
            <p><span className="text-muted-foreground">סכום:</span> ₪{Number(lesson.amount).toLocaleString()}</p>
            <p><span className="text-muted-foreground">סטטוס:</span> {lesson.status === 'cancelled' ? 'בוטל' : lesson.status === 'completed' ? 'הושלם' : lesson.status === 'in_progress' ? 'בתהליך' : 'מתוזמן'}</p>
            {lesson.notes && <p><span className="text-muted-foreground">הערות:</span> {lesson.notes}</p>}
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 flex-wrap">
            {lesson.student.phone && (
              <>
                <Button variant="outline" size="sm" onClick={() => window.open(`tel:${lesson.student.phone}`)}>
                  <Phone className="h-4 w-4 ms-1" /> התקשר
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(`https://wa.me/${lesson.student.phone?.replace(/\D/g, '')}`)}>
                  <MessageCircle className="h-4 w-4 ms-1" /> WhatsApp
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => { onOpenChange(false); navigate(`/teacher/student/${lesson.student_id}`); }}>
              <User className="h-4 w-4 ms-1" /> פרופיל
            </Button>
          </div>

          {/* Bottom actions */}
          {!isCancelled && (
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <Button variant="destructive" size="sm" className="flex-1" onClick={() => { onOpenChange(false); onCancel(lesson); }}>
                <XCircle className="h-4 w-4 ms-1" /> בטל שיעור
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { onOpenChange(false); onEdit(lesson); }}>
                <Edit className="h-4 w-4 ms-1" /> ערוך
              </Button>
              {lesson.status === 'scheduled' && (
                <Button size="sm" className="flex-1" onClick={() => { onOpenChange(false); navigate(`/teacher/lesson/${lesson.id}`); }}>
                  <Play className="h-4 w-4 ms-1" /> התחל
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
