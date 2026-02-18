import { cn } from '@/lib/utils';
import { type SkillScore, SCORE_LEVELS, getAllScoreLevels } from '@/lib/scoring';

interface SkillScoreSelectorProps {
  value: SkillScore;
  onChange: (score: SkillScore) => void;
  size?: 'sm' | 'default';
  disabled?: boolean;
}

/**
 * Skill Score Selector (0-5 Scale)
 *
 * Replaces the old 3-state toggle with a comprehensive 6-level scoring system.
 * Displays round buttons with Hebrew labels and color coding.
 */
export function SkillScoreSelector({
  value,
  onChange,
  size = 'default',
  disabled = false,
}: SkillScoreSelectorProps) {
  const scoreLevels = getAllScoreLevels();

  return (
    <div className="flex gap-1.5 flex-wrap" role="radiogroup" aria-label="בחירת רמת מיומנות">
      {scoreLevels.map((level) => {
        const isActive = value === level.score;
        const scoreLevel = SCORE_LEVELS[level.score];

        return (
          <button
            key={level.score}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${level.label} - ${level.description}`}
            onClick={() => !disabled && onChange(level.score)}
            disabled={disabled}
            className={cn(
              'rounded-full border font-medium transition-all',
              'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-1.5',
              size === 'sm' ? 'px-2.5 py-1 text-xs min-h-[32px]' : 'px-3 py-1.5 text-sm min-h-[44px]',
              // Active state with colored backgrounds
              isActive && level.score === 0 && 'bg-gray-100 text-gray-700 border-gray-400',
              isActive && level.score === 1 && 'bg-red-100 text-red-700 border-red-400',
              isActive && level.score === 2 && 'bg-orange-100 text-orange-700 border-orange-400',
              isActive && level.score === 3 && 'bg-yellow-100 text-yellow-700 border-yellow-400',
              isActive && level.score === 4 && 'bg-green-100 text-green-700 border-green-400',
              isActive && level.score === 5 && 'bg-sky-100 text-sky-700 border-sky-400',
              // Inactive state
              !isActive && 'bg-transparent text-muted-foreground/60 border-border hover:border-muted-foreground/30'
            )}
            style={
              isActive
                ? {
                    backgroundColor: scoreLevel.bgColor,
                    color: scoreLevel.color,
                    borderColor: scoreLevel.color,
                  }
                : undefined
            }
          >
            <span className="font-semibold">{level.score}</span>
            <span className={cn('whitespace-nowrap', size === 'sm' && 'hidden sm:inline')}>
              {level.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Compact Score Display (Read-Only)
 *
 * Shows the current score with label and color, without interaction.
 * Useful for displaying scores in tables or cards.
 */
interface SkillScoreDisplayProps {
  score: SkillScore;
  showPercentage?: boolean;
  size?: 'sm' | 'default';
}

export function SkillScoreDisplay({
  score,
  showPercentage = false,
  size = 'default',
}: SkillScoreDisplayProps) {
  const level = SCORE_LEVELS[score];
  const percentage = (score / 5) * 100;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-medium',
        size === 'sm' && 'px-2.5 py-1 text-xs',
        size === 'default' && 'text-sm'
      )}
      style={{
        backgroundColor: level.bgColor,
        color: level.color,
      }}
    >
      <span className="font-semibold">{score}</span>
      <span>{level.label}</span>
      {showPercentage && <span className="opacity-75">({percentage}%)</span>}
    </div>
  );
}
