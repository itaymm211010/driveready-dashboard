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
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuthContext();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/teacher/today" replace />} />
      <Route path="/teacher/today" element={<ProtectedRoute><TeacherToday /></ProtectedRoute>} />
      <Route path="/teacher/lesson/:id" element={<ProtectedRoute><ActiveLesson /></ProtectedRoute>} />
      <Route path="/teacher/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/teacher/students" element={<ProtectedRoute><StudentsList /></ProtectedRoute>} />
      <Route path="/teacher/student/:id" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
      <Route path="/teacher/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/teacher/substitutes" element={<ProtectedRoute><SubstitutesPage /></ProtectedRoute>} />
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
