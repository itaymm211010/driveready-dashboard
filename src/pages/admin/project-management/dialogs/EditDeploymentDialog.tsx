import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

interface EditDeploymentDialogProps { deployment: any; }

export const EditDeploymentDialog = ({ deployment }: EditDeploymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    version: deployment.version, environment: deployment.environment,
    git_commit_hash: deployment.git_commit_hash || "", status: deployment.status,
    sprint_id: deployment.sprint_id || "", notes: deployment.notes || "",
  });

  const { data: sprints } = useQuery({
    queryKey: ["pm_sprints"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sprints").select("id, name").order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateDeployment = useMutation({
    mutationFn: async (d: typeof formData) => {
      const { error } = await supabase.from("deployments").update(d).eq("id", deployment.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pm_deployments"] }); toast.success("הפריסה עודכנה"); setOpen(false); },
    onError: (e) => toast.error("שגיאה: " + e.message),
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); updateDeployment.mutate(formData); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm"><Pencil className="h-4 w-4 ms-1" />ערוך</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>עריכת פריסה</DialogTitle>
          <DialogDescription>ערוך את פרטי הפריסה</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>גרסה</Label>
              <Input value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} required dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>סביבה</Label>
              <Select dir="rtl" value={formData.environment} onValueChange={(v) => setFormData({ ...formData, environment: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">פיתוח</SelectItem>
                  <SelectItem value="staging">בדיקות</SelectItem>
                  <SelectItem value="production">ייצור</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Git Commit Hash</Label>
            <Input value={formData.git_commit_hash} onChange={(e) => setFormData({ ...formData, git_commit_hash: e.target.value })} dir="ltr" />
          </div>
          <div className="space-y-2">
            <Label>סטטוס</Label>
            <Select dir="rtl" value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">ממתין</SelectItem>
                <SelectItem value="in_progress">בתהליך</SelectItem>
                <SelectItem value="success">הצליח</SelectItem>
                <SelectItem value="failed">נכשל</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>ספרינט (אופציונלי)</Label>
            <Select dir="rtl" value={formData.sprint_id} onValueChange={(v) => setFormData({ ...formData, sprint_id: v })}>
              <SelectTrigger><SelectValue placeholder="בחר ספרינט" /></SelectTrigger>
              <SelectContent>
                {sprints?.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>הערות</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} dir="rtl" />
          </div>
          <div className="flex justify-start gap-2">
            <Button type="submit" disabled={updateDeployment.isPending}>{updateDeployment.isPending ? "שומר..." : "שמור"}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
