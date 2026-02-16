import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, TrendingUp, Wallet, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/teacher/BottomNav';
import { CircularProgress } from '@/components/shared/CircularProgress';
import { AddStudentModal } from '@/components/teacher/AddStudentModal';
import { useStudentsList } from '@/hooks/use-students-list';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function StudentsList() {
  const { data: students, isLoading } = useStudentsList();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!students) return [];
    if (!search.trim()) return students;
    const q = search.trim().toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
    );
  }, [students, search]);

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border/50 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-heading font-bold text-foreground tracking-tight">
            👥 תלמידים
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" onClick={() => setShowAdd(true)} className="shimmer gap-1">
              <Plus className="h-4 w-4" /> הוסף
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חפש לפי שם, טלפון או אימייל…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/50 border-border/50 focus:border-primary/50 transition-smooth"
          />
        </div>
      </header>

      {/* Student List */}
      <main className="p-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 font-body">
            {search ? 'לא נמצאו תלמידים תואמים.' : 'אין תלמידים עדיין.'}
          </p>
        ) : (
          filtered.map((student, i) => {
            const hasDebt = student.balance < 0;
            return (
              <motion.div
                key={student.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i}
              >
                <Card
                  className={cn(
                    "p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-smooth card-premium overflow-hidden",
                    hasDebt && "border-destructive/30 border"
                  )}
                  onClick={() => navigate(`/teacher/student/${student.id}`)}
                >
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                    {student.avatar_url ? (
                      <img
                        src={student.avatar_url}
                        alt={student.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-primary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-foreground truncate">{student.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 font-body">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {student.total_lessons} שיעורים
                      </span>
                      <span
                        className={cn('flex items-center gap-1', hasDebt && 'text-destructive font-medium')}
                      >
                        <Wallet className="h-3 w-3" />
                        ₪{student.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Readiness */}
                  <CircularProgress
                    value={student.readiness_percentage}
                    size={44}
                    strokeWidth={4}
                  />
                </Card>
              </motion.div>
            );
          })
        )}
      </main>

      <AddStudentModal open={showAdd} onOpenChange={setShowAdd} />
      <BottomNav />
    </div>
  );
}
