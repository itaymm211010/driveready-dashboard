import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import { X, BookOpen, Save, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkillSelectionModal } from '@/components/teacher/SkillSelectionModal';
import { useLessonPlannedSkills, useAddPlannedSkills, useRemovePlannedSkill } from '@/hooks/use-lesson-planned-skills';
import { useStartLesson } from '@/hooks/use-start-lesson';
import { useStudentSkillTree } from '@/hooks/use-teacher-data';
import { canStartLesson } from '@/lib/utils';
import type { CalendarLesson } from '@/hooks/use-calendar-lessons';

interface LessonPlanModalProps {
  lesson: CalendarLesson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LessonPlanModal({ lesson, open, onOpenChange }: LessonPlanModalProps) {
  const navigate = useNavigate();
  const [showSkillSelect, setShowSkillSelect] = useState(false);

  const { data: plannedSkills } = useLessonPlannedSkills(lesson?.id);
  const { data: dbCategories } = useStudentSkillTree(lesson?.student_id);
  const addPlannedSkillsMutation = useAddPlannedSkills();
  const removePlannedSkillMutation = useRemovePlannedSkill();
  const startLessonMutation = useStartLesson();

  const canStart = lesson ? canStartLesson(lesson.date, lesson.time_start) : false;

  const plannedSkillIds = useMemo(
    () => new Set(plannedSkills?.map(ps => ps.skill_id) ?? []),
    [plannedSkills]
  );

  const plannedSkillObjects = useMemo(() => {
    if (!dbCategories) return [];
    return dbCategories.flatMap(c => c.skills).filter(s => plannedSkillIds.has(s.id));
  }, [dbCategories, plannedSkillIds]);

  const categoriesForSelect = useMemo(() => {
    if (!dbCategories) return [];
    return dbCategories
      .map(cat => ({ ...cat, skills: cat.skills.filter(s => !plannedSkillIds.has(s.id)) }))
      .filter(cat => cat.skills.length > 0);
  }, [dbCategories, plannedSkillIds]);

  if (!lesson) return null;

  const isTestLesson = lesson.notes?.startsWith('[טסט פנימי]') || lesson.notes?.startsWith('[טסט חיצוני]');

  const handleAddSkills = (skillIds: string[]) => {
    addPlannedSkillsMutation.mutate({ lessonId: lesson.id, skillIds, addedBeforeLesson: true });
  };

  const handleRemoveSkill = (skillId: string) => {
    removePlannedSkillMutation.mutate({ lessonId: lesson.id, skillId });
  };

  const handleStartLesson = () => {
    startLessonMutation.mutate(
      { lessonId: lesson.id, timeStart: lesson.time_start, timeEnd: lesson.time_end },
      { onSuccess: () => { onOpenChange(false); navigate(`/teacher/lesson/${lesson.id}`); } }
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col" dir="rtl">
          <DialogHeader>
            <DialogTitle>תכנון שיעור</DialogTitle>
          </DialogHeader>

          {/* Lesson summary */}
          <div className="glass rounded-xl p-3 space-y-1 text-sm">
            <p className="font-heading font-bold text-base">{lesson.student.name}</p>
            <p className="text-muted-foreground">
              {format(parseISO(lesson.date), 'EEEE, d MMMM', { locale: he })}
              {' · '}
              <span dir="ltr">{lesson.time_start} – {lesson.time_end}</span>
            </p>
            {!canStart && (
              <p className="text-xs text-warning font-medium">
                ניתן להתחיל שיעור החל מ-{lesson.time_start}
              </p>
            )}
          </div>

          {/* Planned skills */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {isTestLesson ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">שיעור טסט — אין בחירת מיומנויות</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">מיומנויות מתוכננות ({plannedSkillObjects.length})</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => setShowSkillSelect(true)}
                    disabled={categoriesForSelect.length === 0}
                  >
                    + הוסף
                  </Button>
                </div>

                {plannedSkillObjects.length === 0 ? (
                  <button
                    onClick={() => setShowSkillSelect(true)}
                    className="w-full border border-dashed border-border/50 rounded-xl p-6 text-center text-sm text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-smooth"
                  >
                    <BookOpen className="h-6 w-6 mx-auto mb-2 opacity-40" />
                    לחץ לבחירת מיומנויות לשיעור
                  </button>
                ) : (
                  <div className="space-y-1.5">
                    {plannedSkillObjects.map(skill => (
                      <div
                        key={skill.id}
                        className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                      >
                        <span className="text-sm font-medium">{skill.name}</span>
                        <button
                          onClick={() => handleRemoveSkill(skill.id)}
                          className="text-muted-foreground hover:text-destructive transition-smooth p-1 rounded"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t pt-3 flex gap-2">
            {canStart ? (
              <Button
                className="flex-1 gap-2 font-heading font-bold"
                onClick={handleStartLesson}
                disabled={startLessonMutation.isPending}
              >
                <Play className="h-4 w-4" />
                התחל שיעור
              </Button>
            ) : (
              <Button
                className="flex-1 gap-2"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                <Save className="h-4 w-4" />
                שמור תכנון
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {!isTestLesson && (
        <SkillSelectionModal
          open={showSkillSelect}
          onOpenChange={setShowSkillSelect}
          categories={categoriesForSelect}
          alreadySelected={[]}
          studentName={lesson.student.name}
          lessonNumber={0}
          onConfirm={handleAddSkills}
          confirmLabel="הוסף מיומנויות לתכנון"
        />
      )}
    </>
  );
}
