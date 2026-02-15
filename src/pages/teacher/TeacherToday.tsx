import { format } from 'date-fns';
import { getTodayLessonsWithStudents } from '@/data/mock';
import { LessonCard } from '@/components/teacher/LessonCard';
import { BottomNav } from '@/components/teacher/BottomNav';

export default function TeacherToday() {
  const lessonsWithStudents = getTodayLessonsWithStudents();
  const today = new Date();
  const totalExpected = lessonsWithStudents.reduce((sum, l) => sum + l.amount, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              🚗 DRIVEKAL
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(today, 'EEEE, MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <span className="text-lg">📊</span>
            <div>
              <p className="text-xs text-muted-foreground">Lessons</p>
              <p className="text-sm font-bold">{lessonsWithStudents.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <span className="text-lg">💰</span>
            <div>
              <p className="text-xs text-muted-foreground">Expected</p>
              <p className="text-sm font-bold">₪{totalExpected.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Lesson List */}
      <main className="p-4 space-y-3">
        {lessonsWithStudents.map((item) => (
          <LessonCard
            key={item.id}
            lesson={item}
            student={item.student}
          />
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
