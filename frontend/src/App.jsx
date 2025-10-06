import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useRoutePreloader } from "./utils/RoutePreloader.jsx";

// Core components (loaded immediately)
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Loading component for Suspense fallback
const PageLoader = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Lazy-loaded components using dynamic imports
// Dashboard components
const DashboardAdmin = React.lazy(() => import("./pages/DashboardAdmin"));
const DashboardTeacher = React.lazy(() => import("./pages/DashboardTeacher"));
const DashboardStudent = React.lazy(() => import("./pages/DashboardStudent"));
const DashboardManagement = React.lazy(() => import("./pages/DashboardManagement"));
const DashboardFinance = React.lazy(() => import("./pages/DashboardFinance"));
const DashboardAcademics = React.lazy(() => import("./pages/DashboardAcademics"));

// Communication features
const MessagingPage = React.lazy(() => import("./pages/MessagingPage"));
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage"));
const Feedback = React.lazy(() => import("./pages/Feedback"));

// Student specific pages
const GradesPage = React.lazy(() => import("./pages/student/GradesPage"));
const AttendancePage = React.lazy(() => import("./pages/student/AttendancePage"));

// Admin management pages
const Students = React.lazy(() => import("./pages/Students"));
const Teachers = React.lazy(() => import("./pages/Teachers"));
const UserManagement = React.lazy(() => import("./pages/UserManagement"));

// Academic management
const Batches = React.lazy(() => import("./pages/Batches"));
const MyClasses = React.lazy(() => import("./pages/MyClasses"));
const ClassesAndStudents = React.lazy(() => import("./pages/ClassesAndStudents"));

// Academic features
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Attendance = React.lazy(() => import("./pages/Attendance"));
const GradeBook = React.lazy(() => import("./pages/GradeBook"));
const ExamManagement = React.lazy(() => import("./pages/ExamManagement"));

