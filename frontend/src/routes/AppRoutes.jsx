import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { SiteLayout } from "../components/SiteLayout.jsx";
import { DashboardLayout } from "../layouts/DashboardLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { About } from "../pages/About.jsx";
import { Apply } from "../pages/Apply.jsx";
import { Contact } from "../pages/Contact.jsx";
import { Home } from "../pages/Home.jsx";
import { NotFound } from "../pages/NotFound.jsx";
import { Privacy } from "../pages/Privacy.jsx";
import { Programme } from "../pages/Programme.jsx";
import { Strategy } from "../pages/Strategy.jsx";
import { Terms } from "../pages/Terms.jsx";
import { Updates } from "../pages/Updates.jsx";
import { Login } from "../pages/auth/Login.jsx";
import { Register } from "../pages/auth/Register.jsx";
import { EnrollmentDetail } from "../pages/dashboard/EnrollmentDetail.jsx";
import { Enrollments } from "../pages/dashboard/Enrollments.jsx";
import { FaqsPage } from "../pages/dashboard/Faqs.jsx";
import { ManageCourse } from "../pages/dashboard/ManageCourse.jsx";
import { Analytics, AuditLog, SettingsPage } from "../pages/dashboard/AdminPages.jsx";
import { Accounts } from "../pages/dashboard/Accounts.jsx";
import { Applications } from "../pages/dashboard/Applications.jsx";
import { ChangePassword } from "../pages/dashboard/ChangePassword.jsx";
import { Cohorts } from "../pages/dashboard/Cohorts.jsx";
import { Sessions } from "../pages/dashboard/Sessions.jsx";
import { Overview } from "../pages/dashboard/Overview.jsx";
import { RecordList } from "../pages/dashboard/RecordList.jsx";
import { Students } from "../pages/dashboard/Students.jsx";
import { Profile, StudentCourse, StudentDay, StudentHome, StudentLesson, StudentNotifications, StudentProgress, StudentSessions, SubmitStory } from "../pages/dashboard/StudentPages.jsx";
import { Mentors, Users } from "../pages/dashboard/Users.jsx";
import { homePath } from "../utils/homePath.js";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { RoleRoute } from "./RoleRoute.jsx";

function Guest({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <p className="section container">Checking your session…</p>;
  if (user) return <Navigate to={homePath(user)} replace />;
  return children;
}

function PublicFrame() {
  return <SiteLayout><Outlet /></SiteLayout>;
}

function Desk({ allow, children }) {
  const inner = allow ? <RoleRoute allow={allow}>{children}</RoleRoute> : children;
  return <ProtectedRoute><DashboardLayout>{inner}</DashboardLayout></ProtectedRoute>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicFrame />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/strategy" element={<Strategy />} />
        <Route path="/programme" element={<Programme />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/login" element={<Guest><Login /></Guest>} />
        <Route path="/register" element={<Guest><Register /></Guest>} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/change-password" element={<Desk><ChangePassword /></Desk>} />
      <Route path="/student" element={<Desk><StudentHome /></Desk>} />
      <Route path="/student/course" element={<Desk><StudentCourse /></Desk>} />
      <Route path="/student/course/watch/:moduleId" element={<Desk><StudentDay /></Desk>} />
      <Route path="/student/lessons/:id" element={<Desk><StudentLesson /></Desk>} />
      <Route path="/student/progress" element={<Desk><StudentProgress /></Desk>} />
      <Route path="/student/sessions" element={<Desk><StudentSessions /></Desk>} />
      <Route path="/student/notifications" element={<Desk><StudentNotifications /></Desk>} />
      <Route path="/student/story" element={<Desk><SubmitStory /></Desk>} />
      <Route path="/student/profile" element={<Desk><Profile /></Desk>} />
      <Route path="/mentor" element={<Desk allow={["mentor", "admin"]}><Overview title="Mentor overview" /></Desk>} />
      <Route path="/mentor/course" element={<Desk allow={["mentor", "admin"]}><ManageCourse /></Desk>} />
      <Route path="/mentor/enrollments" element={<Desk allow={["mentor", "admin"]}><Enrollments /></Desk>} />
      <Route path="/mentor/enrollments/:id" element={<Desk allow={["mentor", "admin"]}><EnrollmentDetail /></Desk>} />
      <Route path="/mentor/applications" element={<Desk allow={["mentor", "admin"]}><Applications /></Desk>} />
      <Route path="/mentor/users" element={<Desk allow={["mentor", "admin"]}><Accounts /></Desk>} />
      <Route path="/mentor/cohorts" element={<Desk allow={["mentor", "admin"]}><Cohorts /></Desk>} />
      <Route path="/mentor/sessions" element={<Desk allow={["mentor", "admin"]}><Sessions /></Desk>} />
      <Route path="/mentor/students" element={<Desk allow={["mentor", "admin"]}><Students /></Desk>} />
      <Route path="/mentor/certificates" element={<Desk allow={["mentor", "admin"]}><RecordList title="Certificates" resource="certificates" empty="No certificates uploaded yet." /></Desk>} />
      <Route path="/mentor/trades" element={<Desk allow={["mentor", "admin"]}><RecordList title="Trades" resource="trades" empty="No trades posted yet." /></Desk>} />
      <Route path="/mentor/alerts" element={<Desk allow={["mentor", "admin"]}><RecordList title="Alerts" resource="alerts" empty="No alerts yet." /></Desk>} />
      <Route path="/mentor/stories" element={<Desk allow={["mentor", "admin"]}><RecordList title="Success stories" resource="posts" empty="No success stories yet." /></Desk>} />
      <Route path="/mentor/messages" element={<Desk allow={["mentor", "admin"]}><RecordList title="Messages" resource="messages" empty="No messages yet." /></Desk>} />
      <Route path="/mentor/profile" element={<Desk allow={["mentor", "admin"]}><Profile /></Desk>} />
      <Route path="/admin" element={<Desk allow={["admin"]}><Overview title="Admin overview" /></Desk>} />
      <Route path="/admin/users" element={<Desk allow={["admin"]}><Users /></Desk>} />
      <Route path="/admin/mentors" element={<Desk allow={["admin"]}><Mentors /></Desk>} />
      <Route path="/admin/settings" element={<Desk allow={["admin"]}><SettingsPage /></Desk>} />
      <Route path="/admin/faqs" element={<Desk allow={["admin"]}><FaqsPage /></Desk>} />
      <Route path="/admin/audit" element={<Desk allow={["admin"]}><AuditLog /></Desk>} />
      <Route path="/admin/analytics" element={<Desk allow={["admin"]}><Analytics /></Desk>} />
    </Routes>
  );
}
