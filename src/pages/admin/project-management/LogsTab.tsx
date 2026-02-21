import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export const LogsTab = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["pm_task_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "critical": case "error": return "destructive";
      case "warning": return "secondary";
      default: return "outline";
    }
  };

  if (isLoading) return <div>טוען לוגים...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>לוגי מערכת</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>זמן</TableHead>
              <TableHead>רמה</TableHead>
              <TableHead>הודעה</TableHead>
              <TableHead>קובץ</TableHead>
              <TableHead>שורה</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs">
                  {format(new Date(log.created_at), "dd/MM HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <Badge variant={getLevelColor(log.level)}>{log.level}</Badge>
                </TableCell>
                <TableCell className="max-w-md truncate">{log.message}</TableCell>
                <TableCell className="text-xs">{log.file_path || "-"}</TableCell>
                <TableCell className="text-xs">{log.line_number || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
