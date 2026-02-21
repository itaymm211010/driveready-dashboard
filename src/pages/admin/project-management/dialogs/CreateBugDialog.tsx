import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export function CreateBugDialog() {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuthContext();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "", description: "", severity: "moderate", status: "open", steps_to_reproduce: "",
  });

  const createBug = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("bug_reports").insert([{ ...data, reporter_id: currentUser?.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pm_bug_reports"] });
      toast.success("הבאג נוצר בהצלחה");
      setOpen(false);
      setFormData({ title: "", description: "", severity: "moderate", status: "open", steps_to_reproduce: "" });
    },
    onError: (e) => { toast.error("שגיאה ביצירת הבאג"); console.error(e); },
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); createBug.mutate(formData); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 ml-2" />באג חדש</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>דיווח באג חדש</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>כותרת</Label>
            <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div>
            <Label>תיאור</Label>
            <Textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
          </div>
          <div>
            <Label>צעדים לשחזור</Label>
            <Textarea value={formData.steps_to_reproduce} onChange={(e) => setFormData({ ...formData, steps_to_reproduce: e.target.value })} rows={3} placeholder={"1. לחץ על...\n2. מלא את...\n3. הבאג מופיע..."} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>חומרה</Label>
              <Select value={formData.severity} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">קל</SelectItem>
                  <SelectItem value="moderate">בינוני</SelectItem>
                  <SelectItem value="major">משמעותי</SelectItem>
                  <SelectItem value="critical">קריטי</SelectItem>
                  <SelectItem value="blocker">חוסם</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>סטטוס</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">פתוח</SelectItem>
                  <SelectItem value="in_progress">בטיפול</SelectItem>
                  <SelectItem value="resolved">נפתר</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
            <Button type="submit" disabled={createBug.isPending}>{createBug.isPending ? "יוצר..." : "צור דיווח"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
