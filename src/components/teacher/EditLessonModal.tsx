import { useState, useEffect } from 'react';
import { format, parseISO, addMinutes, parse } from 'date-fns';
import { CalendarIcon, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TimeInput24h } from '@/components/ui/TimeInput24h';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLessonConflicts } from '@/hooks/use-lesson-conflicts';
import type { CalendarLesson } from '@/hooks/use-calendar-lessons';

const DURATION_PRESETS = [40, 80, 120, 160];

interface EditLessonModalProps {
  lesson: CalendarLesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLessonModal({ lesson, open, onOpenChange }: EditLessonModalProps) {
  const queryClient = useQueryClient();

  const [date, setDate] = useState<Date>(new Date());
  const [timeStart, setTimeStart] = useState('');
  const [duration, setDuration] = useState(60);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const [testPrefix, setTestPrefix] = useState<string | null>(null);

  useEffect(() => {
    if (lesson && open) {
      setDate(parseISO(lesson.date));
      setTimeStart(lesson.time_start);
      setAmount(String(lesson.amount));
      // Detect and strip test type prefix from notes for editing
      let userNotes = lesson.notes ?? '';
      if (userNotes.startsWith('[טסט פנימי]')) {
        setTestPrefix('[טסט פנימי]');
        userNotes = userNotes.slice('[טסט פנימי]'.length).trim();
      } else if (userNotes.startsWith('[טסט חיצוני]')) {
        setTestPrefix('[טסט חיצוני]');
        userNotes = userNotes.slice('[טסט חיצוני]'.length).trim();
      } else {
        setTestPrefix(null);
      }
      setNotes(userNotes);
      // Calculate duration from time_start and time_end
      const start = parse(lesson.time_start, 'HH:mm', new Date());
      const end = parse(lesson.time_end, 'HH:mm', new Date());
      const diff = (end.getTime() - start.getTime()) / 60000;
      setDuration(diff > 0 ? diff : 60);
    }
  }, [lesson, open]);

  const timeEnd = timeStart
    ? format(addMinutes(parse(timeStart, 'HH:mm', new Date()), duration), 'HH:mm')
    : '';

  const { data: conflicts } = useLessonConflicts(
    format(date, 'yyyy-MM-dd'),
    timeStart || null,
    timeEnd || null,
    lesson?.id
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!lesson) return;
      const { error } = await supabase
        .from('lessons')
        .update({
          date: format(date, 'yyyy-MM-dd'),
          time_start: timeStart,
          time_end: timeEnd,
          amount: Number(amount),
          notes: testPrefix
            ? [testPrefix, notes].filter(Boolean).join(' ')
            : notes || null,
        })
        .eq('id', lesson.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['today-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('השיעור עודכן בהצלחה');
      onOpenChange(false);
    },
    onError: () => toast.error('שגיאה בעדכון השיעור'),
  });

  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>עריכת שיעור</DialogTitle>
          <DialogDescription>{lesson.student.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date */}
          <div className="space-y-2">
            <Label>תאריך</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[100]" align="start">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time + Duration */}
          <div className="space-y-2">
            <Label>שעת התחלה</Label>
            <TimeInput24h value={timeStart} onChange={setTimeStart} />
          </div>

          <div className="space-y-2">
            <Label>משך (דקות)</Label>
            <div className="flex gap-2 flex-wrap">
              {DURATION_PRESETS.map(d => (
                <Button key={d} variant={duration === d ? 'default' : 'outline'} size="sm" onClick={() => setDuration(d)}>
                  {d}
                </Button>
              ))}
            </div>
            {timeStart && <p className="text-xs text-muted-foreground">סיום: {timeEnd}</p>}
          </div>

          {/* Conflicts */}
          {(conflicts ?? []).length > 0 && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-2 flex items-start gap-2 text-xs text-warning-foreground">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">התנגשות:</p>
                {conflicts!.map(c => <p key={c.id}>{c.studentName} ({c.time_start}-{c.time_end})</p>)}
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label>סכום (₪)</Label>
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>הערות</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="הערות..." rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => mutation.mutate()} disabled={!timeStart || !amount || mutation.isPending} className="w-full">
            {mutation.isPending ? 'שומר…' : 'שמור שינויים'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
