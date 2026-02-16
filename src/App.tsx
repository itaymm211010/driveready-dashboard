import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import TeacherToday from "./pages/teacher/TeacherToday";
import ActiveLesson from "./pages/teacher/ActiveLesson";
import StudentProfile from "./pages/teacher/StudentProfile";
import StudentReport from "./pages/student/StudentReport";
import StudentsList from "./pages/teacher/StudentsList";
import CalendarPage from "./pages/teacher/CalendarPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="drivekal-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/teacher/today" replace />} />
            <Route path="/teacher/today" element={<TeacherToday />} />
            <Route path="/teacher/lesson/:id" element={<ActiveLesson />} />
            <Route path="/teacher/calendar" element={<CalendarPage />} />
            <Route path="/teacher/students" element={<StudentsList />} />
            <Route path="/teacher/student/:id" element={<StudentProfile />} />
            <Route path="/student/:id/report" element={<StudentReport />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
