import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FontSizeSelector } from '@/components/FontSizeSelector';
import type { DbSkill } from '@/hooks/use-teacher-data';
import type { SkillScore } from '@/lib/scoring';

function formatTimer(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getTimerColor(elapsedSeconds: number, scheduledMinutes: number | null): string {
  if (!scheduledMinutes) return 'text-foreground';
  const scheduledSeconds = scheduledMinutes * 60;
  const ratio = elapsedSeconds / scheduledSeconds;
  if (ratio >= 1) return 'text-destructive';
  if (ratio >= 0.85) return 'text-warning';
  return 'text-success';
}

function getRemainingText(elapsedSeconds: number, scheduledMinutes: number | null): string | null {
  if (!scheduledMinutes) return null;
  const scheduledSeconds = scheduledMinutes * 60;
  const diff = scheduledSeconds - elapsedSeconds;
  const absMins = Math.abs(Math.floor(diff / 60));
  if (diff > 0) return `נותרו ${absMins} דקות`;
  if (diff === 0) return 'הזמן המתוכנן תם';
  return `חריגה של ${absMins} דקות`;
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
  const [localOverrides, setLocalOverrides] = useState<Record<string, SkillScore>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showEndModal, setShowEndModal] = useState(false);
  const [showSkillSelection, setShowSkillSelection] = useState(false);
  const [showSkillSelectionInitial, setShowSkillSelectionInitial] = useState(false);
  const [historySkill, setHistorySkill] = useState<DbSkill | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Derive time tracking data from lesson
  const actualStartTime = (lessonData?.lesson as any)?.actual_start_time
    ? new Date((lessonData?.lesson as any).actual_start_time)
    : null;
  const scheduledMinutes = (lessonData?.lesson as any)?.scheduled_duration_minutes as number | null ?? null;
  const scheduledEndTime = useMemo(() => {
    if (!lessonData?.lesson) return null;
    const { time_end } = lessonData.lesson;
    return time_end;
  }, [lessonData?.lesson]);

  const startedAtDisplay = actualStartTime
    ? actualStartTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    : null;

  // Timer based on actual_start_time
  useEffect(() => {
    if (!actualStartTime) {
      // Fallback: simple timer
      const interval = setInterval(() => setTimer((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - actualStartTime.getTime()) / 1000);
      setTimer(Math.max(0, elapsed));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [actualStartTime]);

  // Detect test lesson type from notes
  const lessonNotes = lessonData?.lesson?.notes ?? '';
  const isTestLessonEarly = lessonNotes.startsWith('[טסט פנימי]') || lessonNotes.startsWith('[טסט חיצוני]');

  // Show initial selection if no planned skills yet (skip for test lessons)
  useEffect(() => {
    if (isTestLessonEarly) {
      setHasStarted(true);
      setShowSkillSelectionInitial(false);
      return;
    }
    if (!plannedLoading && plannedSkills && plannedSkills.length === 0 && !hasStarted) {
      setShowSkillSelectionInitial(true);
    } else if (plannedSkills && plannedSkills.length > 0) {
      setHasStarted(true);
    }
  }, [plannedSkills, plannedLoading, hasStarted, isTestLessonEarly]);

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

  const handleScoreChange = useCallback((skillId: string, newScore: SkillScore) => {
    setLocalOverrides((prev) => ({ ...prev, [skillId]: newScore }));
  }, []);

  const handleNoteChange = useCallback((skillId: string, note: string) => {
    setNotes((prev) => ({ ...prev, [skillId]: note }));
  }, []);

  const handleInitialSelection = useCallback((skillIds: string[]) => {
    if (!id) return;
    addPlannedSkillsMutation.mutate({ lessonId: id, skillIds, addedBeforeLesson: true });
    setHasStarted(true);
    setShowSkillSelectionInitial(false);
  }, [id, addPlannedSkillsMutation]);

  const handleAddMoreSkills = useCallback((skillIds: string[]) => {
    if (!id) return;
    addPlannedSkillsMutation.mutate({ lessonId: id, skillIds, addedBeforeLesson: false });
  }, [id, addPlannedSkillsMutation]);

  const handleSkipSelection = useCallback(() => {
    setHasStarted(true);
    setShowSkillSelectionInitial(false);
  }, []);

  const handleRemoveSkill = useCallback((skillId: string) => {
    if (!id) return;
    removePlannedSkillMutation.mutate({ lessonId: id, skillId });
  }, [id, removePlannedSkillMutation]);

  const selectedSkills = useMemo(() => {
    if (!dbCategories || !plannedSkills) return [];
    const plannedIds = new Set(plannedSkills.map(ps => ps.skill_id));
    const allSkills = dbCategories.flatMap(c => c.skills);
    return allSkills.filter(s => plannedIds.has(s.id));
  }, [dbCategories, plannedSkills]);

  const isLoading = lessonLoading || skillsLoading || plannedLoading;

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-screen bg-background p-4 space-y-4">
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
        <p className="text-muted-foreground font-body">שיעור לא נמצא.</p>
      </div>
    );
  }

  const { lesson, student } = lessonData;
  const isTestLesson = lesson.notes?.startsWith('[טסט פנימי]') || lesson.notes?.startsWith('[טסט חיצוני]');
  const categories = dbCategories ?? [];
  const allSkillsFlat = categories.flatMap(c => c.skills);
  const totalSkills = allSkillsFlat.length;
  const mastered = allSkillsFlat.filter(s => {
    const override = localOverrides[s.id];
    const score = override ?? s.student_skill?.current_score ?? 0;
    return score >= 4;
  }).length;
  const progressPct = totalSkills > 0 ? Math.round((mastered / totalSkills) * 100) : 0;
  const alreadySelectedIds = plannedSkills?.map(ps => ps.skill_id) ?? [];

  const timerColor = getTimerColor(timer, scheduledMinutes);
  const remainingText = getRemainingText(timer, scheduledMinutes);

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-28">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border/50 px-4 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/teacher/today')}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-muted transition-smooth"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-heading font-bold text-foreground truncate">{student.name}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-body flex-wrap">
              <span className={cn('font-mono text-sm font-bold', timerColor)}>
                ⏱️ {formatTimer(timer)}
              </span>
              {startedAtDisplay && (
                <span>התחלה: {startedAtDisplay}</span>
              )}
              {scheduledEndTime && (
                <span>סיום מתוכנן: {scheduledEndTime}</span>
              )}
            </div>
            {remainingText && (
              <p className={cn('text-xs font-body font-medium', timerColor)}>
                {remainingText}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <FontSizeSelector />
            <ThemeToggle />
            <span className="text-xs text-muted-foreground whitespace-nowrap mr-1">
              מיומנויות: {selectedSkills.length}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={progressPct} className="h-2.5 flex-1" />
          <span className="text-xs font-heading font-semibold text-muted-foreground whitespace-nowrap">
            {mastered}/{totalSkills} נשלטו
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4">
        {isTestLesson ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-primary/60" />
            </div>
            <p className="text-lg font-heading font-bold text-foreground">
              {lesson.notes?.startsWith('[טסט פנימי]') ? 'טסט פנימי' : 'טסט חיצוני'}
            </p>
            <p className="text-muted-foreground font-body">בחירת מיומנויות לא זמינה בשיעור טסט</p>
          </div>
        ) : selectedSkills.length === 0 && hasStarted ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-body">לא נבחרו מיומנויות עדיין</p>
            <Button onClick={() => setShowSkillSelection(true)} className="gap-2 shimmer">
              <Plus className="h-4 w-4" /> הוסף מיומנות
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-heading font-semibold text-foreground">
                📚 מיומנויות להיום ({selectedSkills.length})
              </h2>
            </div>

            <AnimatePresence mode="popLayout">
              {selectedSkills.map(skill => (
                <motion.div
                  key={skill.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -50 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <LessonSkillCard
                    skill={skill}
                    currentScore={(localOverrides[skill.id] ?? (skill.student_skill?.current_score as SkillScore) ?? 0) as SkillScore}
                    noteValue={notes[skill.id] || ''}
                    onScoreChange={handleScoreChange}
                    onNoteChange={handleNoteChange}
                    onShowHistory={setHistorySkill}
                    onRemove={handleRemoveSkill}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {!isTestLesson && (
              <Button
                variant="outline"
                className="w-full gap-2 border-dashed border-primary/30 hover:border-primary/60 transition-smooth"
                onClick={() => setShowSkillSelection(true)}
              >
                <Plus className="h-4 w-4" /> הוסף מיומנות נוספת
              </Button>
            )}
          </>
        )}
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 nav-glass border-t border-border/50 p-4 safe-area-bottom">
        <Button
          className="w-full min-h-[52px] text-base font-heading font-bold bg-success hover:bg-success/90 text-success-foreground glow-primary transition-smooth"
          onClick={() => setShowEndModal(true)}
        >
          ✅ סיים שיעור וחייב
        </Button>
      </div>

      <SkillSelectionModal
        open={showSkillSelectionInitial}
        onOpenChange={(open) => { if (!open) handleSkipSelection(); }}
        categories={categories}
        alreadySelected={[]}
        studentName={student.name}
        lessonNumber={student.total_lessons + 1}
        onConfirm={handleInitialSelection}
        confirmLabel="התחל שיעור עם הנבחרים"
      />

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

      <SkillHistoryModal
        open={!!historySkill}
        onOpenChange={(open) => { if (!open) setHistorySkill(null); }}
        skill={historySkill}
      />

      <EndLessonModal
        open={showEndModal}
        onOpenChange={setShowEndModal}
        duration={formatTimer(timer)}
        amount={Number(lesson.amount)}
        studentName={student.name}
        onPayment={handleEndLesson}
        isSaving={saveLessonMutation.isPending}
        startedAt={startedAtDisplay}
        scheduledEnd={scheduledEndTime}
        scheduledMinutes={scheduledMinutes}
        elapsedSeconds={timer}
      />
    </div>
  );
}
