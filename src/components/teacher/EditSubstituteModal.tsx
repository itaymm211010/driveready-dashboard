import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ISRAELI_BANKS = [
  'בנק הפועלים',
  'בנק לאומי',
  'בנק דיסקונט',
  'בנק מזרחי-טפחות',
  'הבנק הבינלאומי הראשון',
  'בנק מרקנטיל דיסקונט',
  'בנק ירושלים',
  'בנק יהב',
  'בנק מסד',
  'אוצר החייל',
] as const;

const VEHICLE_TYPES = ['רכב פרטי ידני', 'רכב פרטי אוטומטי', 'אופנוע', 'אחר'] as const;

interface Substitute {
  id: string;
  name: string;
  phone: string | null;
  lesson_cost: number | null;
  id_number?: string | null;
  bank_name?: string | null;
  bank_branch?: string | null;
  bank_account?: string | null;
  vehicle_type?: string | null;
  notes?: string | null;
  is_active?: boolean;
}

interface EditSubstituteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  substitute: Substitute;
}

export function EditSubstituteModal({ open, onOpenChange, substitute }: EditSubstituteModalProps) {
  const [name, setName] = useState(substitute.name);
  const [phone, setPhone] = useState(substitute.phone ?? '');
  const [lessonCost, setLessonCost] = useState(substitute.lesson_cost != null ? String(substitute.lesson_cost) : '');
  const [idNumber, setIdNumber] = useState(substitute.id_number ?? '');
  const [bankName, setBankName] = useState(substitute.bank_name ?? '');
  const [bankBranch, setBankBranch] = useState(substitute.bank_branch ?? '');
  const [bankAccount, setBankAccount] = useState(substitute.bank_account ?? '');
  const [vehicleType, setVehicleType] = useState(substitute.vehicle_type ?? '');
  const [notes, setNotes] = useState(substitute.notes ?? '');
  const [isActive, setIsActive] = useState(substitute.is_active ?? true);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('teachers')
        .update({
          name: name.trim(),
          phone: phone.trim() || null,
          lesson_cost: lessonCost !== '' ? Number(lessonCost) : null,
          id_number: idNumber.trim() || null,
          bank_name: bankName || null,
          bank_branch: bankBranch.trim() || null,
          bank_account: bankAccount.trim() || null,
          vehicle_type: vehicleType || null,
          notes: notes.trim() || null,
          is_active: isActive,
        })
        .eq('id', substitute.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substitutes'] });
      toast.success('פרטי המחליף עודכנו');
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md top-2 translate-y-0 sm:top-[50%] sm:translate-y-[-50%] max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>עריכת מורה מחליף</DialogTitle>
          <DialogDescription>עדכן את פרטי המחליף</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">

          {/* Basic */}
          <div className="space-y-2">
            <Label>שם מלא *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>טלפון</Label>
            <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="05X-XXXXXXX" maxLength={20} />
          </div>
          <div className="space-y-2">
            <Label>ת.ז</Label>
            <Input value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="מספר תעודת זהות" maxLength={20} />
          </div>
          <div className="space-y-2">
            <Label>עלות שיעור (₪)</Label>
            <Input type="number" min={0} value={lessonCost} onChange={e => setLessonCost(e.target.value)} placeholder="למשל 120" />
          </div>

          {/* Bank details */}
          <div className="space-y-2">
            <Label>בנק</Label>
            <Select value={bankName} onValueChange={setBankName}>
              <SelectTrigger>
                <SelectValue placeholder="בחר בנק" />
              </SelectTrigger>
              <SelectContent className="bg-background z-[100]">
                {ISRAELI_BANKS.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>מספר סניף</Label>
              <Input value={bankBranch} onChange={e => setBankBranch(e.target.value)} placeholder="000" maxLength={10} />
            </div>
            <div className="space-y-2">
              <Label>מספר חשבון</Label>
              <Input value={bankAccount} onChange={e => setBankAccount(e.target.value)} placeholder="000000000" maxLength={20} />
            </div>
          </div>

          {/* Vehicle */}
          <div className="space-y-2">
            <Label>סוג רכב</Label>
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג רכב" />
              </SelectTrigger>
              <SelectContent className="bg-background z-[100]">
                {VEHICLE_TYPES.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>הערות</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="הערות פנימיות..." rows={2} />
          </div>

          {/* Active */}
          <div className="flex items-center justify-between">
            <Label>פעיל</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
            <Button type="submit" disabled={!name.trim() || mutation.isPending}>
              {mutation.isPending ? 'שומר...' : 'שמור'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
