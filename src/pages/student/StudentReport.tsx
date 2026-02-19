import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share2, MessageCircle, Trophy, BookOpen, CheckCircle, Clock, AlertTriangle, Moon, Sun } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { toast } from 'sonner';
import { useStudentReport } from '@/hooks/use-student-report';
import { CircularProgress } from '@/components/shared/CircularProgress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';

function getScoreBadgeConfig(score: number): { label: string; className: string; icon: React.ReactNode } {
  if (score >= 5) return { label: '5 מוכן לטסט', className: 'bg-blue-500/20 text-blue-600 border-blue-500/30', icon: <CheckCircle className="h-3 w-3" /> };
  if (score >= 4) return { label: '4 טוב ויציב', className: 'bg-success/20 text-success border-success/30', icon: <CheckCircle className="h-3 w-3" /> };
  if (score >= 3) return { label: '3 ברוב המקרים', className: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30', icon: <Clock className="h-3 w-3" /> };
  if (score >= 2) return { label: '2 שולט חלקית', className: 'bg-orange-500/20 text-orange-600 border-orange-500/30', icon: <AlertTriangle className="h-3 w-3" /> };
  if (score >= 1) return { label: '1 לא שולט', className: 'bg-destructive/20 text-destructive border-destructive/30', icon: <AlertTriangle className="h-3 w-3" /> };
  return { label: 'לא דורג', className: 'bg-muted text-muted-foreground border-border', icon: <AlertTriangle className="h-3 w-3" /> };
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function StudentReport() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useStudentReport(id);
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('הקישור הועתק!');
    } catch {
      toast.error('שגיאה בהעתקת הקישור');
    }
  };

  const handleWhatsApp = () => {
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(`בדקו את ההתקדמות שלי בנהיגה! ${url}`)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
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

  const { student, skillTree, radarData, progressData } = data;
  const initials = student.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const totalSkills = skillTree.reduce((sum, cat) => sum + cat.skills.length, 0);
  const masteredSkills = skillTree.reduce(
    (sum, cat) => sum + cat.skills.filter((s) => (s.studentSkill?.current_score ?? 0) >= 4).length,
    0
  );

  return (
    <div dir="rtl" className="min-h-screen bg-background pb-8">
      {/* Theme Toggle */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="h-9 w-9 rounded-full glass border border-border/50"
        >
          {isDark ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
        </Button>
      </div>
        <motion.div
          className="glass glow-neon rounded-b-3xl p-6 pb-8 relative overflow-hidden"
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-neon-purple/10 pointer-events-none" />

          <div className="relative flex items-center gap-5">
            <div className="relative">
              {student.avatar_url ? (
                <img src={student.avatar_url} alt={student.name} className="h-20 w-20 rounded-full object-cover ring-2 ring-neon-green/50 shadow-[0_0_20px_hsl(var(--neon-green)/0.3)]" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-neon-green/20 to-neon-purple/20 flex items-center justify-center ring-2 ring-neon-green/50 shadow-[0_0_20px_hsl(var(--neon-green)/0.3)]">
                  <span className="text-2xl font-heading font-bold text-primary neon-text">{initials}</span>
                </div>
              )}
              {/* Level indicator */}
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-neon-purple flex items-center justify-center text-[10px] font-heading font-bold text-white ring-2 ring-background">
                {student.total_lessons}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-heading font-bold text-foreground truncate neon-text">{student.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground font-body">
                <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {student.total_lessons} שיעורים</span>
                <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5 text-warning" /> {masteredSkills}/{totalSkills}</span>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center mt-6">
            <CircularProgress
              value={student.readiness_percentage}
              size={140}
              strokeWidth={10}
              label={`${student.readiness_percentage}%`}
              sublabel="מוכנות"
              className="[&_circle:last-of-type]:drop-shadow-[0_0_12px_hsl(var(--primary)/0.7)]"
            />
          </div>
        </motion.div>

        <div className="px-4 space-y-5 mt-5">
          {/* Radar Chart */}
          {radarData.length > 0 && (
            <motion.div
              className="glass card-premium rounded-2xl p-4 overflow-hidden"
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
            >
              <h2 className="text-sm font-heading font-semibold text-foreground mb-3">קטגוריות מיומנויות</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <Radar
                      name="Mastery"
                      dataKey="value"
                      stroke="hsl(var(--neon-green))"
                      fill="hsl(var(--neon-green))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
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
              </div>
            </motion.div>
          )}

          {/* Progress Timeline */}
          {progressData.length > 1 && (
            <motion.div
              className="glass card-premium rounded-2xl p-4 overflow-hidden"
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
            >
              <h2 className="text-sm font-heading font-semibold text-foreground mb-3">התקדמות לאורך זמן</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} domain={[0, 100]} unit="%" />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, 'אחוז שליטה']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        color: 'hsl(var(--foreground))',
                        backdropFilter: 'blur(20px)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pct"
                      stroke="hsl(var(--neon-cyan))"
                      strokeWidth={2.5}
                      dot={{ fill: 'hsl(var(--neon-cyan))', r: 3 }}
                      activeDot={{ r: 5, fill: 'hsl(var(--neon-cyan))' }}
                      name="אחוז שליטה"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Skill Breakdown */}
          <motion.div
            className="space-y-3"
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            <h2 className="text-sm font-heading font-semibold text-foreground">פירוט מיומנויות</h2>
            {skillTree.map((cat) => {
              const catMastered = cat.skills.filter((s) => (s.studentSkill?.current_score ?? 0) >= 4).length;
              return (
                <div key={cat.id} className="glass card-premium rounded-xl p-3 overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-heading font-medium text-foreground">{cat.icon} {cat.name}</span>
                    <span className="text-xs text-muted-foreground font-body">{catMastered}/{cat.skills.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.skills.map((skill) => {
                      const score = skill.studentSkill?.current_score ?? 0;
                      const cfg = getScoreBadgeConfig(score);
                      return (
                        <Badge key={skill.id} variant="outline" className={cn('gap-1 text-xs transition-smooth hover:scale-105', cfg.className)}>
                          {cfg.icon}
                          {skill.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Share Section */}
          <motion.div
            className="flex gap-3 pt-2"
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
          >
            <Button onClick={handleShare} className="flex-1 gap-2 glass border-primary/30 text-foreground hover:glow-primary transition-smooth" variant="outline">
              <Share2 className="h-4 w-4" /> שתף דוח
            </Button>
            <Button onClick={handleWhatsApp} className="flex-1 gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white border-0 transition-smooth">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
          </motion.div>
      </div>
    </div>
  );
}
