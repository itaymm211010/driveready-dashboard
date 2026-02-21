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

interface EditStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    lesson_price: number;
    internal_test_price?: number;
    external_test_price?: number;
    id_number?: string | null;
    pickup_address?: string | null;
    school_address?: string | null;
    work_address?: string | null;
  };
}

export function EditStudentModal({ open, onOpenChange, student }: EditStudentModalProps) {
  const [name, setName] = useState(student.name);
  const [phone, setPhone] = useState(student.phone ?? '');
  const [email, setEmail] = useState(student.email ?? '');
  const [idNumber, setIdNumber] = useState(student.id_number ?? '');
  const [lessonPrice, setLessonPrice] = useState(String(student.lesson_price ?? 0));
  const [internalTestPrice, setInternalTestPrice] = useState(String(student.internal_test_price ?? 0));
  const [externalTestPrice, setExternalTestPrice] = useState(String(student.external_test_price ?? 0));
  const [pickupAddress, setPickupAddress] = useState(student.pickup_address ?? '');
  const [schoolAddress, setSchoolAddress] = useState(student.school_address ?? '');
  const [workAddress, setWorkAddress] = useState(student.work_address ?? '');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('students')
        .update({
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          id_number: idNumber.trim() || null,
          lesson_price: Number(lessonPrice) || 0,
          internal_test_price: Number(internalTestPrice) || 0,
          external_test_price: Number(externalTestPrice) || 0,
          pickup_address: pickupAddress.trim() || null,
          school_address: schoolAddress.trim() || null,
          work_address: workAddress.trim() || null,
        } as any)
        .eq('id', student.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile', student.id] });
      queryClient.invalidateQueries({ queryKey: ['students-list'] });
      toast.success('תלמיד עודכן בהצלחה!');
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>עריכת תלמיד</DialogTitle>
          <DialogDescription>עדכן את פרטי התלמיד.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name">שם *</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">טלפון</Label>
            <Input id="edit-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">אימייל</Label>
            <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-id-number">ת.ז</Label>
            <Input id="edit-id-number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} maxLength={20} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-lesson-price">מחיר שיעור (₪)</Label>
            <Input id="edit-lesson-price" type="number" min={0} value={lessonPrice} onChange={(e) => setLessonPrice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-internal-test-price">מחיר טסט פנימי (₪)</Label>
            <Input id="edit-internal-test-price" type="number" min={0} value={internalTestPrice} onChange={(e) => setInternalTestPrice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-external-test-price">מחיר טסט חיצוני (₪)</Label>
            <Input id="edit-external-test-price" type="number" min={0} value={externalTestPrice} onChange={(e) => setExternalTestPrice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-pickup-address">🏠 כתובת מגורים</Label>
            <Input id="edit-pickup-address" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} placeholder="רחוב, עיר..." maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-school-address">🏫 כתובת בית ספר</Label>
            <Input id="edit-school-address" value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)} placeholder="רחוב, עיר..." maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-work-address">💼 כתובת מקום עבודה</Label>
            <Input id="edit-work-address" value={workAddress} onChange={(e) => setWorkAddress(e.target.value)} placeholder="רחוב, עיר..." maxLength={200} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
            <Button type="submit" disabled={!name.trim() || mutation.isPending}>
              {mutation.isPending ? 'שומר…' : 'שמור'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
