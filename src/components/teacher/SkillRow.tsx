import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SkillScoreSelector } from '@/components/shared/SkillScoreSelector';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Skill } from '@/data/mock';
import type { SkillScore } from '@/lib/scoring';
import { scoreToPercentage, getScoreLevel } from '@/lib/scoring';

interface SkillRowProps {
  skill: Skill;
  onScoreChange: (skillId: string, score: SkillScore) => void;
  onNoteChange: (skillId: string, note: string) => void;
  noteValue: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('he-IL', { month: 'short', day: 'numeric' });
}

function getScoreIcon(score: SkillScore) {
  if (score >= 4) return '🟢';
  if (score >= 2) return '🟡';
  if (score === 1) return '🔴';
  return '⚪';
}

function daysSince(dateStr?: string) {
  if (!dateStr) return null;
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  return diff;
}

export function SkillRow({ skill, onScoreChange, onNoteChange, noteValue }: SkillRowProps) {
  const [expanded, setExpanded] = useState(false);
  const currentScore = skill.current_score;
  const currentPercentage = scoreToPercentage(currentScore);
  const showWarning = currentScore > 0 && currentScore < 4; // Below "Good & stable"
  const days = daysSince(skill.last_practiced_date);
  const stale = days !== null && days > 7 && currentScore > 0 && currentScore < 5;

  return (
    <div className="rounded-lg border bg-card p-3 space-y-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground">{skill.name}</span>
            {showWarning && (
              <span className="inline-flex items-center gap-0.5 text-xs text-warning font-medium">
                <AlertTriangle className="h-3 w-3" />
                {getScoreLevel(currentScore).label} ({currentPercentage}%)
              </span>
            )}
            {skill.times_practiced > 0 && (
              <span className="text-xs text-muted-foreground">🔄 {skill.times_practiced}x</span>
            )}
            {stale && (
              <span className="inline-flex items-center gap-0.5 text-xs text-destructive font-medium">
                <Clock className="h-3 w-3" />
                לפני {days} ימים
              </span>
            )}
          </div>
          {skill.last_note && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              └─ אחרון: "{skill.last_note}"
            </p>
          )}
        </div>
      </div>

      {/* Score Selector */}
      <SkillScoreSelector
        value={skill.current_score}
        onChange={(score) => onScoreChange(skill.id, score)}
        size="sm"
      />

      {/* History Toggle */}
      {skill.history.length > 0 && (
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[32px]">
            📖 {expanded ? 'הסתר' : 'הצג'} היסטוריה
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 space-y-2 border-t pt-2"
                >
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    היסטוריית תרגול
                  </p>
                  {skill.history.map((entry, i) => (
                    <div key={i} className="text-xs space-y-0.5 border-b border-border/50 pb-2 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          📅 שיעור #{entry.lesson_number} – {formatDate(entry.lesson_date)}
                        </span>
                        {entry.score > 0 && (
                          <span className="text-muted-foreground">
                            {getScoreLevel(entry.score).label} ({scoreToPercentage(entry.score)}%)
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        ציון: {getScoreIcon(entry.score)} {getScoreLevel(entry.score).label}
                      </p>
                      {entry.practice_duration_minutes && (
                        <p className="text-muted-foreground">משך: {entry.practice_duration_minutes} דקות</p>
                      )}
                      {entry.teacher_note && (
                        <p className="text-muted-foreground italic">📝 "{entry.teacher_note}"</p>
                      )}
                    </div>
                  ))}

                  {/* Progress trend */}
                  {skill.history.length >= 2 && (() => {
                    const first = skill.history[skill.history.length - 1].score ?? 0;
                    const last = skill.history[0].score ?? 0;
                    const diff = last - first;
                    if (diff === 0) return null;
                    const diffPercent = scoreToPercentage(Math.abs(diff) as SkillScore);
                    return (
                      <p className={cn('text-xs font-medium', diff > 0 ? 'text-success' : 'text-destructive')}>
                        💡 {diff > 0 ? '+' : ''}{diff} נקודות ({diff > 0 ? '+' : ''}{diffPercent}%) מהניסיון הראשון {diff > 0 ? '📈' : '📉'}
                      </p>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Note field */}
      <input
        type="text"
        placeholder="הוסף הערה (אופציונלי)..."
        value={noteValue}
        onChange={(e) => onNoteChange(skill.id, e.target.value)}
        className="w-full text-xs bg-muted/50 border border-border rounded-md px-2.5 py-2 min-h-[36px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}
