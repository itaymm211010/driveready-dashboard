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

interface EditTaskDialogProps { task: any; }

export const EditTaskDialog = ({ task }: EditTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    type: task.type,
    status: task.status,
    priority: task.priority,
    estimated_hours: task.estimated_hours ?? "",
    sprint_id: task.sprint_id || "",
  });

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setFormData({
        title: task.title,
        description: task.description || "",
        type: task.type,
        status: task.status,
        priority: task.priority,
        estimated_hours: task.estimated_hours ?? "",
        sprint_id: task.sprint_id || "",
      });
    }
    setOpen(isOpen);
  };

  const { data: sprints } = useQuery({
    queryKey: ["pm_sprints"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sprints").select("id, name").order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateTask = useMutation({
    mutationFn: async (d: typeof formData) => {
      const { error } = await supabase.from("tasks").update({
        title: d.title,
        description: d.description || null,
        type: d.type,
        status: d.status,
        priority: d.priority,
        estimated_hours: d.estimated_hours !== "" ? parseFloat(String(d.estimated_hours)) : null,
        sprint_id: d.sprint_id || null,
      }).eq("id", task.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pm_tasks"] });
      toast.success("המשימה עודכנה");
      setOpen(false);
    },
    onError: (e) => toast.error("שגיאה: " + e.message),
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); updateTask.mutate(formData); };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm"><Pencil className="h-4 w-4 ms-1" />ערוך</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>עריכת משימה</DialogTitle>
          <DialogDescription>ערוך את פרטי המשימה</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>כותרת</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required dir="rtl" />
          </div>

          <div className="space-y-2">
            <Label>תיאור</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} dir="rtl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>סוג</Label>
              <Select dir="rtl" value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">תכונה</SelectItem>
                  <SelectItem value="bug">באג</SelectItem>
                  <SelectItem value="improvement">שיפור</SelectItem>
                  <SelectItem value="documentation">תיעוד</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select dir="rtl" value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">לביצוע</SelectItem>
                  <SelectItem value="in_progress">בביצוע</SelectItem>
                  <SelectItem value="review">בסקירה</SelectItem>
                  <SelectItem value="done">הושלם</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>עדיפות</Label>
              <Select dir="rtl" value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">נמוכה</SelectItem>
                  <SelectItem value="medium">בינונית</SelectItem>
                  <SelectItem value="high">גבוהה</SelectItem>
                  <SelectItem value="urgent">דחוף</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>שעות משוערות</Label>
              <Input type="number" step="0.5" value={formData.estimated_hours} onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })} dir="ltr" />
            </div>
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

          <div className="flex justify-start gap-2 pt-1">
            <Button type="submit" disabled={updateTask.isPending}>{updateTask.isPending ? "שומר..." : "שמור"}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
