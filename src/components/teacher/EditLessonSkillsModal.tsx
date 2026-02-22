import { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SkillScoreSelector } from '@/components/shared/SkillScoreSelector';
import { useLessonPlannedSkills } from '@/hooks/use-lesson-planned-skills';
import { useStudentSkillTree } from '@/hooks/use-teacher-data';
import { useUpdateLessonSkill } from '@/hooks/use-update-lesson-skill';
import type { CalendarLesson } from '@/hooks/use-calendar-lessons';
import type { SkillScore } from '@/lib/scoring';

interface EditLessonSkillsModalProps {
  lesson: CalendarLesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLessonSkillsModal({ lesson, open, onOpenChange }: EditLessonSkillsModalProps) {
  const { data: plannedSkills } = useLessonPlannedSkills(lesson?.id);
  const { data: dbCategories } = useStudentSkillTree(lesson?.student_id);
  const updateSkillMutation = useUpdateLessonSkill();

  const [scoreOverrides, setScoreOverrides] = useState<Record<string, SkillScore>>({});
  const [noteOverrides, setNoteOverrides] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const plannedSkillIds = useMemo(
    () => new Set(plannedSkills?.map(ps => ps.skill_id) ?? []),
    [plannedSkills]
  );

  const practicedSkills = useMemo(() => {
    if (!dbCategories) return [];
    return dbCategories.flatMap(c => c.skills).filter(s => plannedSkillIds.has(s.id));
  }, [dbCategories, plannedSkillIds]);

  if (!lesson) return null;

  const handleSave = async () => {
    const skillsToUpdate = practicedSkills.filter(
      s => scoreOverrides[s.id] !== undefined || noteOverrides[s.id] !== undefined
    );
    if (skillsToUpdate.length === 0) {
      onOpenChange(false);
      return;
    }

    setSaving(true);
    try {
      await Promise.all(
        skillsToUpdate.map(s =>
          updateSkillMutation.mutateAsync({
            lessonId: lesson.id,
            studentId: lesson.student_id,
            skillId: s.id,
            newScore: scoreOverrides[s.id],
            newNote: noteOverrides[s.id],
          })
        )
      );
      toast.success('ציוני המיומנויות עודכנו');
      onOpenChange(false);
    } catch {
      toast.error('שגיאה בעדכון המיומנויות');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle>עריכת ציוני מיומנויות</DialogTitle>
          <p className="text-sm text-muted-foreground">{lesson.student.name}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {practicedSkills.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              לא נמצאו מיומנויות מתוכננות לשיעור זה
            </p>
          ) : (
            practicedSkills.map(skill => {
              const currentScore = (scoreOverrides[skill.id] ??
                (skill.student_skill?.current_score as SkillScore) ?? 0) as SkillScore;
              const currentNote = noteOverrides[skill.id] ??
                skill.student_skill?.last_note ?? '';
              return (
                <div key={skill.id} className="space-y-2 rounded-xl border bg-card/80 p-3">
                  <p className="text-sm font-heading font-bold">{skill.name}</p>
                  <SkillScoreSelector
                    value={currentScore}
                    onChange={(score) =>
                      setScoreOverrides(prev => ({ ...prev, [skill.id]: score }))
                    }
                    size="sm"
                  />
                  <input
                    type="text"
                    placeholder="הערה (אופציונלי)..."
                    value={currentNote}
                    onChange={(e) =>
                      setNoteOverrides(prev => ({ ...prev, [skill.id]: e.target.value }))
                    }
                    className="w-full text-xs bg-muted/30 border border-border/50 rounded-lg px-3 py-2 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-smooth"
                    dir="rtl"
                  />
                </div>
              );
            })
          )}
        </div>

        <div className="border-t pt-3 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button className="flex-1 gap-2" onClick={handleSave} disabled={saving}>
            <Check className="h-4 w-4" />
            {saving ? 'שומר…' : 'שמור שינויים'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
