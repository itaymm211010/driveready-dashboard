import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CheckCircle2 } from 'lucide-react';

interface EndLessonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duration: string;
  amount: number;
  studentName: string;
  onPayment: (method: 'cash' | 'receipt' | 'debt') => void;
  isSaving?: boolean;
}

export function EndLessonModal({ open, onOpenChange, duration, amount, studentName, onPayment, isSaving }: EndLessonModalProps) {
  const navigate = useNavigate();
  const [success, setSuccess] = useState<string | null>(null);

  const handlePayment = (method: 'cash' | 'receipt' | 'debt') => {
    onPayment(method);
    setSuccess(method);
    setTimeout(() => {
      onOpenChange(false);
      setSuccess(null);
      navigate('/teacher/today');
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-8 gap-3"
          >
            <CheckCircle2 className="h-16 w-16 text-success" />
            <p className="text-lg font-bold text-foreground">השיעור הושלם!</p>
            <p className="text-sm text-muted-foreground">
              {success === 'cash' && 'תשלום במזומן נרשם.'}
              {success === 'receipt' && 'קבלה הופקה.'}
              {success === 'debt' && `₪${amount} נוספו ליתרת ${studentName}.`}
            </p>
          </motion.div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>✅ סיום שיעור</DialogTitle>
              <DialogDescription>
                {studentName} • משך: {duration} • סכום: ₪{amount}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium text-foreground">התלמיד שילם?</p>

              <Button
                className="w-full min-h-[52px] justify-start text-base bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => handlePayment('cash')}
              >
                ✅ כן – מזומן
              </Button>

              <Button
                className="w-full min-h-[52px] justify-start text-base"
                onClick={() => handlePayment('receipt')}
              >
                🧾 כן – הפק קבלה
              </Button>

              <Button
                variant="destructive"
                className="w-full min-h-[52px] justify-start text-base"
                onClick={() => handlePayment('debt')}
              >
                ⚠️ לא – הוסף לחוב
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                ביטול
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
