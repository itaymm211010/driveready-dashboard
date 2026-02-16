import { useState, useMemo } from 'react';
import { Search, Plus, Check, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { DbSkillCategory, DbSkill } from '@/hooks/use-teacher-data';

interface SkillSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: DbSkillCategory[];
  alreadySelected: string[];
  studentName: string;
  lessonNumber: number;
  onConfirm: (skillIds: string[]) => void;
  confirmLabel?: string;
}

function getStatusIndicator(skill: DbSkill) {
  const status = skill.student_skill?.current_status;
  if (status === 'mastered') return { icon: '✓', color: 'text-success' };
  if (status === 'in_progress') return { icon: `${skill.student_skill?.last_proficiency ?? 0}%`, color: 'text-warning' };
  return { icon: '⚪', color: 'text-muted-foreground' };
}

function getSuggestions(categories: DbSkillCategory[]) {
  const allSkills = categories.flatMap(c => c.skills);
  
  const needsAttention = allSkills.filter(s => {
    const prof = s.student_skill?.last_proficiency;
    return s.student_skill?.current_status === 'in_progress' && prof !== undefined && prof < 60;
  });

  const neverPracticed = allSkills.filter(s => !s.student_skill || s.student_skill.times_practiced === 0);

  const notRecently = allSkills.filter(s => {
    if (!s.student_skill?.last_practiced_date) return false;
    if (s.student_skill.current_status === 'mastered') return false;
    const days = Math.floor((Date.now() - new Date(s.student_skill.last_practiced_date).getTime()) / 86400000);
    return days >= 7;
  });

  return { needsAttention, neverPracticed, notRecently };
}

export function SkillSelectionModal({
  open,
  onOpenChange,
  categories,
  alreadySelected,
  studentName,
  lessonNumber,
  onConfirm,
  confirmLabel = 'התחל שיעור עם הנבחרים',
}: SkillSelectionModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(alreadySelected));
  const [search, setSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const suggestions = useMemo(() => getSuggestions(categories), [categories]);

  const toggleSkill = (skillId: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      return next;
    });
  };

  const toggleCat = (catId: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories
      .map(cat => ({
        ...cat,
        skills: cat.skills.filter(s => s.name.toLowerCase().includes(q)),
      }))
      .filter(cat => cat.skills.length > 0);
  }, [categories, search]);

  const handleConfirm = () => {
    onConfirm(Array.from(selected));
    onOpenChange(false);
  };

  const renderSkillRow = (skill: DbSkill) => {
    const isSelected = selected.has(skill.id);
    const indicator = getStatusIndicator(skill);
    return (
      <button
        key={skill.id}
        onClick={() => toggleSkill(skill.id)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all min-h-[44px]',
          isSelected
            ? 'bg-primary/10 border border-primary/30'
            : 'bg-card hover:bg-muted border border-transparent'
        )}
      >
        <div className={cn(
          'h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
          isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/40'
        )}>
          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground">{skill.name}</span>
          {skill.student_skill?.last_note && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              └─ {skill.student_skill.last_note}
            </p>
          )}
        </div>
        <span className={cn('text-xs font-medium', indicator.color)}>
          {indicator.icon}
        </span>
      </button>
    );
  };

  const hasSuggestions = suggestions.needsAttention.length > 0 || suggestions.neverPracticed.length > 0 || suggestions.notRecently.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>בחר מיומנויות לשיעור</DialogTitle>
          <DialogDescription>
            {studentName} • שיעור #{lessonNumber}
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חפש מיומנות..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-4">
          {/* Smart Suggestions */}
          {hasSuggestions && !search && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-warning" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  הצעות חכמות
                </span>
              </div>

              {suggestions.needsAttention.map(skill => (
                <button
                  key={`sug-${skill.id}`}
                  onClick={() => toggleSkill(skill.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all',
                    selected.has(skill.id)
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-warning/5 border-warning/20 hover:bg-warning/10'
                  )}
                >
                  <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-sm font-medium text-foreground">{skill.name}</span>
                    <p className="text-xs text-muted-foreground">
                      {skill.student_skill?.last_proficiency}% - דרוש תרגול
                    </p>
                  </div>
                  {selected.has(skill.id) ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              ))}

              {suggestions.neverPracticed.slice(0, 3).map(skill => (
                <button
                  key={`new-${skill.id}`}
                  onClick={() => toggleSkill(skill.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all',
                    selected.has(skill.id)
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-muted/50 border-border hover:bg-muted'
                  )}
                >
                  <span className="text-sm">🆕</span>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-sm font-medium text-foreground">{skill.name}</span>
                    <p className="text-xs text-muted-foreground">לא תורגל מעולם</p>
                  </div>
                  {selected.has(skill.id) ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              ))}

              {suggestions.notRecently.slice(0, 3).map(skill => {
                const days = Math.floor((Date.now() - new Date(skill.student_skill!.last_practiced_date!).getTime()) / 86400000);
                return (
                  <button
                    key={`stale-${skill.id}`}
                    onClick={() => toggleSkill(skill.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all',
                      selected.has(skill.id)
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-muted/50 border-border hover:bg-muted'
                    )}
                  >
                    <Clock className="h-4 w-4 text-destructive flex-shrink-0" />
                    <div className="flex-1 min-w-0 text-left">
                      <span className="text-sm font-medium text-foreground">{skill.name}</span>
                      <p className="text-xs text-muted-foreground">לא תורגל {days} ימים</p>
                    </div>
                    {selected.has(skill.id) ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Browse All Skills */}
          <div className="space-y-2">
            {(hasSuggestions && !search) && (
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                כל המיומנויות
              </span>
            )}
            {filteredCategories.map(cat => (
              <Collapsible
                key={cat.id}
                open={expandedCats.has(cat.id) || !!search}
                onOpenChange={() => toggleCat(cat.id)}
              >
                <CollapsibleTrigger className="w-full flex items-center justify-between bg-muted rounded-lg px-3 py-2.5 min-h-[44px]">
                  <span className="text-sm font-semibold text-foreground">
                    {cat.icon} {cat.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {cat.skills.filter(s => selected.has(s.id)).length}/{cat.skills.length}
                  </Badge>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1 ml-2">
                  {cat.skills.map(renderSkillRow)}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            נבחרו: <strong className="text-foreground">{selected.size}</strong> מיומנויות
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button onClick={handleConfirm} disabled={selected.size === 0}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
