import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStudentsList } from '@/hooks/use-students-list';

const TEACHER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

interface AddLessonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedStudentId?: string;
}

export function AddLessonModal({ open, onOpenChange, preselectedStudentId }: AddLessonModalProps) {
  const queryClient = useQueryClient();
  const { data: students } = useStudentsList();

  const [studentId, setStudentId] = useState(preselectedStudentId ?? '');
  const [date, setDate] = useState<Date>(new Date());
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [amount, setAmount] = useState('');

  // Reset form when modal opens
  const handleOpenChange = (next: boolean) => {
    if (next) {
      setStudentId(preselectedStudentId ?? '');
      setDate(new Date());
      setTimeStart('');
      setTimeEnd('');
      setAmount('');
    }
    onOpenChange(next);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('lessons').insert({
        student_id: studentId,
        teacher_id: TEACHER_ID,
        date: format(date, 'yyyy-MM-dd'),
        time_start: timeStart,
        time_end: timeEnd,
        amount: Number(amount),
        status: 'scheduled',
        payment_status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-lessons'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('שיעור נוסף בהצלחה');
      handleOpenChange(false);
    },
    onError: () => {
      toast.error('שגיאה ביצירת השיעור');
    },
  });

  const canSubmit = studentId && timeStart && timeEnd && Number(amount) > 0;

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
            <Select
              value={studentId}
              onValueChange={setStudentId}
              disabled={!!preselectedStudentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר תלמיד" />
              </SelectTrigger>
              <SelectContent className="bg-background z-[100]">
                {(students ?? []).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>תאריך</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[100]" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>שעת התחלה</Label>
              <Input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>שעת סיום</Label>
              <Input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} />
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>סכום (₪)</Label>
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
            className="w-full"
          >
            {mutation.isPending ? 'שומר…' : 'הוסף שיעור'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
