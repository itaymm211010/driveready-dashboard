import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SkillStatusToggle } from '@/components/shared/SkillStatusToggle';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Skill, SkillStatus } from '@/data/mock';

interface SkillRowProps {
  skill: Skill;
  onStatusChange: (skillId: string, status: SkillStatus) => void;
  onNoteChange: (skillId: string, note: string) => void;
  noteValue: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getStatusIcon(status: SkillStatus) {
  if (status === 'mastered') return '🟢';
  if (status === 'in_progress') return '🟡';
  return '⚪';
}

function daysSince(dateStr?: string) {
  if (!dateStr) return null;
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  return diff;
}

export function SkillRow({ skill, onStatusChange, onNoteChange, noteValue }: SkillRowProps) {
  const [expanded, setExpanded] = useState(false);
  const showWarning = skill.last_proficiency !== undefined && skill.last_proficiency < 80;
  const days = daysSince(skill.last_practiced_date);
  const stale = days !== null && days > 7 && skill.current_status === 'in_progress';

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
                {skill.last_proficiency}%
              </span>
            )}
            {skill.times_practiced > 0 && (
              <span className="text-xs text-muted-foreground">🔄 {skill.times_practiced}x</span>
            )}
            {stale && (
              <span className="inline-flex items-center gap-0.5 text-xs text-destructive font-medium">
                <Clock className="h-3 w-3" />
                {days}d ago
              </span>
            )}
          </div>
          {skill.last_note && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              └─ Last: "{skill.last_note}"
            </p>
          )}
        </div>
      </div>

      {/* Status Toggle */}
      <SkillStatusToggle
        value={skill.current_status}
        onChange={(status) => onStatusChange(skill.id, status)}
        size="sm"
      />

      {/* History Toggle */}
      {skill.history.length > 0 && (
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[32px]">
            📖 {expanded ? 'Hide' : 'Show'} History
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
                    Practice History
                  </p>
                  {skill.history.map((entry, i) => (
                    <div key={i} className="text-xs space-y-0.5 border-b border-border/50 pb-2 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          📅 Lesson #{entry.lesson_number} – {formatDate(entry.lesson_date)}
                        </span>
                        {entry.proficiency_estimate !== undefined && (
                          <span className="text-muted-foreground">({entry.proficiency_estimate}%)</span>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        Status: {getStatusIcon(entry.status)} {entry.status.replace('_', ' ')}
                      </p>
                      {entry.practice_duration_minutes && (
                        <p className="text-muted-foreground">Duration: {entry.practice_duration_minutes} min</p>
                      )}
                      {entry.teacher_note && (
                        <p className="text-muted-foreground italic">📝 "{entry.teacher_note}"</p>
                      )}
                    </div>
                  ))}

                  {/* Progress trend */}
                  {skill.history.length >= 2 && (() => {
                    const first = skill.history[skill.history.length - 1].proficiency_estimate ?? 0;
                    const last = skill.history[0].proficiency_estimate ?? 0;
                    const diff = last - first;
                    if (diff === 0) return null;
                    return (
                      <p className={cn('text-xs font-medium', diff > 0 ? 'text-success' : 'text-destructive')}>
                        💡 {diff > 0 ? `+${diff}%` : `${diff}%`} since first attempt {diff > 0 ? '📈' : '📉'}
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
        placeholder="Add note (optional)..."
        value={noteValue}
        onChange={(e) => onNoteChange(skill.id, e.target.value)}
        className="w-full text-xs bg-muted/50 border border-border rounded-md px-2.5 py-2 min-h-[36px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}
