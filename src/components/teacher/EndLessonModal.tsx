import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CheckCircle2, Clock, Timer, TrendingDown, TrendingUp, AlertTriangle, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EndLessonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duration: string;
  amount: number;
  studentName: string;
  onPayment: (method: 'cash' | 'receipt' | 'debt') => void;
  isSaving?: boolean;
  startedAt?: string | null;
  scheduledEnd?: string | null;
  scheduledMinutes?: number | null;
  elapsedSeconds?: number;
}

export function EndLessonModal({
  open, onOpenChange, duration, amount, studentName, onPayment, isSaving,
  startedAt, scheduledEnd, scheduledMinutes, elapsedSeconds,
}: EndLessonModalProps) {
  const navigate = useNavigate();
  const [success, setSuccess] = useState<string | null>(null);

  const actualMinutes = elapsedSeconds != null ? Math.round(elapsedSeconds / 60) : null;
  const variance = actualMinutes != null && scheduledMinutes != null
    ? actualMinutes - scheduledMinutes
    : null;

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
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" /> סיום שיעור
              </DialogTitle>
              <DialogDescription>
                {studentName} • משך: {duration} • סכום: ₪{amount}
              </DialogDescription>
            </DialogHeader>

            {/* Time Summary */}
            {(startedAt || scheduledEnd || variance != null) && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-heading font-semibold text-foreground">
                  <Timer className="h-4 w-4" />
                  סיכום זמנים
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {startedAt && (
                    <div>
                      <span className="text-muted-foreground">התחלה:</span>{' '}
                      <span className="font-medium">{startedAt}</span>
                    </div>
                  )}
                  {scheduledEnd && (
                    <div>
                      <span className="text-muted-foreground">סיום מתוכנן:</span>{' '}
                      <span className="font-medium">{scheduledEnd}</span>
                    </div>
                  )}
                  {scheduledMinutes != null && (
                    <div>
                      <span className="text-muted-foreground">מתוכנן:</span>{' '}
                      <span className="font-medium">{scheduledMinutes} דקות</span>
                    </div>
                  )}
                  {actualMinutes != null && (
                    <div>
                      <span className="text-muted-foreground">בפועל:</span>{' '}
                      <span className="font-medium">{actualMinutes} דקות</span>
                    </div>
                  )}
                </div>
                {variance != null && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-center gap-2">
                      {variance > 0 ? (
                        <Badge variant="outline" className="text-destructive border-destructive/30 gap-1">
                          <TrendingUp className="h-3 w-3" />
                          +{variance} דקות חריגה
                        </Badge>
                      ) : variance < 0 ? (
                        <Badge variant="outline" className="text-success border-success/30 gap-1">
                          <TrendingDown className="h-3 w-3" />
                          {variance} דקות מוקדם
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-success border-success/30 gap-1">
                          <Clock className="h-3 w-3" />
                          בדיוק בזמן!
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium text-foreground">התלמיד שילם?</p>

              <Button
                className="w-full min-h-[52px] justify-start text-base gap-2 bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => handlePayment('cash')}
              >
                <CheckCircle2 className="h-5 w-5" /> כן – מזומן
              </Button>

              <Button
                className="w-full min-h-[52px] justify-start text-base gap-2"
                onClick={() => handlePayment('receipt')}
              >
                <Receipt className="h-5 w-5" /> כן – הפק קבלה
              </Button>

              <Button
                variant="destructive"
                className="w-full min-h-[52px] justify-start text-base gap-2"
                onClick={() => handlePayment('debt')}
              >
                <AlertTriangle className="h-5 w-5" /> לא – הוסף לחוב
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
