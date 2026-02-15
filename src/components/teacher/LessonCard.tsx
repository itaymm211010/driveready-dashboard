import { MapPin, Phone, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Lesson, Student } from '@/data/mock';

interface LessonCardProps {
  lesson: Lesson;
  student: Student;
}

export function LessonCard({ lesson, student }: LessonCardProps) {
  const navigate = useNavigate();
  const hasDebt = student.balance < 0;

  return (
    <Card
      className={cn(
        'transition-all active:scale-[0.98]',
        hasDebt && 'border-destructive/50 border-2',
        lesson.status === 'completed' && 'opacity-60'
      )}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <button
            onClick={() => navigate(`/teacher/student/${student.id}`)}
            className="text-start"
          >
            <h3 className="text-lg font-bold text-foreground">{student.name}</h3>
            <p className="text-sm text-muted-foreground">
              ⏰ {lesson.time_start} - {lesson.time_end}
            </p>
          </button>
          {hasDebt ? (
            <Badge variant="destructive" className="shrink-0">
              ⚠️ Owes ₪{Math.abs(student.balance)}
            </Badge>
          ) : (
            <Badge className="shrink-0 bg-success text-success-foreground border-0">
              ✅ Clear
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-h-[44px]"
            onClick={() => window.open(`https://waze.com/ul`, '_blank')}
          >
            <MapPin className="h-4 w-4" />
            Navigate
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-h-[44px]"
            onClick={() => window.open(`tel:${student.phone}`)}
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
          <Button
            size="sm"
            className="flex-[2] min-h-[44px] font-bold"
            disabled={lesson.status === 'completed'}
            onClick={() => navigate(`/teacher/lesson/${lesson.id}`)}
          >
            <Play className="h-4 w-4" />
            {lesson.status === 'completed' ? 'Completed' : 'Start Lesson'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
