import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, User } from "lucide-react";
import { CreateSprintDialog } from "./dialogs/CreateSprintDialog";
import { EditSprintDialog } from "./dialogs/EditSprintDialog";

export const SprintsTab = () => {
  const { data: sprints, isLoading } = useQuery({
    queryKey: ["pm_sprints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sprints")
        .select(`*, creator:teachers!sprints_created_by_fkey(name)`)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const statusLabels: Record<string, string> = {
    planned: "מתוכנן", active: "פעיל", completed: "הושלם",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "completed": return "secondary";
      case "planned": return "outline";
      default: return "outline";
    }
  };

  if (isLoading) return <div className="text-right p-4">טוען ספרינטים...</div>;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-start">
        <CreateSprintDialog />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sprints?.map((sprint) => (
          <Card key={sprint.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{sprint.name}</CardTitle>
                <Badge variant={getStatusColor(sprint.status)}>
                  {statusLabels[sprint.status] || sprint.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {sprint.description && (
                <p className="text-sm text-muted-foreground">{sprint.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span dir="ltr">
                  {format(new Date(sprint.start_date), "dd/MM")} -{" "}
                  {format(new Date(sprint.end_date), "dd/MM/yyyy")}
                </span>
              </div>
              {(sprint.creator as any)?.name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4 shrink-0" />
                  <span>{(sprint.creator as any).name}</span>
                </div>
              )}
              <div className="flex justify-start mt-2">
                <EditSprintDialog sprint={sprint} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
