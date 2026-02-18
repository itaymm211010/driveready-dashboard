import { cn } from '@/lib/utils';

export type SkillStatus = 'not_learned' | 'in_progress' | 'mastered';

interface SkillStatusToggleProps {
  value: SkillStatus;
  onChange: (status: SkillStatus) => void;
  size?: 'sm' | 'default';
}

const options: { value: SkillStatus; label: string; icon: string }[] = [
  { value: 'not_learned', label: 'לא נלמד', icon: '⚪' },
  { value: 'in_progress', label: 'בתרגול', icon: '🟡' },
  { value: 'mastered', label: 'שלט', icon: '✓' },
];

export function SkillStatusToggle({ value, onChange, size = 'default' }: SkillStatusToggleProps) {
  return (
    <div className="flex gap-1.5">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-full border font-medium transition-all active:scale-95',
              size === 'sm' ? 'px-2.5 py-1 text-xs min-h-[32px]' : 'px-3 py-1.5 text-sm min-h-[44px]',
              isActive && opt.value === 'not_learned' && 'bg-muted text-muted-foreground border-muted-foreground/30',
              isActive && opt.value === 'in_progress' && 'bg-warning/15 text-warning border-warning/40',
              isActive && opt.value === 'mastered' && 'bg-success/15 text-success border-success/40',
              !isActive && 'bg-transparent text-muted-foreground/60 border-border hover:border-muted-foreground/30'
            )}
          >
            {opt.icon} {opt.label}
          </button>
        );
      })}
    </div>
  );
}
