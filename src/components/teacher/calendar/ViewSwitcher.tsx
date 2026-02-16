import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CalendarView } from '@/hooks/use-calendar-lessons';

interface ViewSwitcherProps {
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
}

export function ViewSwitcher({ view, onViewChange }: ViewSwitcherProps) {
  return (
    <Tabs value={view} onValueChange={(v) => onViewChange(v as CalendarView)}>
      <TabsList className="w-full glass">
        <TabsTrigger value="day" className="flex-1 text-xs">יום</TabsTrigger>
        <TabsTrigger value="week" className="flex-1 text-xs">שבוע</TabsTrigger>
        <TabsTrigger value="month" className="flex-1 text-xs">חודש</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
