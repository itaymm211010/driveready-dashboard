import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SkillRow } from '@/components/teacher/SkillRow';
import { EndLessonModal } from '@/components/teacher/EndLessonModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useLessonWithStudent, useStudentSkillTree } from '@/hooks/use-teacher-data';
import type { DbSkillCategory } from '@/hooks/use-teacher-data';
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

  const [timer, setTimer] = useState(0);
  const [localOverrides, setLocalOverrides] = useState<Record<string, SkillStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showEndModal, setShowEndModal] = useState(false);

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

  if (lessonLoading || skillsLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!lessonData?.lesson || !lessonData?.student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Lesson not found.</p>
      </div>
    );
  }

  const { lesson, student } = lessonData;
  const categories: DbSkillCategory[] = dbCategories ?? [];

  // Build flat skill list with local overrides applied
  const allSkills = categories.flatMap((c) =>
    c.skills.map((s) => ({
      ...s,
      effectiveStatus: localOverrides[s.id] ?? s.student_skill?.current_status ?? 'not_learned',
    }))
  );

  const mastered = allSkills.filter((s) => s.effectiveStatus === 'mastered').length;
  const total = allSkills.length;
  const progressPct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const skillsPracticedToday = allSkills.filter(
    (s) => notes[s.id] || localOverrides[s.id]
  ).length;

  // Adapt DB skills to the Skill shape expected by SkillRow
  const toSkillRowData = (s: (typeof allSkills)[number]) => ({
    id: s.id,
    name: s.name,
    category: '',
    current_status: s.effectiveStatus as SkillStatus,
    times_practiced: s.student_skill?.times_practiced ?? 0,
    last_practiced_date: s.student_skill?.last_practiced_date ?? undefined,
    last_proficiency: s.student_skill?.last_proficiency ?? undefined,
    last_note: s.student_skill?.last_note ?? undefined,
    history: s.history.map((h) => ({
      lesson_id: h.id,
      lesson_number: h.lesson_number ?? 0,
      lesson_date: h.lesson_date,
      status: h.status as SkillStatus,
      proficiency_estimate: h.proficiency_estimate ?? undefined,
      teacher_note: h.teacher_note ?? undefined,
      practice_duration_minutes: h.practice_duration_minutes ?? undefined,
    })),
  });

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
              ⏱️ {formatTimer(timer)} &nbsp;•&nbsp; Today's Focus: {skillsPracticedToday} skills
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={progressPct} className="h-2 flex-1" />
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            {mastered}/{total} Mastered
          </span>
        </div>
      </header>

      {/* Skill Categories */}
      <main className="p-4 space-y-5">
        {categories.map((cat) => {
          const catSkills = cat.skills.map((s) => ({
            ...s,
            effectiveStatus: localOverrides[s.id] ?? s.student_skill?.current_status ?? 'not_learned',
          }));
          const catMastered = catSkills.filter((s) => s.effectiveStatus === 'mastered').length;
          const catTotal = catSkills.length;
          const catPct = catTotal > 0 ? Math.round((catMastered / catTotal) * 100) : 0;

          return (
            <section key={cat.id}>
              <div className="sticky top-[105px] z-30 bg-background py-2">
                <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                  <span className="font-semibold text-sm text-foreground">
                    {cat.icon} {cat.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {catMastered}/{catTotal} ({catPct}%)
                  </span>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                {catSkills.map((skill) => (
                  <SkillRow
                    key={skill.id}
                    skill={toSkillRowData(skill)}
                    onStatusChange={handleStatusChange}
                    onNoteChange={handleNoteChange}
                    noteValue={notes[skill.id] || ''}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-card border-t p-4 safe-area-bottom">
        <Button
          className="w-full min-h-[52px] text-base font-bold bg-success hover:bg-success/90 text-success-foreground"
          onClick={() => setShowEndModal(true)}
        >
          ✅ End Lesson & Bill
        </Button>
      </div>

      <EndLessonModal
        open={showEndModal}
        onOpenChange={setShowEndModal}
        duration={formatTimer(timer)}
        amount={Number(lesson.amount)}
        studentName={student.name}
      />
    </div>
  );
}
