import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CreateBugDialog } from "./dialogs/CreateBugDialog";
import { EditBugDialog } from "./dialogs/EditBugDialog";

export const BugReportsTab = () => {
  const { data: bugs, isLoading } = useQuery({
    queryKey: ["pm_bug_reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bug_reports")
        .select(`*, reporter:teachers!bug_reports_reporter_id_fkey(name)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const severityLabels: Record<string, string> = {
    minor: "קל", moderate: "בינוני", major: "משמעותי", critical: "קריטי", blocker: "חוסם",
  };
  const statusLabels: Record<string, string> = {
    open: "פתוח", in_progress: "בטיפול", resolved: "נפתר", closed: "סגור",
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "blocker": case "critical": return "destructive";
      case "major": case "moderate": return "secondary";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "default";
      case "in_progress": return "secondary";
      default: return "outline";
    }
  };

  if (isLoading) return <div>טוען באגים...</div>;

  return (
    <Card dir="rtl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>דיווחי באגים</CardTitle>
          <CreateBugDialog />
        </div>
      </CardHeader>
      <CardContent>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>כותרת</TableHead>
                <TableHead>חומרה</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>מדווח</TableHead>
                <TableHead>תיאור</TableHead>
                <TableHead>נוצר ב</TableHead>
                <TableHead>נפתר ב</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bugs?.map((bug) => (
                <TableRow key={bug.id}>
                  <TableCell className="font-medium">{bug.title}</TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(bug.severity)}>
                      {severityLabels[bug.severity] || bug.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(bug.status)}>
                      {statusLabels[bug.status] || bug.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{(bug.reporter as any)?.name || '-'}</TableCell>
                  <TableCell className="max-w-md truncate">{bug.description}</TableCell>
                  <TableCell dir="ltr" className="text-end">{format(new Date(bug.created_at), "dd/MM/yyyy")}</TableCell>
                  <TableCell dir="ltr" className="text-end">
                    {bug.resolved_at ? format(new Date(bug.resolved_at), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell><EditBugDialog bug={bug} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="md:hidden space-y-4">
          {bugs?.map((bug) => (
            <Card key={bug.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-lg">{bug.title}</h3>
                  <EditBugDialog bug={bug} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getSeverityColor(bug.severity)}>
                    {severityLabels[bug.severity] || bug.severity}
                  </Badge>
                  <Badge variant={getStatusColor(bug.status)}>
                    {statusLabels[bug.status] || bug.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{bug.description}</p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">מדווח:</span>
                    <span>{(bug.reporter as any)?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">נוצר:</span>
                    <span dir="ltr">{format(new Date(bug.created_at), "dd/MM/yyyy")}</span>
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
