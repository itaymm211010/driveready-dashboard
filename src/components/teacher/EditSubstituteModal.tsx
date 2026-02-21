import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Substitute {
  id: string;
  name: string;
  phone: string | null;
}

interface EditSubstituteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  substitute: Substitute;
}

export function EditSubstituteModal({ open, onOpenChange, substitute }: EditSubstituteModalProps) {
  const [name, setName] = useState(substitute.name);
  const [phone, setPhone] = useState(substitute.phone ?? '');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('teachers')
        .update({
          name: name.trim(),
          phone: phone.trim() || null,
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
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>עריכת מורה מחליף</DialogTitle>
          <DialogDescription>עדכן את פרטי המחליף</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>שם מלא *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>טלפון</Label>
            <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="05X-XXXXXXX" />
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
