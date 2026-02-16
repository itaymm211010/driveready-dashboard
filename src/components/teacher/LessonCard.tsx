import { MapPin, Phone, Play, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LessonCardProps {
  lesson: {
    id: string;
    time_start: string;
    time_end: string;
    status: string;
    amount: number;
  };
  student: {
    id: string;
    name: string;
    phone: string | null;
    balance: number;
  };
}

export function LessonCard({ lesson, student }: LessonCardProps) {
  const navigate = useNavigate();
  const hasDebt = student.balance < 0;
  const isCompleted = lesson.status === 'completed';

  return (
    <Card
      className={cn(
        'transition-smooth active:scale-[0.98] overflow-hidden',
        hasDebt && !isCompleted && 'border-destructive/40 border-2',
        isCompleted && 'opacity-60 border-muted',
        !isCompleted && !hasDebt && 'card-premium'
      )}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <button
            onClick={() => navigate(`/teacher/student/${student.id}`)}
            className="text-start group"
          >
            <h3 className={cn(
              "text-lg font-heading font-bold text-foreground group-hover:text-primary transition-smooth",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {student.name}
            </h3>
            <p className="text-sm text-muted-foreground font-body">
              ⏰ {lesson.time_start} - {lesson.time_end}
            </p>
          </button>
          {isCompleted ? (
            <Badge className="shrink-0 bg-muted text-muted-foreground border-0 gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              הושלם
            </Badge>
          ) : hasDebt ? (
            <Badge variant="destructive" className="shrink-0 animate-pulse-glow">
              ⚠️ חייב ₪{Math.abs(student.balance)}
            </Badge>
          ) : (
            <Badge className="shrink-0 bg-success/15 text-success border border-success/30">
              ✅ תקין
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-h-[44px] transition-smooth"
            onClick={() => window.open(`https://waze.com/ul`, '_blank')}
          >
            <MapPin className="h-4 w-4" />
            נווט
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-h-[44px] transition-smooth"
            onClick={() => student.phone && window.open(`tel:${student.phone}`)}
          >
            <Phone className="h-4 w-4" />
            התקשר
          </Button>
          <Button
            size="sm"
            className={cn(
              "flex-[2] min-h-[44px] font-heading font-bold transition-smooth",
              isCompleted && "bg-muted text-muted-foreground hover:bg-muted",
              !isCompleted && "shimmer"
            )}
            disabled={isCompleted}
            onClick={() => navigate(`/teacher/lesson/${lesson.id}`)}
          >
            {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isCompleted ? 'הושלם' : 'התחל שיעור'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
