import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function CreateDeploymentDialog() {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuthContext();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    version: "", environment: "production", status: "pending",
    git_commit_hash: "", notes: "", sprint_id: "",
  });

  const { data: sprints } = useQuery({
    queryKey: ["pm_sprints"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sprints").select("*").order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createDeployment = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("deployments").insert([{
        ...data, deployed_by: currentUser?.id, sprint_id: data.sprint_id || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pm_deployments"] });
      toast.success("הפריסה נוצרה בהצלחה");
      setOpen(false);
      setFormData({ version: "", environment: "production", status: "pending", git_commit_hash: "", notes: "", sprint_id: "" });
    },
    onError: (e) => { toast.error("שגיאה ביצירת הפריסה"); console.error(e); },
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); createDeployment.mutate(formData); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 ms-1" />פריסה חדשה</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader><DialogTitle>יצירת פריסה חדשה</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>גרסה</Label>
              <Input required placeholder="1.0.0" value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} dir="ltr" />
            </div>
            <div>
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
          <div>
            <Label>Git Commit Hash</Label>
            <Input placeholder="abc123def456" value={formData.git_commit_hash} onChange={(e) => setFormData({ ...formData, git_commit_hash: e.target.value })} dir="ltr" />
          </div>
          <div>
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
          <div>
            <Label>ספרינט</Label>
            <Select dir="rtl" value={formData.sprint_id} onValueChange={(v) => setFormData({ ...formData, sprint_id: v })}>
              <SelectTrigger><SelectValue placeholder="בחר ספרינט (אופציונלי)" /></SelectTrigger>
              <SelectContent>
                {sprints?.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>הערות</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} dir="rtl" />
          </div>
          <div className="flex justify-start gap-2">
            <Button type="submit" disabled={createDeployment.isPending}>{createDeployment.isPending ? "יוצר..." : "צור פריסה"}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
