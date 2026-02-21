import { Home, CalendarDays, Users, BarChart3, UserCheck, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';

const baseTabs = [
  { path: '/teacher/today', label: 'היום', icon: Home },
  { path: '/teacher/calendar', label: 'יומן', icon: CalendarDays },
  { path: '/teacher/students', label: 'תלמידים', icon: Users },
  { path: '/teacher/reports', label: 'דוחות', icon: BarChart3 },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSubstitute, isAdmin, signOut } = useAuth();

  const tabs = [
    ...baseTabs,
    ...(!isSubstitute && !isAdmin ? [{ path: '/teacher/substitutes', label: 'מחליפים', icon: UserCheck }] : []),
  ];

  return (
    <>
      <ImpersonationBanner />
      <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border/50 nav-glass safe-area-bottom">
        <div className="flex items-stretch">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-smooth relative',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
                <tab.icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]")} />
                <span className="text-xs font-medium font-body">{tab.label}</span>
              </button>
            );
          })}

          {/* Logout — only for real teachers, not admin viewing a teacher */}
          {!isAdmin && (
            <button
              onClick={signOut}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] text-muted-foreground hover:text-destructive transition-smooth"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-xs font-medium font-body">יציאה</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
