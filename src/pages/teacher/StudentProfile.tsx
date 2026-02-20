import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Plus, ArrowLeft, Phone, MessageCircle, TrendingUp, Wallet, BookOpen, CheckCircle, Clock, AlertTriangle, ExternalLink, Pencil, Trash2, Calendar, FileText, CreditCard, StickyNote, Shield, XCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useStudentProfile } from '@/hooks/use-student-profile';
import {
  calculateReadiness as calcReadiness,
  calculateCategoryAverage,
  type StudentSkillWithCategory,
} from '@/lib/calculations';
import { scoreToPercentage, type SkillScore } from '@/lib/scoring';
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
import { ThemeToggle } from '@/components/ThemeToggle';
import { FontSizeSelector } from '@/components/FontSizeSelector';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function getScoreBadgeConfig(score: number): { label: string; color: string; icon: React.ReactNode } {
  if (score >= 5) return { label: '5 מוכן לטסט', color: 'bg-blue-500/15 text-blue-600 border-blue-500/30', icon: <CheckCircle className="h-3 w-3" /> };
  if (score >= 4) return { label: '4 טוב ויציב', color: 'bg-success/15 text-success border-success/30', icon: <CheckCircle className="h-3 w-3" /> };
  if (score >= 3) return { label: '3 ברוב המקרים', color: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30', icon: <Clock className="h-3 w-3" /> };
  if (score >= 2) return { label: '2 שולט חלקית', color: 'bg-orange-500/15 text-orange-600 border-orange-500/30', icon: <AlertTriangle className="h-3 w-3" /> };
  if (score >= 1) return { label: '1 לא שולט', color: 'bg-destructive/15 text-destructive border-destructive/30', icon: <AlertTriangle className="h-3 w-3" /> };
  return { label: 'לא דורג', color: 'bg-muted text-muted-foreground border-border', icon: <AlertTriangle className="h-3 w-3" /> };
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

// Default category colors (matches migration spec)
const CATEGORY_COLORS: Record<string, string> = {
  'שליטה והפעלת הרכב': '#38BDF8',
  'התנהלות בדרך': '#34D399',
  'התנהלות בתנועה': '#F472B6',
  'מצבים מתקדמים': '#FBBF24',
};

/** Flatten the skillTree (from useStudentProfile) into the shape calculations.ts expects. */
function flattenSkillTree(skillTree: any[]): { skills: StudentSkillWithCategory[]; advancedCategoryId: string | undefined } {
  let advancedCategoryId: string | undefined;
  const skills: StudentSkillWithCategory[] = [];

  for (const cat of skillTree) {
    if (cat.sort_order === 4 || cat.name === 'מצבים מתקדמים') {
      advancedCategoryId = cat.id;
    }
    for (const skill of cat.skills) {
      if (!skill.studentSkill) continue;
      skills.push({
        ...skill.studentSkill,
        skill: { id: skill.id, category_id: cat.id, name: skill.name },
      });
    }
  }

  return { skills, advancedCategoryId };
}

interface ReadinessDisplay {
  ready: boolean;
  overallAvg: number;
  coverage: number;
  hasLowSkills: boolean;
  lowSkillCount: number;
  advancedCatAvg: number;
  ratedCount: number;
  totalCount: number;
}

/** Compute readiness using the canonical calcReadiness, mapped to the UI-friendly shape. */
function computeReadiness(skillTree: any[]): ReadinessDisplay {
  const { skills, advancedCategoryId } = flattenSkillTree(skillTree);
  const r = calcReadiness(skills, advancedCategoryId);
  const rated = skills.filter((s) => (s.current_score ?? 0) > 0);
  const lowCount = rated.filter((s) => (s.current_score ?? 0) < 3).length;
  return {
    ready: r.ready,
    overallAvg: r.percentage,
    coverage: r.coverage,
    hasLowSkills: r.hasLow,
    lowSkillCount: lowCount,
    advancedCatAvg: r.cat4Percentage,
    ratedCount: rated.length,
    totalCount: skills.length,
  };
}

interface CategoryAverageDisplay {
  id: string;
  name: string;
  icon: string;
  color: string;
  average: number;
  ratedCount: number;
  totalCount: number;
  mastered: number;
}

/** Compute per-category averages using the canonical calculateCategoryAverage. */
function computeCategoryAverages(skillTree: any[]): CategoryAverageDisplay[] {
  const { skills } = flattenSkillTree(skillTree);
  return skillTree.map((cat) => {
    const rated = cat.skills.filter((s: any) => (s.studentSkill?.current_score ?? 0) > 0);
    const mastered = cat.skills.filter((s: any) => (s.studentSkill?.current_score ?? 0) >= 4).length;
    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon ?? '',
      color: cat.color ?? CATEGORY_COLORS[cat.name] ?? '#94A3B8',
      average: scoreToPercentage(calculateCategoryAverage(skills, cat.id) as SkillScore),
      ratedCount: rated.length,
      totalCount: cat.skills.length,
      mastered,
    };
  });
}

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

  const skillTree = data?.skillTree;
  const readiness = useMemo(() => skillTree ? computeReadiness(skillTree) : { ready: false, overallAvg: 0, coverage: 0, hasLowSkills: false, lowSkillCount: 0, advancedCatAvg: 0, ratedCount: 0, totalCount: 0 }, [skillTree]);
  const categoryAverages = useMemo(() => skillTree ? computeCategoryAverages(skillTree) : [], [skillTree]);

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

  const { student, lessons, skillTree: _st } = data;
  const hasDebt = student.balance < 0;
  const totalSkills = data.skillTree.reduce((sum, cat) => sum + cat.skills.length, 0);
  const masteredSkills = data.skillTree.reduce(
    (sum, cat) => sum + cat.skills.filter((s: any) => (s.studentSkill?.current_score ?? 0) >= 4).length, 0
  );

  // Radar chart data
  const radarData = data.skillTree.map((cat) => {
    const total = cat.skills.length;
    const mastered = cat.skills.filter((s: any) => (s.studentSkill?.current_score ?? 0) >= 4).length;
    const inProgress = cat.skills.filter((s: any) => { const sc = s.studentSkill?.current_score ?? 0; return sc > 0 && sc < 4; }).length;
    const notLearned = total - mastered - inProgress;
    const score = mastered + inProgress * 0.5;
    return { category: cat.name, value: total > 0 ? Math.round((score / total) * 100) : 0, mastered, inProgress, notLearned, total };
  }).filter(d => d.category);

  // Progress over time: track mastered skill count from skill history
  const progressData = (() => {
    const allHistory: { date: string; skillId: string; score: number }[] = [];
    for (const cat of data.skillTree) {
      for (const skill of cat.skills as any[]) {
        for (const h of skill.history || []) {
          allHistory.push({ date: h.lesson_date, skillId: skill.id, score: h.score ?? 0 });
        }
      }
    }
    allHistory.sort((a, b) => a.date.localeCompare(b.date));

    const dateGroups = new Map<string, { skillId: string; score: number }[]>();
    for (const entry of allHistory) {
      const group = dateGroups.get(entry.date) ?? [];
      group.push(entry);
      dateGroups.set(entry.date, group);
    }

    const skillStates = new Map<string, number>();
    const points: { date: string; mastered: number; pct: number }[] = [];
    for (const [date, entries] of dateGroups) {
      for (const e of entries) skillStates.set(e.skillId, e.score);
      const masteredCount = [...skillStates.values()].filter(s => s >= 4).length;
      points.push({
        date: format(new Date(date), 'dd/MM', { locale: he }),
        mastered: masteredCount,
        pct: totalSkills > 0 ? Math.round((masteredCount / totalSkills) * 100) : 0,
      });
    }
    return points;
  })();

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
          <div className="flex items-center gap-1">
            <FontSizeSelector />
            <ThemeToggle />
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
              <p className={cn(
                'text-2xl font-heading font-bold',
                readiness.ready ? 'text-emerald-500' : 'text-foreground'
              )}>{Math.round(readiness.overallAvg)}%</p>
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

        {/* Readiness Status */}
        {readiness.ratedCount > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
            <Card className={cn(
              'overflow-hidden border-2',
              readiness.ready
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-amber-500/40 bg-amber-500/5'
            )}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    'h-12 w-12 rounded-full flex items-center justify-center shrink-0',
                    readiness.ready ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                  )}>
                    <Shield className={cn('h-6 w-6', readiness.ready ? 'text-emerald-500' : 'text-amber-500')} />
                  </div>
                  <div>
                    <h3 className="text-base font-heading font-bold text-foreground">
                      {readiness.ready ? 'מוכן למבחן' : 'עדיין לא מוכן'}
                    </h3>
                    <p className="text-xs text-muted-foreground font-body">
                      {readiness.ratedCount} / {readiness.totalCount} מיומנויות דורגו
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5" role="list" aria-label="קריטריונים למוכנות">
                  {/* Criterion 1: Overall average >= 80% */}
                  <div className="flex items-center gap-2.5" role="listitem">
                    {readiness.overallAvg >= 80 ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                    )}
                    <span className="text-sm font-body text-foreground flex-1">
                      ממוצע כללי 80%+
                    </span>
                    <span className={cn(
                      'text-sm font-heading font-bold tabular-nums',
                      readiness.overallAvg >= 80 ? 'text-emerald-500' : 'text-red-400'
                    )}>
                      {readiness.overallAvg.toFixed(0)}%
                    </span>
                  </div>

                  {/* Criterion 2: No skill below score 3 (60%) */}
                  <div className="flex items-center gap-2.5" role="listitem">
                    {!readiness.hasLowSkills ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                    )}
                    <span className="text-sm font-body text-foreground flex-1">
                      אין מיומנות מתחת לציון 3
                    </span>
                    {readiness.hasLowSkills && (
                      <span className="text-xs font-body text-red-400">
                        {readiness.lowSkillCount} דורשות שיפור
                      </span>
                    )}
                  </div>

                  {/* Criterion 2b: Coverage >= 90% */}
                  <div className="flex items-center gap-2.5" role="listitem">
                    {readiness.coverage >= 90 ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                    )}
                    <span className="text-sm font-body text-foreground flex-1">
                      כיסוי חומר 90%+
                    </span>
                    <span className={cn(
                      'text-sm font-heading font-bold tabular-nums',
                      readiness.coverage >= 90 ? 'text-emerald-500' : 'text-red-400'
                    )}>
                      {readiness.coverage}%
                    </span>
                  </div>

                  {/* Criterion 3: Advanced category >= 80% */}
                  <div className="flex items-center gap-2.5" role="listitem">
                    {readiness.advancedCatAvg >= 80 ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                    )}
                    <span className="text-sm font-body text-foreground flex-1">
                      מצבים מתקדמים 80%+
                    </span>
                    <span className={cn(
                      'text-sm font-heading font-bold tabular-nums',
                      readiness.advancedCatAvg >= 80 ? 'text-emerald-500' : 'text-red-400'
                    )}>
                      {readiness.advancedCatAvg > 0 ? `${readiness.advancedCatAvg.toFixed(0)}%` : '—'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Category Averages */}
        {categoryAverages.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
            <Card className="card-premium overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-heading">ממוצע לפי קטגוריה</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryAverages.map((cat) => (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-body text-foreground flex items-center gap-1.5">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </span>
                      <span
                        className="text-sm font-heading font-bold tabular-nums"
                        style={{ color: cat.average >= 60 ? cat.color : undefined }}
                      >
                        {cat.ratedCount > 0 ? `${cat.average.toFixed(0)}%` : '—'}
                      </span>
                    </div>
                    <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 right-0 rounded-full"
                        style={{ backgroundColor: cat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.ratedCount > 0 ? cat.average : 0}%` }}
                        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-body">
                      {cat.mastered}/{cat.totalCount} נשלטו
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Radar Chart */}
        {radarData.length >= 3 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}>
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
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2.5 text-xs shadow-xl" dir="rtl">
                          <p className="font-semibold text-foreground mb-1.5">{d.category}</p>
                          <div className="space-y-0.5 text-muted-foreground">
                            <p>✅ טוב ויציב+ (4-5): <span className="text-foreground font-medium">{d.mastered}</span></p>
                            <p>🔄 בתרגול (1-3): <span className="text-foreground font-medium">{d.inProgress}</span></p>
                            <p>⬜ לא דורגו (0): <span className="text-foreground font-medium">{d.notLearned}</span></p>
                          </div>
                          <p className="mt-1.5 text-primary font-semibold">{d.value}%</p>
                        </div>
                      );
                    }} />
                  </RadarChart>
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
                const catMastered = category.skills.filter((s: any) => (s.studentSkill?.current_score ?? 0) >= 4).length;
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
                        const sc = skill.studentSkill?.current_score ?? 0;
                        const cfg = getScoreBadgeConfig(sc);
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

        {/* Progress Over Time */}
        {progressData.length >= 2 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={8}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-heading">התקדמות לאורך זמן</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} unit="%" />
                    <Tooltip formatter={(value: number) => [`${value}%`, 'אחוז שליטה']} />
                    <Line type="monotone" dataKey="pct" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="אחוז שליטה" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Lesson History */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={9}>
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
                    const isInternalTest = lesson.notes?.startsWith('[טסט פנימי]');
                    const isExternalTest = lesson.notes?.startsWith('[טסט חיצוני]');
                    const isTest = isInternalTest || isExternalTest;
                    const lessonTypeLabel = isInternalTest ? 'טסט פנימי' : isExternalTest ? 'טסט חיצוני' : 'שיעור';

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
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-foreground font-body">
                              {format(new Date(lesson.date), 'd בMMM yyyy', { locale: he })}
                            </p>
                            {isTest && (
                              <Badge variant="outline" className={cn(
                                'text-[10px] px-1.5',
                                isInternalTest ? 'text-blue-600 border-blue-500/30' : 'text-purple-600 border-purple-500/30'
                              )}>
                                {lessonTypeLabel}
                              </Badge>
                            )}
                          </div>
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

        {/* Lesson Price & ID */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={10}>
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
              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-body">טסט פנימי</p>
                <p className="text-lg font-heading font-bold text-foreground">₪{(student as any).internal_test_price ?? 0}</p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-body">טסט חיצוני</p>
                <p className="text-lg font-heading font-bold text-foreground">₪{(student as any).external_test_price ?? 0}</p>
              </div>
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
