import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SkillRow } from '@/components/teacher/SkillRow';
import { EndLessonModal } from '@/components/teacher/EndLessonModal';
import { mockTodayLessons, mockStudents, mockSkillCategories } from '@/data/mock';
import type { SkillStatus, SkillCategory } from '@/data/mock';

function formatTimer(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function ActiveLesson() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const lesson = mockTodayLessons.find((l) => l.id === id);
  const student = lesson ? mockStudents.find((s) => s.id === lesson.student_id) : null;

  const [timer, setTimer] = useState(0);
  const [categories, setCategories] = useState<SkillCategory[]>(() =>
    JSON.parse(JSON.stringify(mockSkillCategories))
  );
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showEndModal, setShowEndModal] = useState(false);

  // Auto timer
  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = useCallback((skillId: string, newStatus: SkillStatus) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        skills: cat.skills.map((s) =>
          s.id === skillId ? { ...s, current_status: newStatus } : s
        ),
      }))
    );
  }, []);

  const handleNoteChange = useCallback((skillId: string, note: string) => {
    setNotes((prev) => ({ ...prev, [skillId]: note }));
  }, []);

  if (!lesson || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Lesson not found.</p>
      </div>
    );
  }

  // Stats
  const allSkills = categories.flatMap((c) => c.skills);
  const mastered = allSkills.filter((s) => s.current_status === 'mastered').length;
  const total = allSkills.length;
  const progressPct = Math.round((mastered / total) * 100);
  const skillsPracticedToday = allSkills.filter(
    (s) => notes[s.id] || s.current_status !== mockSkillCategories
      .flatMap((c) => c.skills)
      .find((ms) => ms.id === s.id)?.current_status
  ).length;

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
          const catMastered = cat.skills.filter((s) => s.current_status === 'mastered').length;
          const catTotal = cat.skills.length;
          const catPct = Math.round((catMastered / catTotal) * 100);

          return (
            <section key={cat.id}>
              {/* Sticky Category Header */}
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

              {/* Skills */}
              <div className="space-y-2 mt-2">
                {cat.skills.map((skill) => (
                  <SkillRow
                    key={skill.id}
                    skill={skill}
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

      {/* End Lesson Modal */}
      <EndLessonModal
        open={showEndModal}
        onOpenChange={setShowEndModal}
        duration={formatTimer(timer)}
        amount={lesson.amount}
        studentName={student.name}
      />
    </div>
  );
}
