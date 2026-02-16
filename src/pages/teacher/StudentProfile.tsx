import { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, ArrowLeft, Phone, MessageCircle, TrendingUp, Wallet, BookOpen, CheckCircle, Clock, AlertTriangle, ExternalLink, Pencil, Trash2, Calendar, FileText, CreditCard, StickyNote } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useStudentProfile } from '@/hooks/use-student-profile';
import { BottomNav } from '@/components/teacher/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { EditStudentModal } from '@/components/teacher/EditStudentModal';
import { DeleteStudentDialog } from '@/components/teacher/DeleteStudentDialog';
import { AddLessonModal } from '@/components/teacher/AddLessonModal';
import { SkillHistoryModal } from '@/components/teacher/SkillHistoryModal';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  mastered: { label: 'נשלט', color: 'bg-success/15 text-success border-success/30', icon: <CheckCircle className="h-3 w-3" /> },
  in_progress: { label: 'בתהליך', color: 'bg-warning/15 text-warning border-warning/30', icon: <Clock className="h-3 w-3" /> },
  not_learned: { label: 'לא נלמד', color: 'bg-muted text-muted-foreground border-border', icon: <AlertTriangle className="h-3 w-3" /> },
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

function useNextLesson(studentId: string | undefined) {
  return useQuery({
    queryKey: ['next-lesson', studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from('lessons')
        .select('*')
        .eq('student_id', studentId!)
        .gte('date', today)
        .in('status', ['scheduled', 'in_progress'])
        .order('date')
        .order('time_start')
        .limit(1);
      return data?.[0] ?? null;
    },
  });
}

function useUpdateTeacherNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, notes }: { studentId: string; notes: string }) => {
      const { error } = await supabase
        .from('students')
        .update({ teacher_notes: notes } as any)
        .eq('id', studentId);
      if (error) throw error;
    },
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: ['student-profile', studentId] });
    },
  });
}

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useStudentProfile(id);
  const { data: nextLesson } = useNextLesson(id);
  const updateNotes = useUpdateTeacherNotes();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [historySkill, setHistorySkill] = useState<any>(null);
  const [teacherNotes, setTeacherNotes] = useState('');
  const notesInitialized = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (data?.student && !notesInitialized.current) {
      setTeacherNotes((data.student as any).teacher_notes ?? '');
      notesInitialized.current = true;
    }
  }, [data?.student]);

  const handleNotesBlur = useCallback(() => {
    if (!id) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateNotes.mutate({ studentId: id, notes: teacherNotes });
    }, 500);
  }, [id, teacherNotes, updateNotes]);

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-screen bg-background pb-24 p-4 space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-60 w-full rounded-xl" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">תלמיד לא נמצא.</p>
      </div>
    );
  }

  const { student, lessons, skillTree } = data;
  const hasDebt = student.balance < 0;
  const totalSkills = skillTree.reduce((sum, cat) => sum + cat.skills.length, 0);
  const masteredSkills = skillTree.reduce(
    (sum, cat) => sum + cat.skills.filter((s: any) => s.studentSkill?.current_status === 'mastered').length, 0
  );

  // Radar chart data
  const radarData = skillTree.map((cat) => {
    const total = cat.skills.length;
    const mastered = cat.skills.filter((s: any) => s.studentSkill?.current_status === 'mastered').length;
    const inProgress = cat.skills.filter((s: any) => s.studentSkill?.current_status === 'in_progress').length;
    const score = mastered + inProgress * 0.5;
    return { category: cat.name, value: total > 0 ? Math.round((score / total) * 100) : 0 };
  }).filter(d => d.category);

  // Progress over time data from completed lessons
  const progressData = [...lessons]
    .filter((l: any) => l.status === 'completed')
    .reverse()
    .map((l: any, idx: number) => ({
      date: format(new Date(l.date), 'dd/MM', { locale: he }),
      lesson: idx + 1,
    }));

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-heading font-bold text-foreground truncate">{student.name}</h1>
            <p className="text-xs text-muted-foreground font-body">{student.phone ?? 'אין טלפון'}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9" onClick={() => setShowEdit(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9 text-destructive hover:text-destructive" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Quick Actions */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {student.phone && (
            <>
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => window.open(`tel:${student.phone}`)}>
                <Phone className="h-4 w-4" /> התקשר
              </Button>
              <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => window.open(`https://wa.me/${student.phone?.replace(/\D/g, '')}`)}>
                <MessageCircle className="h-4 w-4" /> וואטסאפ
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => setShowAddLesson(true)}>
            <Calendar className="h-4 w-4" /> קבע שיעור
          </Button>
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => navigate(`/student/${id}/report`)}>
            <FileText className="h-4 w-4" /> דוח תלמיד
          </Button>
          {hasDebt && student.phone && (
            <Button variant="outline" size="sm" className="shrink-0 gap-1.5 text-destructive" onClick={() => window.open(`https://wa.me/${student.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`שלום, יש יתרת חוב של ₪${Math.abs(student.balance)}. אשמח להסדיר. תודה!`)}`)}>
              <CreditCard className="h-4 w-4" /> תזכורת תשלום
            </Button>
          )}
        </motion.div>

        {/* Stats Row */}
        <motion.div className="grid grid-cols-3 gap-3" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <Card className="card-premium overflow-hidden">
            <CardContent className="p-3 text-center">
              <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-1.5">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">{student.readiness_percentage}%</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">מוכנות</p>
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
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{hasDebt ? 'חוב' : 'יתרה'}</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardContent className="p-3 text-center">
              <div className="h-10 w-10 rounded-full bg-secondary/15 flex items-center justify-center mx-auto mb-1.5">
                <BookOpen className="h-5 w-5 text-secondary" />
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">{student.total_lessons}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">שיעורים</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Lesson Card */}
        {nextLesson && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-body">השיעור הבא</p>
                    <p className="text-sm font-heading font-bold text-foreground">
                      {format(new Date(nextLesson.date), 'EEEE, d בMMMM', { locale: he })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {nextLesson.time_start} - {nextLesson.time_end} • {formatDistanceToNow(new Date(nextLesson.date), { locale: he, addSuffix: true })}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0" onClick={() => navigate(`/teacher/lesson/${nextLesson.id}`)}>
                    לשיעור →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Lesson Price & ID */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
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

        {/* Radar Chart */}
        {radarData.length >= 3 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-heading">מפת מיומנויות</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Progress Over Time */}
        {progressData.length >= 2 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-heading">התקדמות לאורך זמן</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="lesson" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="שיעור מס'" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Skill Breakdown */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6}>
          <Card className="card-premium overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading flex items-center justify-between">
                פירוט מיומנויות
                <span className="text-sm font-normal text-muted-foreground font-body">
                  {masteredSkills}/{totalSkills} נשלטו
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={totalSkills > 0 ? (masteredSkills / totalSkills) * 100 : 0} className="h-2.5" />

              {skillTree.map((category) => {
                const catMastered = category.skills.filter((s: any) => s.studentSkill?.current_status === 'mastered').length;
                return (
                  <div key={category.id}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-heading font-semibold text-foreground">
                        {category.icon} {category.name}
                      </p>
                      <span className="text-xs text-muted-foreground font-body">{catMastered}/{category.skills.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {category.skills.map((skill: any) => {
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

        {/* Teacher Notes */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={7}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                הערות מורה פרטיות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="כתוב הערות על התלמיד..."
                className="min-h-[80px] text-sm resize-none"
              />
              {updateNotes.isPending && (
                <p className="text-xs text-muted-foreground mt-1">שומר...</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Lesson History */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={8}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading flex items-center justify-between">
                היסטוריית שיעורים
                <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => setShowAddLesson(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center font-body">אין שיעורים עדיין.</p>
              ) : (
                <div className="space-y-2">
                  {lessons.slice(0, 20).map((lesson: any) => {
                    const actualStart = lesson.actual_start_time
                      ? new Date(lesson.actual_start_time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
                      : null;
                    const actualEnd = lesson.actual_end_time
                      ? new Date(lesson.actual_end_time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
                      : null;
                    const variance = lesson.duration_variance_minutes;
                    const actualDuration = lesson.actual_duration_minutes;

                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-xl p-2.5 -mx-2 transition-smooth"
                        onClick={() => lesson.status === 'completed' ? null : navigate(`/teacher/lesson/${lesson.id}`)}
                      >
                        <div className={cn(
                          'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                          lesson.status === 'completed' ? 'bg-success/15 text-success' :
                          lesson.status === 'cancelled' ? 'bg-destructive/15 text-destructive' :
                          'bg-muted text-muted-foreground'
                        )}>
                          {lesson.status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground font-body">
                            {format(new Date(lesson.date), 'd בMMM yyyy', { locale: he })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {actualStart && actualEnd
                              ? `${actualStart} - ${actualEnd}${actualDuration ? ` (${actualDuration} דק')` : ''}`
                              : `${lesson.time_start} – ${lesson.time_end}`}
                            {lesson.skills_practiced?.length ? ` · ${lesson.skills_practiced.length} מיומנויות` : ''}
                          </p>
                        </div>
                        <div className="text-left shrink-0 flex flex-col items-end gap-1">
                          <p className="text-sm font-heading font-bold text-foreground">₪{lesson.amount}</p>
                          <div className="flex gap-1">
                            {variance != null && variance !== 0 && (
                              <Badge variant="outline" className={cn(
                                'text-[10px] px-1.5',
                                variance > 0 ? 'text-destructive border-destructive/30' : 'text-success border-success/30'
                              )}>
                                {variance > 0 ? `+${variance}` : variance} דק'
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] px-1.5',
                                lesson.payment_status === 'paid' ? 'text-success border-success/30' : 'text-warning border-warning/30'
                              )}
                            >
                              {lesson.payment_status === 'paid' ? 'שולם' : lesson.payment_status === 'debt' ? 'חוב' : 'ממתין'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
