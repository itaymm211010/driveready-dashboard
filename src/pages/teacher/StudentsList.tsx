import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, TrendingUp, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomNav } from '@/components/teacher/BottomNav';
import { CircularProgress } from '@/components/shared/CircularProgress';
import { useStudentsList } from '@/hooks/use-students-list';

export default function StudentsList() {
  const { data: students, isLoading } = useStudentsList();
  const [search, setSearch] = useState('');
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b px-4 py-4">
        <h1 className="text-xl font-bold text-foreground tracking-tight mb-3">
          👥 Students
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
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
          <p className="text-center text-muted-foreground py-12">
            {search ? 'No students match your search.' : 'No students yet.'}
          </p>
        ) : (
          filtered.map((student) => {
            const hasDebt = student.balance < 0;
            return (
              <Card
                key={student.id}
                className="p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => navigate(`/teacher/student/${student.id}`)}
              >
                {/* Avatar */}
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
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
                  <p className="font-semibold text-foreground truncate">{student.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {student.total_lessons} lessons
                    </span>
                    <span
                      className={`flex items-center gap-1 ${hasDebt ? 'text-destructive font-medium' : ''}`}
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
            );
          })
        )}
      </main>

      <BottomNav />
    </div>
  );
}
