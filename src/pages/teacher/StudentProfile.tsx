import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, TrendingUp, Wallet, BookOpen, CheckCircle, Clock, AlertTriangle, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useStudentProfile } from '@/hooks/use-student-profile';
import { BottomNav } from '@/components/teacher/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { EditStudentModal } from '@/components/teacher/EditStudentModal';
import { DeleteStudentDialog } from '@/components/teacher/DeleteStudentDialog';
import { AddLessonModal } from '@/components/teacher/AddLessonModal';
import { SkillHistoryModal } from '@/components/teacher/SkillHistoryModal';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  mastered: { label: 'Mastered', color: 'bg-success/15 text-success border-success/30', icon: <CheckCircle className="h-3 w-3" /> },
  in_progress: { label: 'In Progress', color: 'bg-warning/15 text-warning border-warning/30', icon: <Clock className="h-3 w-3" /> },
  not_learned: { label: 'Not Learned', color: 'bg-muted text-muted-foreground border-border', icon: <AlertTriangle className="h-3 w-3" /> },
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useStudentProfile(id);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [historySkill, setHistorySkill] = useState<any>(null);

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
        <p className="text-muted-foreground font-body">Student not found.</p>
      </div>
    );
  }

  const { student, lessons, skillTree } = data;
  const hasDebt = student.balance < 0;
  const totalSkills = skillTree.reduce((sum, cat) => sum + cat.skills.length, 0);
  const masteredSkills = skillTree.reduce(
    (sum, cat) => sum + cat.skills.filter((s) => s.studentSkill?.current_status === 'mastered').length,
    0
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-heading font-bold text-foreground truncate">{student.name}</h1>
            <p className="text-xs text-muted-foreground font-body">{student.phone ?? 'No phone'}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9" onClick={() => setShowEdit(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9 text-destructive hover:text-destructive" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9" onClick={() => navigate(`/student/${id}/report`)}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            {student.phone && (
              <>
                <Button variant="outline" size="icon" className="rounded-full h-9 w-9" onClick={() => window.open(`tel:${student.phone}`)}>
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-9 w-9" onClick={() => window.open(`https://wa.me/${student.phone?.replace(/\D/g, '')}`)}>
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Stats Row */}
        <motion.div className="grid grid-cols-3 gap-3" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <Card className="card-premium overflow-hidden">
            <CardContent className="p-3 text-center">
              <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-1.5">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">{student.readiness_percentage}%</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Readiness</p>
            </CardContent>
          </Card>
          <Card className={cn('overflow-hidden', hasDebt && 'border-destructive/40 border-2')}>
            <CardContent className="p-3 text-center">
              <div className={cn("h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-1.5", hasDebt ? "bg-destructive/15" : "bg-primary/15")}>
                <Wallet className="h-5 w-5" style={{ color: hasDebt ? 'hsl(var(--destructive))' : 'hsl(var(--primary))' }} />
              </div>
              <p className={cn('text-2xl font-heading font-bold', hasDebt ? 'text-destructive' : 'text-foreground')}>
                ₪{Math.abs(student.balance)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{hasDebt ? 'Owes' : 'Balance'}</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-3 text-center">
              <div className="h-10 w-10 rounded-full bg-secondary/15 flex items-center justify-center mx-auto mb-1.5">
                <BookOpen className="h-5 w-5 text-secondary" />
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">{student.total_lessons}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Lessons</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lesson Price & ID */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <Card className="glass">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-body">ת.ז</p>
                <p className="text-sm font-medium font-mono text-foreground">{student.id_number || '—'}</p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-body">מחיר שיעור</p>
                <p className="text-lg font-heading font-bold text-foreground">₪{student.lesson_price ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skill Breakdown */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          <Card className="card-premium overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading flex items-center justify-between">
                Skill Breakdown
                <span className="text-sm font-normal text-muted-foreground font-body">
                  {masteredSkills}/{totalSkills} mastered
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={totalSkills > 0 ? (masteredSkills / totalSkills) * 100 : 0} className="h-2.5" />

              {skillTree.map((category) => {
                const catMastered = category.skills.filter((s) => s.studentSkill?.current_status === 'mastered').length;
                return (
                  <div key={category.id}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-heading font-semibold text-foreground">
                        {category.icon} {category.name}
                      </p>
                      <span className="text-xs text-muted-foreground font-body">{catMastered}/{category.skills.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {category.skills.map((skill) => {
                        const status = skill.studentSkill?.current_status ?? 'not_learned';
                        const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_learned;
                        return (
                          <Badge
                            key={skill.id}
                            variant="outline"
                            className={cn('gap-1 text-xs cursor-pointer hover:scale-105 transition-smooth border', cfg.color)}
                            onClick={() => setHistorySkill(skill)}
                          >
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
        </motion.div>

        {/* Lesson History */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading flex items-center justify-between">
                Lesson History
                <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => setShowAddLesson(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center font-body">No lessons yet.</p>
              ) : (
                <div className="space-y-2">
                  {lessons.slice(0, 20).map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-xl p-2.5 -mx-2 transition-smooth"
                      onClick={() => lesson.status === 'completed' ? null : navigate(`/teacher/lesson/${lesson.id}`)}
                    >
                      <div className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                        lesson.status === 'completed' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
                      )}>
                        {lesson.status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground font-body">
                          {format(new Date(lesson.date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lesson.time_start} – {lesson.time_end}
                          {lesson.skills_practiced?.length ? ` · ${lesson.skills_practiced.length} skills` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-heading font-bold text-foreground">₪{lesson.amount}</p>
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
        </motion.div>
      </main>

      <EditStudentModal open={showEdit} onOpenChange={setShowEdit} student={student} />
      <DeleteStudentDialog open={showDelete} onOpenChange={setShowDelete} studentId={student.id} studentName={student.name} />
      <AddLessonModal open={showAddLesson} onOpenChange={setShowAddLesson} preselectedStudentId={student.id} />
      <SkillHistoryModal open={!!historySkill} onOpenChange={(o) => !o && setHistorySkill(null)} skill={historySkill} />
      <BottomNav />
    </div>
  );
}
