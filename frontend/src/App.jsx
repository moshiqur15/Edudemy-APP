import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// Dashboard components
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardTeacher from "./pages/DashboardTeacher";
import DashboardStudent from "./pages/DashboardStudent";
import DashboardManagement from "./pages/DashboardManagement";
import DashboardAcademics from "./pages/DashboardAcademics";

// Messaging and Notifications
import MessagingPage from "./pages/MessagingPage";
import NotificationsPage from "./pages/NotificationsPage";

// Student specific pages
import GradesPage from "./pages/student/GradesPage";
import AttendancePage from "./pages/student/AttendancePage";

// Other pages that exist
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Batches from "./pages/Batches";
import MyClasses from "./pages/MyClasses";
import PermissionsManagement from "./pages/PermissionsManagement";
import NotFound from "./pages/NotFound";

export default function App() {
  const { user, hasRole } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return "/login";
    
    switch (user.role) {
      case 'superadmin':
      case 'admin':
        return "/admin";
      case 'management':
        return "/management";
      case 'academics':
        return "/academics";
      case 'teacher':
        return "/teacher";
      case 'student':
        return "/student";
      default:
        return "/login";
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={<Navigate to={getDefaultRoute()} replace />}
      />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute requireRole={["superadmin", "admin"]} />}>
        <Route path="/admin" element={<Layout><DashboardAdmin /></Layout>} />
        <Route path="/admin/students" element={<Layout><Students /></Layout>} />
        <Route path="/admin/teachers" element={<Layout><Teachers /></Layout>} />
        <Route path="/admin/batches" element={<Layout><Batches /></Layout>} />
        <Route path="/admin/permissions" element={<Layout><PermissionsManagement /></Layout>} />
      </Route>

      {/* Management Routes */}
      <Route element={<ProtectedRoute requireRole={["superadmin", "admin", "management"]} />}>
        <Route path="/management" element={<Layout><DashboardManagement /></Layout>} />
      </Route>

      {/* Academics Routes */}
      <Route element={<ProtectedRoute requireRole={["superadmin", "admin", "academics"]} />}>
        <Route path="/academics" element={<Layout><DashboardAcademics /></Layout>} />
        <Route path="/academics/batches" element={<Layout><Batches /></Layout>} />
      </Route>

      {/* Teacher Routes */}
      <Route element={<ProtectedRoute requireRole="teacher" />}>
        <Route path="/teacher" element={<Layout><DashboardTeacher /></Layout>} />
        <Route path="/teacher/classes" element={<Layout><MyClasses /></Layout>} />
      </Route>

      {/* Student Routes */}
      <Route element={<ProtectedRoute requireRole="student" />}>
        <Route path="/student" element={<Layout><DashboardStudent /></Layout>} />
        <Route path="/student/grades" element={<Layout><GradesPage /></Layout>} />
        <Route path="/student/attendance" element={<Layout><AttendancePage /></Layout>} />
      </Route>

      {/* Shared Routes - All authenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/messaging" element={<Layout><MessagingPage /></Layout>} />
        <Route path="/notifications" element={<Layout><NotificationsPage /></Layout>} />
      </Route>

      {/* Fallback Routes */}
      <Route path="/dashboard" element={<Navigate to={getDefaultRoute()} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
