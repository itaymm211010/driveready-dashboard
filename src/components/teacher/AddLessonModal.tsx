import { useState, useEffect } from 'react';
import { format, addMinutes, parse } from 'date-fns';
import { CalendarIcon, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentsList } from '@/hooks/use-students-list';
import { useLessonConflicts } from '@/hooks/use-lesson-conflicts';
import { useAuth } from '@/hooks/use-auth';
const DURATION_PRESETS = [40, 80, 120, 160];

interface AddLessonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedStudentId?: string;
  prefilledDate?: Date;
  prefilledTime?: string;
}

export function AddLessonModal({ open, onOpenChange, preselectedStudentId, prefilledDate, prefilledTime }: AddLessonModalProps) {
  const queryClient = useQueryClient();
  const { rootTeacherId, teacherProfile } = useAuth();
  const { data: students } = useStudentsList();

  const [studentId, setStudentId] = useState(preselectedStudentId ?? '');
  const [date, setDate] = useState<Date>(prefilledDate ?? new Date());
  const [timeStart, setTimeStart] = useState(prefilledTime ?? '');
  const [duration, setDuration] = useState(40);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [lessonType, setLessonType] = useState<'regular' | 'internal_test' | 'external_test'>('regular');

  const timeEnd = timeStart
    ? format(addMinutes(parse(timeStart, 'HH:mm', new Date()), duration), 'HH:mm')
    : '';

  const { data: conflicts } = useLessonConflicts(
    format(date, 'yyyy-MM-dd'),
    timeStart || null,
    timeEnd || null
  );

  // Auto-fill amount when student or lesson type changes
  useEffect(() => {
    const selected = (students ?? []).find((s) => s.id === studentId);
    if (!selected) return;
    const priceMap = {
      regular: selected.lesson_price,
      internal_test: (selected as any).internal_test_price ?? 0,
      external_test: (selected as any).external_test_price ?? 0,
    };
    const price = priceMap[lessonType];
    if (price != null) {
      setAmount(String(price));
    }
  }, [studentId, students, lessonType]);

  // Reset form when modal opens
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setStudentId(preselectedStudentId ?? '');
      setDate(prefilledDate ?? new Date());
      setTimeStart(prefilledTime ?? '');
      setDuration(40);
      setAmount('');
      setNotes('');
      setLessonType('regular');
    }
    onOpenChange(next);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('lessons').insert({
        student_id: studentId,
        teacher_id: rootTeacherId!,
        taught_by_teacher_id: teacherProfile?.id,
        date: format(date, 'yyyy-MM-dd'),
        time_start: timeStart,
        time_end: timeEnd,
        amount: Number(amount),
        status: 'scheduled',
        payment_status: 'pending',
        notes: lessonType !== 'regular'
          ? [lessonType === 'internal_test' ? '[טסט פנימי]' : '[טסט חיצוני]', notes].filter(Boolean).join(' ')
          : notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('שיעור נוסף בהצלחה');
      handleOpenChange(false);
    },
    onError: () => {
      toast.error('שגיאה ביצירת השיעור');
    },
  });

  const canSubmit = studentId && timeStart && timeEnd && (Number(amount) > 0 || lessonType !== 'regular');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>שיעור חדש</DialogTitle>
          <DialogDescription>הוסף שיעור חדש לתלמיד</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Student Select */}
          <div className="space-y-2">
            <Label>תלמיד</Label>
            <Select value={studentId} onValueChange={setStudentId} disabled={!!preselectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="בחר תלמיד" />
              </SelectTrigger>
              <SelectContent className="bg-background z-[100]">
                {(students ?? []).map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>תאריך</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}>
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
            <Input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} />
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

          {/* Lesson Type */}
          <div className="space-y-2">
            <Label>סוג שיעור</Label>
            <div className="flex gap-2">
              <Button type="button" variant={lessonType === 'regular' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setLessonType('regular')}>
                שיעור רגיל
              </Button>
              <Button type="button" variant={lessonType === 'internal_test' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setLessonType('internal_test')}>
                טסט פנימי
              </Button>
              <Button type="button" variant={lessonType === 'external_test' ? 'default' : 'outline'} size="sm" className="flex-1" onClick={() => setLessonType('external_test')}>
                טסט חיצוני
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>סכום (₪)</Label>
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>הערות</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="הערות..." rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => mutation.mutate()} disabled={!canSubmit || mutation.isPending} className="w-full">
            {mutation.isPending ? 'שומר…' : 'הוסף שיעור'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
