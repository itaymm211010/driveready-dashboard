import { useNavigate } from 'react-router-dom';
import { X, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function ImpersonationBanner() {
  const { isAdmin, viewingAsTeacherName, setViewingAs } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin || !viewingAsTeacherName) return null;

  function exitView() {
    setViewingAs(null, null);
    navigate('/admin/teachers');
  }

  return (
    <div className="sticky top-0 z-50 bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 shrink-0" />
        <span>צופה בנתונים של <strong>{viewingAsTeacherName}</strong></span>
      </div>
      <button
        onClick={exitView}
        className="flex items-center gap-1 hover:opacity-80 transition-opacity font-medium"
      >
        <X className="h-4 w-4" />
        יציאה
      </button>
    </div>
  );
}
