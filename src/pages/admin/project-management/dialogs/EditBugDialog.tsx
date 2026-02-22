import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
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

interface EditBugDialogProps { bug: any; }

export const EditBugDialog = ({ bug }: EditBugDialogProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: bug.title, description: bug.description, severity: bug.severity,
    status: bug.status, steps_to_reproduce: bug.steps_to_reproduce || "",
  });

  const updateBug = useMutation({
    mutationFn: async (d: typeof formData) => {
      const { error } = await supabase.from("bug_reports").update(d).eq("id", bug.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pm_bug_reports"] }); toast.success("הבאג עודכן"); setOpen(false); },
    onError: (e) => toast.error("שגיאה: " + e.message),
  });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); updateBug.mutate(formData); };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm"><Pencil className="h-4 w-4 ms-1" />ערוך</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>עריכת באג</DialogTitle>
          <DialogDescription>ערוך את פרטי הבאג</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>כותרת</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required dir="rtl" />
          </div>
          <div className="space-y-2">
            <Label>תיאור</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required dir="rtl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>חומרה</Label>
              <Select dir="rtl" value={formData.severity} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
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
            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select dir="rtl" value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">פתוח</SelectItem>
                  <SelectItem value="in_progress">בטיפול</SelectItem>
                  <SelectItem value="resolved">נפתר</SelectItem>
                  <SelectItem value="closed">סגור</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>שלבים לשחזור</Label>
            <Textarea value={formData.steps_to_reproduce} onChange={(e) => setFormData({ ...formData, steps_to_reproduce: e.target.value })} dir="rtl" />
          </div>
          <div className="flex justify-start gap-2">
            <Button type="submit" disabled={updateBug.isPending}>{updateBug.isPending ? "שומר..." : "שמור"}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
