import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStudentModal({ open, onOpenChange }: AddStudentModalProps) {
  const { rootTeacherId } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [lessonPrice, setLessonPrice] = useState('');
  const [internalTestPrice, setInternalTestPrice] = useState('');
  const [externalTestPrice, setExternalTestPrice] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('students').insert({
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        id_number: idNumber.trim() || null,
        lesson_price: Number(lessonPrice) || 0,
        internal_test_price: Number(internalTestPrice) || 0,
        external_test_price: Number(externalTestPrice) || 0,
        teacher_id: rootTeacherId!,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students-list'] });
      toast.success('תלמיד נוסף בהצלחה!');
      resetAndClose();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const resetAndClose = () => {
    setName('');
    setPhone('');
    setEmail('');
    setIdNumber('');
    setLessonPrice('');
    setInternalTestPrice('');
    setExternalTestPrice('');
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>הוספת תלמיד חדש</DialogTitle>
          <DialogDescription>הזן את פרטי התלמיד למטה.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="student-name">שם *</Label>
            <Input
              id="student-name"
              placeholder="שם מלא"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-phone">טלפון</Label>
            <Input
              id="student-phone"
              placeholder="מספר טלפון"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={20}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-email">אימייל</Label>
            <Input
              id="student-email"
              placeholder="כתובת אימייל"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-id-number">ת.ז</Label>
            <Input
              id="student-id-number"
              placeholder="מספר תעודת זהות"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              maxLength={20}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-lesson-price">מחיר שיעור (₪)</Label>
            <Input
              id="student-lesson-price"
              placeholder="0"
              type="number"
              min={0}
              value={lessonPrice}
              onChange={(e) => setLessonPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-internal-test-price">מחיר טסט פנימי (₪)</Label>
            <Input
              id="student-internal-test-price"
              placeholder="0"
              type="number"
              min={0}
              value={internalTestPrice}
              onChange={(e) => setInternalTestPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student-external-test-price">מחיר טסט חיצוני (₪)</Label>
            <Input
              id="student-external-test-price"
              placeholder="0"
              type="number"
              min={0}
              value={externalTestPrice}
              onChange={(e) => setExternalTestPrice(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={resetAndClose}>
              ביטול
            </Button>
            <Button type="submit" disabled={!name.trim() || mutation.isPending}>
              {mutation.isPending ? 'מוסיף…' : 'הוסף תלמיד'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