// Common features
const Profile = React.lazy(() => import("./pages/Profile"));
const Settings = React.lazy(() => import("./pages/Settings"));
const TaskManagement = React.lazy(() => import("./pages/TaskManagement"));
const Reports = React.lazy(() => import("./pages/Reports"));
const Finance = React.lazy(() => import("./pages/Finance"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Helper function to create lazy route elements
const createLazyRoute = (Component, loadingMessage = "Loading...") => (
  <Layout>
    <Suspense fallback={<PageLoader message={loadingMessage} />}>
      <Component />
    </Suspense>
  </Layout>
);

// Helper for lazy routes with props
const createLazyRouteWithProps = (Component, props, loadingMessage = "Loading...") => (
  <Layout>
    <Suspense fallback={<PageLoader message={loadingMessage} />}>
      <Component {...props} />
    </Suspense>
  </Layout>
);

export default function App() {
  const { user, hasRole, loading } = useAuth();
  
  // Initialize route preloading for better performance
  useRoutePreloader();
  

  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const getDefaultRoute = () => {
    if (!user) return "/login";
    
    switch (user.role) {
      case 'superadmin':
      case 'admin':
        return "/admin";
      case 'management':
        return "/management";
      case 'finance':
        return "/finance";
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
    <ErrorBoundary>
      <div style={{minHeight: '100vh', background: 'white'}}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={<Navigate to={getDefaultRoute()} replace />}
          />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute requireRole={["superadmin", "admin"]} />}>
            <Route path="/admin" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Loading Admin Dashboard..." />}>
                  <DashboardAdmin />
                </Suspense>
              </Layout>
            } />
            <Route path="/admin/users" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Loading User Management..." />}>
                  <UserManagement />
                </Suspense>
              </Layout>
            } />
            <Route path="/admin/students" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Loading Students..." />}>
                  <Students />
                </Suspense>
              </Layout>
            } />
            <Route path="/admin/teachers" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Loading Teachers..." />}>
                  <Teachers />
                </Suspense>
              </Layout>
            } />
            <Route path="/admin/batches" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Loading Batches..." />}>
                  <Batches />
                </Suspense>
              </Layout>
            } />
            <Route path="/admin/analytics" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Loading Analytics..." />}>
                  <Analytics />
                </Suspense>
              </Layout>
            } />
            <Route path="/admin/classes-students" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Loading Classes & Students..." />}>
                  <ClassesAndStudents />
                </Suspense>
              </Layout>
            } />
            <Route path="/admin/classes-students/attendance" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Loading Attendance..." />}>
                  <ClassesAndStudents activeTab="attendance" />
                </Suspense>
              </Layout>
            } />
            <Route path="/admin/classes-students/attendance-record" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Loading Attendance Records..." />}>
                  <ClassesAndStudents activeTab="attendance-record" />
                </Suspense>
              </Layout>
            } />
            <Route path="/admin/classes-students/gradebook" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Loading Grade Book..." />}>
                  <ClassesAndStudents activeTab="gradebook" />
                </Suspense>
              </Layout>
            } />
            <Route path="/admin/classes-students/behavior" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Loading Behavior Records..." />}>
                  <ClassesAndStudents activeTab="behavior" />
                </Suspense>
              </Layout>
            } />
            <Route path="/admin/exams" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Loading Exam Management..." />}>
                  <ExamManagement />
                </Suspense>
              </Layout>
            } />
            <Route path="/admin/reports" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Loading Reports..." />}>
                  <Reports />
                </Suspense>
              </Layout>
            } />
            <Route path="/admin/feedback" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Loading Feedback..." />}>
                  <Feedback />
                </Suspense>
              </Layout>
            } />
            <Route path="/admin/tasks" element={
              <Layout>
                <Suspense fallback={<PageLoader message="Loading Task Management..." />}>
                  <TaskManagement />
                </Suspense>
              </Layout>
            } />
          </Route>

          {/* Finance Routes */}
          <Route element={<ProtectedRoute requireRole={["superadmin", "admin", "finance"]} />}>
            <Route path="/finance" element={createLazyRoute(Finance, "Loading Finance...")} />
            <Route path="/finance/dashboard" element={createLazyRoute(DashboardFinance, "Loading Finance Dashboard...")} />
            <Route path="/finance/fee-collection" element={createLazyRoute(Finance, "Loading Fee Collection...")} />
            <Route path="/finance/admission-fee" element={createLazyRoute(Finance, "Loading Admission Fee Collection...")} />
            <Route path="/finance/payment-sheet" element={createLazyRoute(Finance, "Loading Payment Sheet...")} />
          </Route>

          {/* Management Routes */}
          <Route element={<ProtectedRoute requireRole={["superadmin", "admin", "management"]} />}>
            <Route path="/management" element={createLazyRoute(DashboardManagement, "Loading Management Dashboard...")} />
            <Route path="/management/analytics" element={createLazyRoute(Analytics, "Loading Analytics...")} />
            <Route path="/management/attendance" element={createLazyRoute(Attendance, "Loading Attendance...")} />
            <Route path="/management/gradebook" element={createLazyRoute(GradeBook, "Loading Grade Book...")} />
            <Route path="/management/exams" element={createLazyRoute(ExamManagement, "Loading Exam Management...")} />
            <Route path="/management/feedback" element={createLazyRoute(Feedback, "Loading Feedback...")} />
            <Route path="/management/tasks" element={createLazyRoute(TaskManagement, "Loading Task Management...")} />
          </Route>

          {/* Academics Routes */}
          <Route element={<ProtectedRoute requireRole={["superadmin", "admin", "academics"]} />}>
            <Route path="/academics" element={createLazyRoute(DashboardAcademics, "Loading Academic Dashboard...")} />
            <Route path="/academics/batches" element={createLazyRoute(Batches, "Loading Batches...")} />
            <Route path="/academics/analytics" element={createLazyRoute(Analytics, "Loading Analytics...")} />
            <Route path="/academics/attendance" element={createLazyRoute(Attendance, "Loading Attendance...")} />
            <Route path="/academics/gradebook" element={createLazyRoute(GradeBook, "Loading Grade Book...")} />
            <Route path="/academics/exams" element={createLazyRoute(ExamManagement, "Loading Exam Management...")} />
            <Route path="/academics/tasks" element={createLazyRoute(TaskManagement, "Loading Task Management...")} />
          </Route>

          {/* Teacher Routes */}
          <Route element={<ProtectedRoute requireRole="teacher" />}>
            <Route path="/teacher" element={createLazyRoute(DashboardTeacher, "Loading Teacher Dashboard...")} />
            <Route path="/teacher/classes" element={createLazyRoute(MyClasses, "Loading My Classes...")} />
            <Route path="/teacher/attendance" element={createLazyRoute(Attendance, "Loading Attendance...")} />
            <Route path="/teacher/gradebook" element={createLazyRoute(GradeBook, "Loading Grade Book...")} />
            <Route path="/teacher/exams" element={createLazyRoute(ExamManagement, "Loading Exam Management...")} />
            <Route path="/teacher/tasks" element={createLazyRoute(TaskManagement, "Loading Task Management...")} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute requireRole="student" />}>
            <Route path="/student" element={createLazyRoute(DashboardStudent, "Loading Student Dashboard...")} />
            <Route path="/student/grades" element={createLazyRoute(GradesPage, "Loading Grades...")} />
            <Route path="/student/attendance" element={createLazyRoute(AttendancePage, "Loading Attendance...")} />
            <Route path="/student/feedback" element={createLazyRoute(Feedback, "Loading Feedback...")} />
          </Route>

          {/* Shared Routes - All authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/messaging" element={createLazyRoute(MessagingPage, "Loading Messages...")} />
            <Route path="/notifications" element={createLazyRoute(NotificationsPage, "Loading Notifications...")} />
            <Route path="/profile" element={createLazyRoute(Profile, "Loading Profile...")} />
            <Route path="/settings" element={createLazyRoute(Settings, "Loading Settings...")} />
            <Route path="/tasks" element={createLazyRoute(TaskManagement, "Loading Task Management...")} />
          </Route>

          {/* Fallback Routes */}
          <Route path="/dashboard" element={<Navigate to={getDefaultRoute()} replace />} />
          <Route path="*" element={
            <Suspense fallback={<PageLoader message="Loading..." />}>
              <NotFound />
            </Suspense>
          } />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}
