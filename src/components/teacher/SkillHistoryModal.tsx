import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DbSkill } from '@/hooks/use-teacher-data';

interface SkillHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: DbSkill | null;
}

function getStatusIcon(status: string) {
  if (status === 'mastered') return '🟢';
  if (status === 'in_progress') return '🟡';
  return '⚪';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('he-IL', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function SkillHistoryModal({ open, onOpenChange, skill }: SkillHistoryModalProps) {
  if (!skill) return null;

  const history = skill.history;
  const timesPracticed = skill.student_skill?.times_practiced ?? 0;
  const currentProf = skill.student_skill?.last_proficiency;
  const currentStatus = skill.student_skill?.current_status ?? 'not_learned';

  // Trend calculation
  let trend: 'up' | 'down' | 'flat' = 'flat';
  if (history.length >= 2) {
    const first = history[history.length - 1].proficiency_estimate ?? 0;
    const last = history[0].proficiency_estimate ?? 0;
    if (last > first) trend = 'up';
    else if (last < first) trend = 'down';
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{skill.name} - היסטוריה מלאה</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Overview */}
          <div className="bg-muted rounded-lg p-3 space-y-1">
            <p className="text-sm font-semibold text-foreground">📊 סקירה:</p>
            <p className="text-xs text-muted-foreground">• תורגל: {timesPracticed} פעמים</p>
            {currentProf !== undefined && currentProf !== null && (
              <p className="text-xs text-muted-foreground">• רמה נוכחית: {currentProf}%</p>
            )}
            <p className="text-xs text-muted-foreground">
              • סטטוס: {getStatusIcon(currentStatus)} {currentStatus === 'mastered' ? 'נשלט' : currentStatus === 'in_progress' ? 'בתהליך' : 'לא נלמד'}
            </p>
            {trend !== 'flat' && (
              <p className={cn('text-xs font-medium flex items-center gap-1', trend === 'up' ? 'text-success' : 'text-destructive')}>
                • מגמה: {trend === 'up' ? <><TrendingUp className="h-3 w-3" /> משתפר 📈</> : <><TrendingDown className="h-3 w-3" /> יורד 📉</>}
              </p>
            )}
          </div>

          {/* History entries */}
          {history.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                היסטוריה
              </p>
              {history.map((entry, i) => (
                <div key={i} className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      📅 {entry.lesson_number ? `שיעור #${entry.lesson_number} - ` : ''}{formatDate(entry.lesson_date)}
                    </span>
                    {entry.proficiency_estimate !== undefined && entry.proficiency_estimate !== null && (
                      <span className="text-xs text-muted-foreground">({entry.proficiency_estimate}%)</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    סטטוס: {getStatusIcon(entry.status)} {entry.status.replace('_', ' ')}
                  </p>
                  {entry.practice_duration_minutes && (
                    <p className="text-xs text-muted-foreground">משך: {entry.practice_duration_minutes} דקות</p>
                  )}
                  {entry.teacher_note && (
                    <p className="text-xs text-muted-foreground italic">📝 "{entry.teacher_note}"</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">אין היסטוריה עדיין</p>
          )}
        </div>

        <div className="pt-2">
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            סגור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
