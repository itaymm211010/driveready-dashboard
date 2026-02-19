import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { CalendarLesson } from '@/hooks/use-calendar-lessons';

const REASONS = [
  { value: 'student_cancelled', label: 'התלמיד ביטל' },
  { value: 'teacher_unavailable', label: 'המורה לא זמין' },
  { value: 'weather', label: 'מזג אוויר' },
  { value: 'other', label: 'אחר' },
];

interface CancelLessonModalProps {
  lesson: CalendarLesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelLessonModal({ lesson, open, onOpenChange }: CancelLessonModalProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('student_cancelled');

  const mutation = useMutation({
    mutationFn: async () => {
      if (!lesson) return;
      const { error } = await supabase
        .from('lessons')
        .update({
          status: 'cancelled',
          // Preserve test type prefix, append cancel reason
          notes: (() => {
            const existing = lesson!.notes ?? '';
            const prefix = existing.startsWith('[טסט פנימי]') ? '[טסט פנימי]'
              : existing.startsWith('[טסט חיצוני]') ? '[טסט חיצוני]'
              : null;
            return prefix ? `${prefix} ${reason}` : reason;
          })(),
        })
        .eq('id', lesson.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['today-lessons'] });
      toast.success('השיעור בוטל');
      onOpenChange(false);
    },
    onError: () => toast.error('שגיאה בביטול השיעור'),
  });

  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ביטול שיעור</DialogTitle>
          <DialogDescription>
            {lesson.student.name} • {format(parseISO(lesson.date), 'd MMMM', { locale: he })} • {lesson.time_start}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Label>סיבת ביטול</Label>
          <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
            {REASONS.map(r => (
              <div key={r.value} className="flex items-center gap-2">
                <RadioGroupItem value={r.value} id={r.value} />
                <Label htmlFor={r.value} className="cursor-pointer">{r.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>חזור</Button>
          <Button variant="destructive" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'מבטל…' : 'אשר ביטול'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
