import { useState } from 'react';
import { format, subMonths, addMonths, isSameMonth } from 'date-fns';
import { Plus, TrendingUp, CheckCircle, AlertTriangle, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { LessonCard } from '@/components/teacher/LessonCard';
import { BottomNav } from '@/components/teacher/BottomNav';
import { AddLessonModal } from '@/components/teacher/AddLessonModal';
import { useTodayLessons } from '@/hooks/use-teacher-data';
import { useMonthlySummary } from '@/hooks/use-monthly-summary';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FontSizeSelector } from '@/components/FontSizeSelector';

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function TeacherToday() {
  const { data: lessonsWithStudents, isLoading } = useTodayLessons();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { data: monthly, isLoading: monthlyLoading } = useMonthlySummary(selectedMonth);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const today = new Date();
  const isCurrentMonth = isSameMonth(selectedMonth, today);
  const totalExpected = (lessonsWithStudents ?? []).reduce((sum, l) => sum + Number(l.amount), 0);

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border/50 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
              🚗 DRIVEKAL
            </h1>
            <p className="text-sm text-muted-foreground font-body">
              {format(today, 'EEEE, MMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <FontSizeSelector />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex gap-3 mt-3">
          <div className="flex items-center gap-2.5 bg-primary/10 border border-primary/20 rounded-xl px-3.5 py-2.5 transition-smooth">
            <span className="text-lg">📊</span>
            <div>
              <p className="text-[0.625rem] uppercase tracking-wider text-muted-foreground font-medium">שיעורים</p>
              <p className="text-base font-heading font-bold text-foreground">{isLoading ? '…' : (lessonsWithStudents?.length ?? 0)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-success/10 border border-success/20 rounded-xl px-3.5 py-2.5 transition-smooth">
            <span className="text-lg">💰</span>
            <div>
              <p className="text-[0.625rem] uppercase tracking-wider text-muted-foreground font-medium">צפוי</p>
              <p className="text-base font-heading font-bold text-foreground">₪{isLoading ? '…' : totalExpected.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Lesson List */}
      <main className="p-4 space-y-4">
        {/* Monthly Summary */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <Card className="border-none shadow-lg card-premium overflow-hidden bg-gradient-to-br from-primary/8 via-card to-secondary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setSelectedMonth((m) => subMonths(m, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-sm font-heading font-semibold text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {monthlyLoading ? 'טוען...' : monthly?.monthLabel}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  disabled={isCurrentMonth}
                  onClick={() => setSelectedMonth((m) => addMonths(m, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              {monthlyLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass rounded-xl p-3 flex items-center gap-2.5 transition-smooth hover:scale-[1.02]">
                      <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center">
                        <CalendarDays className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[0.625rem] uppercase tracking-wider text-muted-foreground">שיעורים</p>
                        <p className="text-lg font-heading font-bold text-foreground">{monthly?.completedLessons}/{monthly?.totalLessons}</p>
                      </div>
                    </div>
                    <div className="glass rounded-xl p-3 flex items-center gap-2.5 transition-smooth hover:scale-[1.02]">
                      <div className="h-9 w-9 rounded-full bg-success/15 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="text-[0.625rem] uppercase tracking-wider text-muted-foreground">הכנסה</p>
                        <p className="text-lg font-heading font-bold text-foreground">₪{monthly?.totalIncome.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="glass rounded-xl p-3 flex items-center gap-2.5 transition-smooth hover:scale-[1.02]">
                      <div className="h-9 w-9 rounded-full bg-success/15 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="text-[0.625rem] uppercase tracking-wider text-muted-foreground">שולם</p>
                        <p className="text-lg font-heading font-bold text-foreground">₪{monthly?.paidIncome.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="glass rounded-xl p-3 flex items-center gap-2.5 transition-smooth hover:scale-[1.02]">
                      <div className="h-9 w-9 rounded-full bg-destructive/15 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <p className="text-[0.625rem] uppercase tracking-wider text-muted-foreground">חוב</p>
                        <p className="text-lg font-heading font-bold text-destructive">₪{monthly?.debtAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  {((monthly?.internalTests ?? 0) > 0 || (monthly?.externalTests ?? 0) > 0) && (
                    <div className="flex gap-3 mt-3">
                      {(monthly?.internalTests ?? 0) > 0 && (
                        <div className="glass rounded-xl px-3 py-1.5 text-xs font-body text-muted-foreground">
                          טסט פנימי: <span className="font-heading font-bold text-foreground">{monthly?.internalTests}</span>
                        </div>
                      )}
                      {(monthly?.externalTests ?? 0) > 0 && (
                        <div className="glass rounded-xl px-3 py-1.5 text-xs font-body text-muted-foreground">
                          טסט חיצוני: <span className="font-heading font-bold text-foreground">{monthly?.externalTests}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))
        ) : (lessonsWithStudents ?? []).length === 0 ? (
          <p className="text-center text-muted-foreground py-12 font-body">אין שיעורים מתוזמנים להיום.</p>
        ) : (
          (lessonsWithStudents ?? []).map((item, i) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i + 1}
            >
              <LessonCard lesson={item} student={item.student} />
            </motion.div>
          ))
        )}
      </main>

      {/* FAB */}
      <Button
        size="icon"
        className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full shadow-lg glow-primary animate-pulse-glow"
        onClick={() => setShowAddLesson(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddLessonModal open={showAddLesson} onOpenChange={setShowAddLesson} />
      <BottomNav />
    </div>
  );
}
