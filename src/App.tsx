import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FontSizeProvider } from "@/components/FontSizeProvider";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import TeacherToday from "./pages/teacher/TeacherToday";
import ActiveLesson from "./pages/teacher/ActiveLesson";
import StudentProfile from "./pages/teacher/StudentProfile";
import StudentReport from "./pages/student/StudentReport";
import StudentsList from "./pages/teacher/StudentsList";
import CalendarPage from "./pages/teacher/CalendarPage";
import ReportsPage from "./pages/teacher/ReportsPage";
import SubstitutesPage from "./pages/teacher/SubstitutesPage";
import TeachersPage from "./pages/admin/TeachersPage";
import ProjectManagement from "./pages/admin/project-management/Index";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();


/** מנתב ל-home הנכון לפי תפקיד */
function HomeRedirect() {
  const { currentUser, isAdmin, loading } = useAuthContext();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin/teachers" replace />;
  return <Navigate to="/teacher/today" replace />;
}

/** Route שמגן על דפי מורה — מנתב אדמין ומשתמש לא מחובר החוצה.
 *  אדמין שמתחזה למורה (viewingAsTeacherId מוגדר) מורשה להיכנס. */
function TeacherRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isAdmin, viewingAsTeacherId, loading } = useAuthContext();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (isAdmin && !viewingAsTeacherId) return <Navigate to="/admin/teachers" replace />;
  return <>{children}</>;
}

/** Route שמגן על דפי אדמין */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isAdmin, loading } = useAuthContext();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/teacher/today" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={<HomeRedirect />} />

      {/* Teacher routes */}
      <Route path="/teacher/today" element={<TeacherRoute><TeacherToday /></TeacherRoute>} />
      <Route path="/teacher/lesson/:id" element={<TeacherRoute><ActiveLesson /></TeacherRoute>} />
      <Route path="/teacher/calendar" element={<TeacherRoute><CalendarPage /></TeacherRoute>} />
      <Route path="/teacher/students" element={<TeacherRoute><StudentsList /></TeacherRoute>} />
      <Route path="/teacher/student/:id" element={<TeacherRoute><StudentProfile /></TeacherRoute>} />
      <Route path="/teacher/reports" element={<TeacherRoute><ReportsPage /></TeacherRoute>} />
      <Route path="/teacher/substitutes" element={<TeacherRoute><SubstitutesPage /></TeacherRoute>} />

      {/* Admin routes */}
      <Route path="/admin/teachers" element={<AdminRoute><TeachersPage /></AdminRoute>} />
      <Route path="/admin/project-management" element={<AdminRoute><ProjectManagement /></AdminRoute>} />

      {/* Public */}
      <Route path="/student/:id/report" element={<StudentReport />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="drivekal-theme">
        <FontSizeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </FontSizeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
