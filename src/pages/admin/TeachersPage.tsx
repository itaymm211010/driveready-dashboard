import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Trash2, Plus, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { AddTeacherModal } from '@/components/admin/AddTeacherModal';

export default function TeachersPage() {
  const { isAdmin, loading, teacherProfile, signOut } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: teachers, isLoading } = useQuery({
    queryKey: ['admin-teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_admin', false)
        .is('parent_teacher_id', null)
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const { error } = await supabase.from('teachers').delete().eq('id', teacherId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teachers'] });
      toast.success('מורה הוסר בהצלחה');
    },
    onError: () => toast.error('שגיאה בהסרת המורה'),
  });

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-xl font-bold font-heading flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              ניהול מורים
            </h1>
            <p className="text-xs text-muted-foreground">{teacherProfile?.name}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 ms-1" />
              הוסף מורה
            </Button>
            <Button size="sm" variant="ghost" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        {isLoading && (
          <p className="text-center text-muted-foreground py-8">טוען...</p>
        )}

        {!isLoading && (teachers ?? []).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">אין מורים עדיין</p>
            <p className="text-sm">לחץ "הוסף מורה" כדי להתחיל</p>
          </div>
        )}

        {(teachers ?? []).map((teacher) => (
          <Card key={teacher.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{teacher.name}</p>
                <p className="text-sm text-muted-foreground" dir="ltr">{teacher.email}</p>
                {teacher.phone && (
                  <p className="text-sm text-muted-foreground">{teacher.phone}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => deleteMutation.mutate(teacher.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddTeacherModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
