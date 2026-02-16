import { useState } from 'react';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { he } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/teacher/BottomNav';
import { ViewSwitcher } from '@/components/teacher/calendar/ViewSwitcher';
import { DayView } from '@/components/teacher/calendar/DayView';
import { WeekView } from '@/components/teacher/calendar/WeekView';
import { MonthView } from '@/components/teacher/calendar/MonthView';
import { LessonDetailsModal } from '@/components/teacher/LessonDetailsModal';
import { EditLessonModal } from '@/components/teacher/EditLessonModal';
import { CancelLessonModal } from '@/components/teacher/CancelLessonModal';
import { AddLessonModal } from '@/components/teacher/AddLessonModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useCalendarLessons, type CalendarView, type CalendarLesson } from '@/hooks/use-calendar-lessons';
import { Skeleton } from '@/components/ui/skeleton';

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>('day');
  const [date, setDate] = useState(new Date());
  const { data, isLoading } = useCalendarLessons(view, date);

  const [selectedLesson, setSelectedLesson] = useState<CalendarLesson | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addPrefilledTime, setAddPrefilledTime] = useState('');

  // RTL: In Hebrew, "next" goes left and "previous" goes right
  const navigateForward = () => {
    const fns = { day: addDays, week: addWeeks, month: addMonths };
    setDate(d => fns[view](d, 1));
  };
  const navigateBack = () => {
    const fns = { day: subDays, week: subWeeks, month: subMonths };
    setDate(d => fns[view](d, 1));
  };

  const headerLabel = () => {
    switch (view) {
      case 'day': return format(date, 'EEEE, d MMMM', { locale: he });
      case 'week': return `שבוע ${format(date, 'wo', { locale: he })} - ${format(date, 'MMMM yyyy', { locale: he })}`;
      case 'month': return format(date, 'MMMM yyyy', { locale: he });
    }
  };

  const handleLessonClick = (lesson: CalendarLesson) => {
    setSelectedLesson(lesson);
    setShowDetails(true);
  };

  const handleEmptySlotClick = (time: string) => {
    setAddPrefilledTime(time);
    setShowAdd(true);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* RTL: Right chevron goes forward (next), Left chevron goes back (previous) */}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigateForward}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h1 className="text-sm font-heading font-bold text-foreground">{headerLabel()}</h1>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigateBack}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setDate(new Date())}>
              היום
            </Button>
            <ThemeToggle />
          </div>
        </div>
        <ViewSwitcher view={view} onViewChange={setView} />
      </header>

      {/* Content */}
      <main className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={view + date.toISOString()} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {view === 'day' && (
                <DayView
                  date={date}
                  lessons={data?.lessons ?? []}
                  onLessonClick={handleLessonClick}
                  onEmptySlotClick={handleEmptySlotClick}
                />
              )}
              {view === 'week' && (
                <WeekView
                  date={date}
                  lessons={data?.lessons ?? []}
                  onLessonClick={handleLessonClick}
                  onEmptySlotClick={(d, t) => { setDate(d); handleEmptySlotClick(t); }}
                />
              )}
              {view === 'month' && (
                <MonthView
                  date={date}
                  lessons={data?.lessons ?? []}
                  onDayClick={(d) => { setDate(d); setView('day'); }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* FAB - RTL: position on left side */}
      <Button
        size="icon"
        className="fixed bottom-24 left-6 z-50 h-14 w-14 rounded-full shadow-lg glow-primary"
        onClick={() => { setAddPrefilledTime(''); setShowAdd(true); }}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Modals */}
      <LessonDetailsModal
        lesson={selectedLesson}
        open={showDetails}
        onOpenChange={setShowDetails}
        onEdit={(l) => { setSelectedLesson(l); setShowEdit(true); }}
        onCancel={(l) => { setSelectedLesson(l); setShowCancel(true); }}
      />
      <EditLessonModal lesson={selectedLesson} open={showEdit} onOpenChange={setShowEdit} />
      <CancelLessonModal lesson={selectedLesson} open={showCancel} onOpenChange={setShowCancel} />
      <AddLessonModal open={showAdd} onOpenChange={setShowAdd} />

      <BottomNav />
    </div>
  );
}
