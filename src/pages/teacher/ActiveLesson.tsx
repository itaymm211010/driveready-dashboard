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
            <p className="text-xs text-muted-foreground font-body">
              ⏱️ <span className="font-mono text-foreground">{formatTimer(timer)}</span> &nbsp;•&nbsp; מיומנויות בשיעור: {selectedSkills.length}
            </p>
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
        {selectedSkills.length === 0 && hasStarted ? (
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
                    currentStatus={(localOverrides[skill.id] ?? skill.student_skill?.current_status ?? 'not_learned') as SkillStatus}
                    noteValue={notes[skill.id] || ''}
                    onStatusChange={handleStatusChange}
                    onNoteChange={handleNoteChange}
                    onShowHistory={setHistorySkill}
                    onRemove={handleRemoveSkill}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              variant="outline"
              className="w-full gap-2 border-dashed border-primary/30 hover:border-primary/60 transition-smooth"
              onClick={() => setShowSkillSelection(true)}
            >
              <Plus className="h-4 w-4" /> הוסף מיומנות נוספת
            </Button>
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
      />
    </div>
  );
}
