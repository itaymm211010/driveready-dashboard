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

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuthContext();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "", description: "", type: "feature", status: "todo",
    priority: "medium", sprint_id: "", estimated_hours: "",
  });

  const { data: sprints } = useQuery({
    queryKey: ["pm_sprints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sprints").select("*").order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createTask = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("tasks").insert([{
        ...data,
        created_by: currentUser?.id,
        estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null,
        sprint_id: data.sprint_id || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pm_tasks"] });
      toast.success("המשימה נוצרה בהצלחה");
      setOpen(false);
      setFormData({ title: "", description: "", type: "feature", status: "todo", priority: "medium", sprint_id: "", estimated_hours: "" });
    },
    onError: (error) => { toast.error("שגיאה ביצירת המשימה"); console.error(error); },
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); createTask.mutate(formData); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 ms-1" />משימה חדשה</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader><DialogTitle>יצירת משימה חדשה</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">כותרת</Label>
            <Input id="title" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} dir="rtl" />
          </div>
          <div>
            <Label htmlFor="description">תיאור</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} dir="rtl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
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
            <div>
              <Label>עדיפות</Label>
              <Select dir="rtl" value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">נמוכה</SelectItem>
                  <SelectItem value="medium">בינונית</SelectItem>
                  <SelectItem value="high">גבוהה</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>סטטוס</Label>
              <Select dir="rtl" value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">לביצוע</SelectItem>
                  <SelectItem value="in_progress">בתהליך</SelectItem>
                  <SelectItem value="done">הושלם</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>שעות משוערות</Label>
              <Input type="number" step="0.5" value={formData.estimated_hours} onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })} dir="ltr" />
            </div>
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
          <div className="flex justify-start gap-2">
            <Button type="submit" disabled={createTask.isPending}>{createTask.isPending ? "יוצר..." : "צור משימה"}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
