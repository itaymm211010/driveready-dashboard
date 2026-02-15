import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, TrendingUp, Wallet, BookOpen, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useStudentProfile } from '@/hooks/use-student-profile';
import { BottomNav } from '@/components/teacher/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  mastered: { label: 'Mastered', color: 'bg-success text-success-foreground', icon: <CheckCircle className="h-3 w-3" /> },
  in_progress: { label: 'In Progress', color: 'bg-warning text-warning-foreground', icon: <Clock className="h-3 w-3" /> },
  not_learned: { label: 'Not Learned', color: 'bg-muted text-muted-foreground', icon: <AlertTriangle className="h-3 w-3" /> },
};

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useStudentProfile(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24 p-4 space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-60 w-full rounded-xl" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Student not found.</p>
      </div>
    );
  }

  const { student, lessons, skillTree } = data;
  const hasDebt = student.balance < 0;
  const completedLessons = lessons.filter((l) => l.status === 'completed');
  const totalSkills = skillTree.reduce((sum, cat) => sum + cat.skills.length, 0);
  const masteredSkills = skillTree.reduce(
    (sum, cat) => sum + cat.skills.filter((s) => s.studentSkill?.current_status === 'mastered').length,
    0
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">{student.name}</h1>
            <p className="text-xs text-muted-foreground">{student.phone ?? 'No phone'}</p>
          </div>
          <div className="flex gap-1">
            {student.phone && (
              <>
                <Button variant="outline" size="icon" onClick={() => window.open(`tel:${student.phone}`)}>
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => window.open(`https://wa.me/${student.phone?.replace(/\D/g, '')}`)}>
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-foreground">{student.readiness_percentage}%</p>
              <p className="text-xs text-muted-foreground">Readiness</p>
            </CardContent>
          </Card>
          <Card className={cn(hasDebt && 'border-destructive/50 border-2')}>
            <CardContent className="p-3 text-center">
              <Wallet className="h-5 w-5 mx-auto mb-1" style={{ color: hasDebt ? 'hsl(var(--destructive))' : 'hsl(var(--primary))' }} />
              <p className={cn('text-2xl font-bold', hasDebt ? 'text-destructive' : 'text-foreground')}>
                ₪{Math.abs(student.balance)}
              </p>
              <p className="text-xs text-muted-foreground">{hasDebt ? 'Owes' : 'Balance'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <BookOpen className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-foreground">{student.total_lessons}</p>
              <p className="text-xs text-muted-foreground">Lessons</p>
            </CardContent>
          </Card>
        </div>

        {/* Skill Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              Skill Breakdown
              <span className="text-sm font-normal text-muted-foreground">
                {masteredSkills}/{totalSkills} mastered
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={totalSkills > 0 ? (masteredSkills / totalSkills) * 100 : 0} className="h-2" />

            {skillTree.map((category) => {
              const catMastered = category.skills.filter((s) => s.studentSkill?.current_status === 'mastered').length;
              return (
                <div key={category.id}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground">
                      {category.icon} {category.name}
                    </p>
                    <span className="text-xs text-muted-foreground">{catMastered}/{category.skills.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {category.skills.map((skill) => {
                      const status = skill.studentSkill?.current_status ?? 'not_learned';
                      const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_learned;
                      return (
                        <Badge key={skill.id} variant="outline" className={cn('gap-1 text-xs', cfg.color)}>
                          {cfg.icon}
                          {skill.name}
                        </Badge>
                      );
                    })}
                  </div>
                  <Separator className="mt-3" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Lesson History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Lesson History</CardTitle>
          </CardHeader>
          <CardContent>
            {lessons.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No lessons yet.</p>
            ) : (
              <div className="space-y-3">
                {lessons.slice(0, 20).map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
                    onClick={() => lesson.status === 'completed' ? null : navigate(`/teacher/lesson/${lesson.id}`)}
                  >
                    <div className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold',
                      lesson.status === 'completed' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
                    )}>
                      {lesson.status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(lesson.date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.time_start} – {lesson.time_end}
                        {lesson.skills_practiced?.length ? ` · ${lesson.skills_practiced.length} skills` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">₪{lesson.amount}</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] px-1.5',
                          lesson.payment_status === 'paid' ? 'text-success border-success/30' : 'text-warning border-warning/30'
                        )}
                      >
                        {lesson.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
