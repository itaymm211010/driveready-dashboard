import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { GitCommit, Clock, User } from "lucide-react";
import { CreateDeploymentDialog } from "./dialogs/CreateDeploymentDialog";
import { EditDeploymentDialog } from "./dialogs/EditDeploymentDialog";

export const DeploymentsTab = () => {
  const { data: deployments, isLoading } = useQuery({
    queryKey: ["pm_deployments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deployments")
        .select(`*, deployer:teachers!deployments_deployed_by_fkey(name)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const statusLabels: Record<string, string> = {
    pending: "ממתין", in_progress: "בתהליך", success: "הצליח", failed: "נכשל",
  };
  const envLabels: Record<string, string> = {
    development: "פיתוח", staging: "בדיקות", production: "ייצור",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "default";
      case "failed": return "destructive";
      case "in_progress": return "secondary";
      default: return "outline";
    }
  };

  if (isLoading) return <div className="text-right p-4">טוען פריסות...</div>;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-start">
        <CreateDeploymentDialog />
      </div>
      {deployments?.map((deployment) => (
        <Card key={deployment.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {envLabels[deployment.environment] || deployment.environment} - v{deployment.version}
              </CardTitle>
              <Badge variant={getStatusColor(deployment.status)}>
                {statusLabels[deployment.status] || deployment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {deployment.git_commit_hash && (
              <div className="flex items-center gap-2 text-sm">
                <GitCommit className="h-4 w-4 text-muted-foreground shrink-0" />
                <code className="text-xs" dir="ltr">{deployment.git_commit_hash}</code>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span dir="ltr">{format(new Date(deployment.created_at), "dd/MM/yyyy HH:mm")}</span>
            </div>
            {(deployment.deployer as any)?.name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4 shrink-0" />
                <span>{(deployment.deployer as any).name}</span>
              </div>
            )}
            {deployment.notes && (
              <p className="text-sm text-muted-foreground">{deployment.notes}</p>
            )}
            {deployment.error_log && (
              <div className="mt-2 rounded-md bg-destructive/10 p-2">
                <p className="text-xs font-mono text-destructive" dir="ltr">{deployment.error_log}</p>
              </div>
            )}
            <div className="flex justify-start mt-2">
              <EditDeploymentDialog deployment={deployment} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
