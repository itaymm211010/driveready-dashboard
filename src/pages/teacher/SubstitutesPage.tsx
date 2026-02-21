import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import { BottomNav } from '@/components/teacher/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserCheck, Trash2, Plus, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { AddSubstituteModal } from '@/components/teacher/AddSubstituteModal';
import { EditSubstituteModal } from '@/components/teacher/EditSubstituteModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Substitute {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  lesson_cost: number | null;
}

export default function SubstitutesPage() {
  const { rootTeacherId, isSubstitute } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubstitute, setEditingSubstitute] = useState<Substitute | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: substitutes, isLoading } = useQuery({
    queryKey: ['substitutes', rootTeacherId],
    enabled: !!rootTeacherId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('parent_teacher_id', rootTeacherId!);
      if (error) throw error;
      return (data ?? []) as Substitute[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const { error } = await supabase.from('teachers').delete().eq('id', teacherId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substitutes'] });
      toast.success('מחליף הוסר בהצלחה');
      setDeletingId(null);
    },
    onError: () => {
      toast.error('שגיאה בהסרת המחליף');
      setDeletingId(null);
    },
  });

  if (isSubstitute) return <Navigate to="/" replace />;

  const deletingSubstitute = substitutes?.find(s => s.id === deletingId);

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-xl font-bold font-heading flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            מורים מחליפים
          </h1>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 ms-1" />
            הוסף מחליף
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        {isLoading && <p className="text-center text-muted-foreground">טוען...</p>}
        {!isLoading && (substitutes ?? []).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>אין מחליפים עדיין</p>
            <p className="text-sm">לחץ "הוסף מחליף" כדי להוסיף</p>
          </div>
        )}
        {(substitutes ?? []).map((sub) => (
          <Card key={sub.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{sub.name}</p>
                <p className="text-sm text-muted-foreground">{sub.email}</p>
                {sub.phone && <p className="text-sm text-muted-foreground">{sub.phone}</p>}
                {sub.lesson_cost != null && (
                  <p className="text-sm text-muted-foreground">עלות שיעור: ₪{sub.lesson_cost}</p>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingSubstitute(sub)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeletingId(sub.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddSubstituteModal open={showAddModal} onOpenChange={setShowAddModal} />

      {editingSubstitute && (
        <EditSubstituteModal
          open={!!editingSubstitute}
          onOpenChange={(o) => !o && setEditingSubstitute(null)}
          substitute={editingSubstitute}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>הסרת מורה מחליף</AlertDialogTitle>
            <AlertDialogDescription>
              האם להסיר את {deletingSubstitute?.name}? השיעורים שהועברו על ידם יישמרו אך לא יוצגו שם המורה.
              שים לב: חשבון הכניסה שלהם ישאר פעיל — פנה לתמיכה להסרה מלאה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
            >
              הסר
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}
