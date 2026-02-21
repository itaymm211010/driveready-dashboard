import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CreateTaskDialog } from "./dialogs/CreateTaskDialog";
import { EditTaskDialog } from "./dialogs/EditTaskDialog";

export const TasksTab = () => {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["pm_tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`*, creator:teachers!tasks_created_by_fkey(name)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "default";
      case "in_progress": return "secondary";
      case "todo": return "outline";
      default: return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const statusLabels: Record<string, string> = {
    todo: "לביצוע", in_progress: "בביצוע", review: "בסקירה", done: "הושלם",
  };
  const priorityLabels: Record<string, string> = {
    low: "נמוכה", medium: "בינונית", high: "גבוהה", urgent: "דחוף",
  };
  const typeLabels: Record<string, string> = {
    feature: "תכונה", bug: "באג", improvement: "שיפור", documentation: "תיעוד",
  };

  if (isLoading) return <div>טוען משימות...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>כל המשימות</CardTitle>
          <CreateTaskDialog />
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>כותרת</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>עדיפות</TableHead>
                <TableHead>סוג</TableHead>
                <TableHead>יוצר</TableHead>
                <TableHead>שעות משוערות</TableHead>
                <TableHead>שעות בפועל</TableHead>
                <TableHead>נוצר ב</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks?.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(task.status)}>
                      {statusLabels[task.status] || task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {priorityLabels[task.priority] || task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{typeLabels[task.type] || task.type}</TableCell>
                  <TableCell>{(task.creator as any)?.name || '-'}</TableCell>
                  <TableCell>{task.estimated_hours || "-"}</TableCell>
                  <TableCell>{task.actual_hours || 0}</TableCell>
                  <TableCell>
                    {format(new Date(task.created_at), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <EditTaskDialog task={task} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {tasks?.map((task) => (
            <Card key={task.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-lg">{task.title}</h3>
                  <EditTaskDialog task={task} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getStatusColor(task.status)}>
                    {statusLabels[task.status] || task.status}
                  </Badge>
                  <Badge variant={getPriorityColor(task.priority)}>
                    {priorityLabels[task.priority] || task.priority}
                  </Badge>
                  <Badge variant="outline">{typeLabels[task.type] || task.type}</Badge>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">יוצר:</span>
                    <span>{(task.creator as any)?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">שעות משוערות:</span>
                    <span>{task.estimated_hours || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">נוצר:</span>
                    <span>{format(new Date(task.created_at), "dd/MM/yyyy")}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
