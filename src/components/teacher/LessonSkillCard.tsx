import { Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkillStatusToggle } from '@/components/shared/SkillStatusToggle';
import type { DbSkill } from '@/hooks/use-teacher-data';
import type { SkillStatus } from '@/data/mock';

interface LessonSkillCardProps {
  skill: DbSkill;
  currentStatus: SkillStatus;
  noteValue: string;
  onStatusChange: (skillId: string, status: SkillStatus) => void;
  onNoteChange: (skillId: string, note: string) => void;
  onShowHistory: (skill: DbSkill) => void;
  onRemove?: (skillId: string) => void;
}

export function LessonSkillCard({
  skill,
  currentStatus,
  noteValue,
  onStatusChange,
  onNoteChange,
  onShowHistory,
  onRemove,
}: LessonSkillCardProps) {
  const isFirstTime = !skill.student_skill || skill.student_skill.times_practiced === 0;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground">{skill.name}</h3>
          {isFirstTime ? (
            <p className="text-xs text-primary mt-0.5">🆕 תרגול ראשון</p>
          ) : skill.student_skill?.last_note ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              אחרון: {skill.student_skill.last_proficiency ?? 0}% - "{skill.student_skill.last_note}"
            </p>
          ) : skill.student_skill?.last_proficiency !== undefined && skill.student_skill?.last_proficiency !== null ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              אחרון: {skill.student_skill.last_proficiency}%
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onShowHistory(skill)}
          >
            <Info className="h-4 w-4" />
          </Button>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(skill.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Status Toggle */}
      <SkillStatusToggle
        value={currentStatus}
        onChange={(status) => onStatusChange(skill.id, status)}
        size="sm"
      />

      {/* Note Input */}
      <input
        type="text"
        placeholder="הוסף הערה (אופציונלי)..."
        value={noteValue}
        onChange={(e) => onNoteChange(skill.id, e.target.value)}
        className="w-full text-xs bg-muted/50 border border-border rounded-md px-2.5 py-2 min-h-[36px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
        dir="rtl"
      />
    </div>
  );
}
