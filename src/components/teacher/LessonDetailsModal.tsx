import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import { Phone, MessageCircle, User, Play, Edit, XCircle, ClipboardList, Star, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { LessonPlanModal } from '@/components/teacher/LessonPlanModal';
import { EditLessonSkillsModal } from '@/components/teacher/EditLessonSkillsModal';
import { canStartLesson } from '@/lib/utils';
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
  const queryClient = useQueryClient();

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  const saveNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      if (!lesson) return;
      // Preserve test prefix when saving notes
      let finalNotes = notes;
      if (lesson.notes?.startsWith('[טסט פנימי]')) finalNotes = `[טסט פנימי] ${notes}`.trim();
      else if (lesson.notes?.startsWith('[טסט חיצוני]')) finalNotes = `[טסט חיצוני] ${notes}`.trim();
      const { error } = await supabase.from('lessons').update({ notes: finalNotes || null }).eq('id', lesson.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['today-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('ההערות עודכנו');
      setEditingNotes(false);
    },
    onError: () => toast.error('שגיאה בשמירת ההערות'),
  });

  if (!lesson) return null;

  const isCancelled = lesson.status === 'cancelled';
  const isCompleted = lesson.status === 'completed';
  const isScheduled = lesson.status === 'scheduled';
  const isInProgress = lesson.status === 'in_progress';
  const isTestLesson = lesson.notes?.startsWith('[טסט פנימי]') || lesson.notes?.startsWith('[טסט חיצוני]');
  const testTypeLabel = lesson.notes?.startsWith('[טסט פנימי]') ? 'טסט פנימי'
    : lesson.notes?.startsWith('[טסט חיצוני]') ? 'טסט חיצוני' : null;

  let userNotes = lesson.notes ?? '';
  if (userNotes.startsWith('[טסט פנימי]')) userNotes = userNotes.slice('[טסט פנימי]'.length).trim();
  else if (userNotes.startsWith('[טסט חיצוני]')) userNotes = userNotes.slice('[טסט חיצוני]'.length).trim();

  const startNoteEdit = () => {
    setNotesValue(userNotes);
    setEditingNotes(true);
  };

  return (
    <>
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
              <p><span className="text-muted-foreground">סטטוס:</span> {isCancelled ? 'בוטל' : isCompleted ? 'הושלם' : isInProgress ? 'בתהליך' : 'מתוזמן'}</p>
              {testTypeLabel && <p><span className="text-muted-foreground">סוג:</span> {testTypeLabel}</p>}

              {/* Notes display / edit */}
              {isCompleted ? (
                editingNotes ? (
                  <div className="space-y-2 pt-1">
                    <Textarea
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      placeholder="הערות..."
                      rows={2}
                      dir="rtl"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="flex-1" onClick={() => setEditingNotes(false)}>ביטול</Button>
                      <Button size="sm" className="flex-1 gap-1" onClick={() => saveNotesMutation.mutate(notesValue)} disabled={saveNotesMutation.isPending}>
                        <Save className="h-3.5 w-3.5" />
                        {saveNotesMutation.isPending ? 'שומר…' : 'שמור'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2 pt-1">
                    <p className="text-muted-foreground text-xs flex-1">
                      {userNotes ? userNotes : <span className="italic">אין הערות</span>}
                    </p>
                    <button onClick={startNoteEdit} className="text-xs text-primary hover:underline shrink-0">ערוך</button>
                  </div>
                )
              ) : (
                userNotes ? <p><span className="text-muted-foreground">הערות:</span> {userNotes}</p> : null
              )}
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
            <div className="flex gap-2 pt-2 border-t border-border/50 flex-wrap">
              {/* Completed lesson: edit skills */}
              {isCompleted && !isTestLesson && (
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowSkillsModal(true)}>
                  <Star className="h-4 w-4 ms-1" /> ציוני מיומנויות
                </Button>
              )}

              {/* Scheduled / in-progress: plan skills */}
              {(isScheduled || isInProgress) && !isTestLesson && (
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowPlanModal(true)}>
                  <ClipboardList className="h-4 w-4 ms-1" /> תכנן מיומנויות
                </Button>
              )}

              {/* Cancel + Edit (non-completed, non-cancelled) */}
              {!isCancelled && !isCompleted && (
                <>
                  <Button variant="destructive" size="sm" className="flex-1" onClick={() => { onOpenChange(false); onCancel(lesson); }}>
                    <XCircle className="h-4 w-4 ms-1" /> בטל שיעור
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { onOpenChange(false); onEdit(lesson); }}>
                    <Edit className="h-4 w-4 ms-1" /> ערוך
                  </Button>
                </>
              )}

              {/* Start lesson (only when time has come) */}
              {isScheduled && canStartLesson(lesson.date, lesson.time_start) && (
                <Button size="sm" className="flex-1" onClick={() => { onOpenChange(false); navigate(`/teacher/lesson/${lesson.id}`); }}>
                  <Play className="h-4 w-4 ms-1" /> התחל
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LessonPlanModal
        lesson={lesson}
        open={showPlanModal}
        onOpenChange={setShowPlanModal}
      />

      <EditLessonSkillsModal
        lesson={lesson}
        open={showSkillsModal}
        onOpenChange={setShowSkillsModal}
      />
    </>
  );
}
