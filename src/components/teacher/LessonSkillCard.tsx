import { Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkillScoreSelector } from '@/components/shared/SkillScoreSelector';
import type { DbSkill } from '@/hooks/use-teacher-data';
import type { SkillScore } from '@/lib/scoring';
import { scoreToPercentage, formatScore } from '@/lib/scoring';

interface LessonSkillCardProps {
  skill: DbSkill;
  currentScore: SkillScore;
  noteValue: string;
  onScoreChange: (skillId: string, score: SkillScore) => void;
  onNoteChange: (skillId: string, note: string) => void;
  onShowHistory: (skill: DbSkill) => void;
  onRemove?: (skillId: string) => void;
}

export function LessonSkillCard({
  skill,
  currentScore,
  noteValue,
  onScoreChange,
  onNoteChange,
  onShowHistory,
  onRemove,
}: LessonSkillCardProps) {
  const isFirstTime = !skill.student_skill || skill.student_skill.times_practiced === 0;
  const lastScore = skill.student_skill?.last_proficiency as SkillScore | null | undefined;
  const lastPercentage = lastScore ? scoreToPercentage(lastScore) : null;

  return (
    <div className="rounded-xl border bg-card/80 backdrop-blur-sm p-4 space-y-3 card-premium overflow-hidden transition-smooth hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-heading font-bold text-foreground">{skill.name}</h3>
          {isFirstTime ? (
            <p className="text-xs text-primary mt-0.5 font-body">🆕 תרגול ראשון</p>
          ) : skill.student_skill?.last_note && lastScore ? (
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              אחרון: {formatScore(lastScore)} ({lastPercentage}%) - "{skill.student_skill.last_note}"
            </p>
          ) : lastScore !== undefined && lastScore !== null && lastScore > 0 ? (
            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              אחרון: {formatScore(lastScore)} ({lastPercentage}%)
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full transition-smooth"
            onClick={() => onShowHistory(skill)}
          >
            <Info className="h-4 w-4" />
          </Button>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-destructive transition-smooth"
              onClick={() => onRemove(skill.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Score Selector */}
      <SkillScoreSelector
        value={currentScore}
        onChange={(score) => onScoreChange(skill.id, score)}
        size="sm"
      />

      {/* Note Input */}
      <input
        type="text"
        placeholder="הוסף הערה (אופציונלי)..."
        value={noteValue}
        onChange={(e) => onNoteChange(skill.id, e.target.value)}
        className="w-full text-xs bg-muted/30 border border-border/50 rounded-lg px-3 py-2.5 min-h-[36px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-smooth font-body"
        dir="rtl"
      />
    </div>
  );
}
