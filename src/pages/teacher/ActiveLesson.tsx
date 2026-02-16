import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { EndLessonModal } from '@/components/teacher/EndLessonModal';
import { SkillSelectionModal } from '@/components/teacher/SkillSelectionModal';
import { SkillHistoryModal } from '@/components/teacher/SkillHistoryModal';
import { LessonSkillCard } from '@/components/teacher/LessonSkillCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useLessonWithStudent, useStudentSkillTree } from '@/hooks/use-teacher-data';
import { useLessonPlannedSkills, useAddPlannedSkills, useRemovePlannedSkill } from '@/hooks/use-lesson-planned-skills';
import { useSaveLesson } from '@/hooks/use-save-lesson';
import type { DbSkill } from '@/hooks/use-teacher-data';
import type { SkillStatus } from '@/data/mock';

function formatTimer(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function ActiveLesson() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: lessonData, isLoading: lessonLoading } = useLessonWithStudent(id);
  const studentId = lessonData?.student?.id;
  const { data: dbCategories, isLoading: skillsLoading } = useStudentSkillTree(studentId);
  const { data: plannedSkills, isLoading: plannedLoading } = useLessonPlannedSkills(id);
  const addPlannedSkillsMutation = useAddPlannedSkills();
  const removePlannedSkillMutation = useRemovePlannedSkill();
  const saveLessonMutation = useSaveLesson();

  const [timer, setTimer] = useState(0);
  const [localOverrides, setLocalOverrides] = useState<Record<string, SkillStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showEndModal, setShowEndModal] = useState(false);
  const [showSkillSelection, setShowSkillSelection] = useState(false);
  const [showSkillSelectionInitial, setShowSkillSelectionInitial] = useState(false);
  const [historySkill, setHistorySkill] = useState<DbSkill | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Show initial selection if no planned skills yet
  useEffect(() => {
    if (!plannedLoading && plannedSkills && plannedSkills.length === 0 && !hasStarted) {
      setShowSkillSelectionInitial(true);
    } else if (plannedSkills && plannedSkills.length > 0) {
      setHasStarted(true);
    }
  }, [plannedSkills, plannedLoading, hasStarted]);

  const handleEndLesson = useCallback((method: 'cash' | 'receipt' | 'debt') => {
    if (!id || !studentId) return;
    saveLessonMutation.mutate({
      lessonId: id,
      studentId,
      paymentMethod: method,
      amount: Number(lessonData?.lesson?.amount ?? 0),
      skillOverrides: localOverrides,
      notes,
      durationSeconds: timer,
    });
  }, [id, studentId, localOverrides, notes, timer, saveLessonMutation, lessonData]);

  // Auto timer
  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = useCallback((skillId: string, newStatus: SkillStatus) => {
    setLocalOverrides((prev) => ({ ...prev, [skillId]: newStatus }));
  }, []);

  const handleNoteChange = useCallback((skillId: string, note: string) => {
    setNotes((prev) => ({ ...prev, [skillId]: note }));
  }, []);

  const handleInitialSelection = useCallback((skillIds: string[]) => {
    if (!id) return;
    addPlannedSkillsMutation.mutate({
      lessonId: id,
      skillIds,
      addedBeforeLesson: true,
    });
    setHasStarted(true);
    setShowSkillSelectionInitial(false);
  }, [id, addPlannedSkillsMutation]);

  const handleAddMoreSkills = useCallback((skillIds: string[]) => {
    if (!id) return;
    addPlannedSkillsMutation.mutate({
      lessonId: id,
      skillIds,
      addedBeforeLesson: false,
    });
  }, [id, addPlannedSkillsMutation]);

  const handleSkipSelection = useCallback(() => {
    setHasStarted(true);
    setShowSkillSelectionInitial(false);
  }, []);

  const handleRemoveSkill = useCallback((skillId: string) => {
    if (!id) return;
    removePlannedSkillMutation.mutate({ lessonId: id, skillId });
  }, [id, removePlannedSkillMutation]);

  // Build the selected skills list from planned skills + categories
  const selectedSkills = useMemo(() => {
    if (!dbCategories || !plannedSkills) return [];
    const plannedIds = new Set(plannedSkills.map(ps => ps.skill_id));
    const allSkills = dbCategories.flatMap(c => c.skills);
    return allSkills.filter(s => plannedIds.has(s.id));
  }, [dbCategories, plannedSkills]);

  const isLoading = lessonLoading || skillsLoading || plannedLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!lessonData?.lesson || !lessonData?.student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">שיעור לא נמצא.</p>
      </div>
    );
  }

  const { lesson, student } = lessonData;
  const categories = dbCategories ?? [];
  const allSkillsFlat = categories.flatMap(c => c.skills);
  const totalSkills = allSkillsFlat.length;
  const mastered = allSkillsFlat.filter(s => {
    const override = localOverrides[s.id];
    const status = override ?? s.student_skill?.current_status ?? 'not_learned';
    return status === 'mastered';
  }).length;
  const progressPct = totalSkills > 0 ? Math.round((mastered / totalSkills) * 100) : 0;
  const alreadySelectedIds = plannedSkills?.map(ps => ps.skill_id) ?? [];

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-card border-b px-4 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/teacher/today')}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">{student.name}</h1>
            <p className="text-xs text-muted-foreground">
              ⏱️ {formatTimer(timer)} &nbsp;•&nbsp; מיומנויות בשיעור: {selectedSkills.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={progressPct} className="h-2 flex-1" />
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            {mastered}/{totalSkills} נשלטו
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4">
        {selectedSkills.length === 0 && hasStarted ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <BookOpen className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">לא נבחרו מיומנויות עדיין</p>
            <Button onClick={() => setShowSkillSelection(true)} className="gap-2">
              <Plus className="h-4 w-4" /> הוסף מיומנות
            </Button>
          </div>
        ) : (
          <>
            {/* Section title */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                📚 מיומנויות להיום ({selectedSkills.length})
              </h2>
            </div>

            {/* Skill cards */}
            {selectedSkills.map(skill => (
              <LessonSkillCard
                key={skill.id}
                skill={skill}
                currentStatus={(localOverrides[skill.id] ?? skill.student_skill?.current_status ?? 'not_learned') as SkillStatus}
                noteValue={notes[skill.id] || ''}
                onStatusChange={handleStatusChange}
                onNoteChange={handleNoteChange}
                onShowHistory={setHistorySkill}
                onRemove={handleRemoveSkill}
              />
            ))}

            {/* Add more button */}
            <Button
              variant="outline"
              className="w-full gap-2 border-dashed"
              onClick={() => setShowSkillSelection(true)}
            >
              <Plus className="h-4 w-4" /> הוסף מיומנות נוספת
            </Button>
          </>
        )}
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-card border-t p-4 safe-area-bottom">
        <Button
          className="w-full min-h-[52px] text-base font-bold bg-success hover:bg-success/90 text-success-foreground"
          onClick={() => setShowEndModal(true)}
        >
          ✅ סיים שיעור וחייב
        </Button>
      </div>

      {/* Initial Skill Selection Modal */}
      <SkillSelectionModal
        open={showSkillSelectionInitial}
        onOpenChange={(open) => {
          if (!open) handleSkipSelection();
        }}
        categories={categories}
        alreadySelected={[]}
        studentName={student.name}
        lessonNumber={student.total_lessons + 1}
        onConfirm={handleInitialSelection}
        confirmLabel="התחל שיעור עם הנבחרים"
      />

      {/* Add More Skills Modal */}
      <SkillSelectionModal
        open={showSkillSelection}
        onOpenChange={setShowSkillSelection}
        categories={categories}
        alreadySelected={alreadySelectedIds}
        studentName={student.name}
        lessonNumber={student.total_lessons + 1}
        onConfirm={handleAddMoreSkills}
        confirmLabel="הוסף מיומנויות"
      />

      {/* Skill History Modal */}
      <SkillHistoryModal
        open={!!historySkill}
        onOpenChange={(open) => { if (!open) setHistorySkill(null); }}
        skill={historySkill}
      />

      {/* End Lesson Modal */}
      <EndLessonModal
        open={showEndModal}
        onOpenChange={setShowEndModal}
        duration={formatTimer(timer)}
        amount={Number(lesson.amount)}
        studentName={student.name}
        onPayment={handleEndLesson}
        isSaving={saveLessonMutation.isPending}
      />
    </div>
  );
}
