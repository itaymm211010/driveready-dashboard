import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTeacherModal({ open, onOpenChange }: AddTeacherModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-teacher', {
        body: { name: name.trim(), email: email.trim(), password },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      queryClient.invalidateQueries({ queryKey: ['admin-teachers'] });
      toast.success('מורה נוסף בהצלחה');
      setName(''); setEmail(''); setPassword('');
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה ביצירת המורה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת מורה חדש</DialogTitle>
          <DialogDescription>צור חשבון כניסה למורה</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>שם מלא *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="שם המורה" required />
          </div>
          <div className="space-y-2">
            <Label>אימייל *</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" dir="ltr" required />
          </div>
          <div className="space-y-2">
            <Label>סיסמא *</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="לפחות 6 תווים" minLength={6} required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
            <Button type="submit" disabled={loading || !name.trim() || !email.trim() || !password.trim()}>
              {loading ? 'יוצר...' : 'הוסף מורה'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
