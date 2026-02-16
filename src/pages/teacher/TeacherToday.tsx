import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, TrendingUp, CheckCircle, AlertTriangle, CalendarDays } from 'lucide-react';
import { LessonCard } from '@/components/teacher/LessonCard';
import { BottomNav } from '@/components/teacher/BottomNav';
import { AddLessonModal } from '@/components/teacher/AddLessonModal';
import { useTodayLessons } from '@/hooks/use-teacher-data';
import { useMonthlySummary } from '@/hooks/use-monthly-summary';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function TeacherToday() {
  const { data: lessonsWithStudents, isLoading } = useTodayLessons();
  const { data: monthly, isLoading: monthlyLoading } = useMonthlySummary();
  const [showAddLesson, setShowAddLesson] = useState(false);
  const today = new Date();
  const totalExpected = (lessonsWithStudents ?? []).reduce((sum, l) => sum + Number(l.amount), 0);

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
              <p className="text-sm font-bold">{isLoading ? '…' : (lessonsWithStudents?.length ?? 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <span className="text-lg">💰</span>
            <div>
              <p className="text-xs text-muted-foreground">Expected</p>
              <p className="text-sm font-bold">₪{isLoading ? '…' : totalExpected.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Lesson List */}
      <main className="p-4 space-y-3">
        {/* Monthly Summary */}
        <Card className="border-none shadow-md bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {monthlyLoading ? 'Loading...' : monthly?.monthLabel}
            </h2>
            {monthlyLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card rounded-lg p-3 flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lessons</p>
                    <p className="text-lg font-bold text-foreground">{monthly?.completedLessons}/{monthly?.totalLessons}</p>
                  </div>
                </div>
                <div className="bg-card rounded-lg p-3 flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-green-500/15 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Income</p>
                    <p className="text-lg font-bold text-foreground">₪{monthly?.totalIncome.toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-card rounded-lg p-3 flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-green-500/15 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Paid</p>
                    <p className="text-lg font-bold text-foreground">₪{monthly?.paidIncome.toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-card rounded-lg p-3 flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-destructive/15 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Debt</p>
                    <p className="text-lg font-bold text-foreground">₪{monthly?.debtAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))
        ) : (lessonsWithStudents ?? []).length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No lessons scheduled for today.</p>
        ) : (
          (lessonsWithStudents ?? []).map((item) => (
            <LessonCard
              key={item.id}
              lesson={item}
              student={item.student}
            />
          ))
        )}
      </main>

      {/* FAB */}
      <Button
        size="icon"
        className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setShowAddLesson(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddLessonModal open={showAddLesson} onOpenChange={setShowAddLesson} />
      <BottomNav />
    </div>
  );
}
