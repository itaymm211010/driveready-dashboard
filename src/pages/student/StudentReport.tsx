import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share2, MessageCircle, Trophy, BookOpen, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
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

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  mastered: { label: 'Mastered', className: 'bg-success/20 text-success border-success/30', icon: <CheckCircle className="h-3 w-3" /> },
  in_progress: { label: 'In Progress', className: 'bg-warning/20 text-warning border-warning/30', icon: <Clock className="h-3 w-3" /> },
  not_learned: { label: 'Not Learned', className: 'bg-muted text-muted-foreground border-border', icon: <AlertTriangle className="h-3 w-3" /> },
};

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

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleWhatsApp = () => {
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my driving progress! ${url}`)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="dark">
        <div className="min-h-screen bg-background p-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dark">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Student not found.</p>
        </div>
      </div>
    );
  }

  const { student, skillTree, radarData, progressData } = data;
  const initials = student.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const totalSkills = skillTree.reduce((sum, cat) => sum + cat.skills.length, 0);
  const masteredSkills = skillTree.reduce(
    (sum, cat) => sum + cat.skills.filter((s) => s.studentSkill?.current_status === 'mastered').length,
    0
  );

  return (
    <div className="dark">
      <div className="min-h-screen bg-background pb-8">
        {/* Header / Driver Card */}
        <motion.div
          className="glass glow-primary rounded-b-3xl p-6 pb-8"
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
        >
          <div className="flex items-center gap-5">
            <div className="relative">
              {student.avatar_url ? (
                <img src={student.avatar_url} alt={student.name} className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/50" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/50">
                  <span className="text-2xl font-bold text-primary">{initials}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground truncate">{student.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {student.total_lessons} lessons</span>
                <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5 text-warning" /> {masteredSkills}/{totalSkills}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <CircularProgress
              value={student.readiness_percentage}
              size={140}
              strokeWidth={10}
              label={`${student.readiness_percentage}%`}
              sublabel="Readiness"
              className="[&_circle:last-of-type]:drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
            />
          </div>
        </motion.div>

        <div className="px-4 space-y-5 mt-5">
          {/* Radar Chart */}
          {radarData.length > 0 && (
            <motion.div
              className="glass rounded-2xl p-4"
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
            >
              <h2 className="text-sm font-semibold text-foreground mb-3">Skill Categories</h2>
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
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Progress Timeline */}
          {progressData.length > 1 && (
            <motion.div
              className="glass rounded-2xl p-4"
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
            >
              <h2 className="text-sm font-semibold text-foreground mb-3">Progress Over Time</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mastered"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2.5}
                      dot={{ fill: 'hsl(var(--accent))', r: 3 }}
                      activeDot={{ r: 5, fill: 'hsl(var(--accent))' }}
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
            <h2 className="text-sm font-semibold text-foreground">Skill Breakdown</h2>
            {skillTree.map((cat) => {
              const catMastered = cat.skills.filter((s) => s.studentSkill?.current_status === 'mastered').length;
              return (
                <div key={cat.id} className="glass rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{cat.icon} {cat.name}</span>
                    <span className="text-xs text-muted-foreground">{catMastered}/{cat.skills.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.skills.map((skill) => {
                      const status = skill.studentSkill?.current_status ?? 'not_learned';
                      const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_learned;
                      return (
                        <Badge key={skill.id} variant="outline" className={cn('gap-1 text-xs', cfg.className)}>
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
            <Button onClick={handleShare} className="flex-1 gap-2" variant="outline">
              <Share2 className="h-4 w-4" /> Share Report
            </Button>
            <Button onClick={handleWhatsApp} className="flex-1 gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white border-0">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
