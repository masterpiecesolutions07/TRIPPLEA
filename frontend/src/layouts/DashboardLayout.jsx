import { Link, NavLink, Navigate, useLocation } from "react-router-dom";
import {
  BellIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  HomeIcon,
  MegaphoneIcon,
  PencilSquareIcon,
  RectangleStackIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UserPlusIcon,
  UsersIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const STUDENT = [
  ["/student", "Home", HomeIcon],
  ["/student/progress", "Progress", ChartBarIcon],
  ["/student/sessions", "Sessions", CalendarDaysIcon],
  ["/student/notifications", "Notifications", BellIcon],
  ["/student/story", "My story", PencilSquareIcon],
  ["/student/profile", "Profile", UsersIcon]
];

const MENTOR = [
  ["/mentor", "Overview", HomeIcon],
  ["/mentor/applications", "Applications", ClipboardDocumentListIcon],
  ["/mentor/cohorts", "Cohorts", CalendarDaysIcon],
  ["/mentor/students", "Students", UserGroupIcon],
  ["/mentor/certificates", "Certificates", ShieldCheckIcon],
  ["/mentor/trades", "Trades", ChartBarIcon],
  ["/mentor/alerts", "Alerts", MegaphoneIcon],
  ["/mentor/stories", "Stories", BookOpenIcon],
  ["/mentor/testimonials", "Testimonials", ChatBubbleLeftRightIcon],
  ["/mentor/messages", "Messages", BellIcon],
  ["/mentor/profile", "Profile", UsersIcon]
];

const ADMIN = [
  ["/admin", "Overview", HomeIcon],
  ["/admin/users", "Users", UsersIcon],
  ["/admin/mentors", "Mentors", UserPlusIcon],
  ["/admin/settings", "Settings", Cog6ToothIcon],
  ["/admin/audit", "Audit log", RectangleStackIcon],
  ["/admin/analytics", "Analytics", ChartBarIcon],
  ...MENTOR.filter(([path]) => path !== "/mentor" && path !== "/mentor/profile")
];

function linksFor(pathname, role) {
  if (pathname.startsWith("/student") || (role !== "mentor" && role !== "admin")) return STUDENT;
  if (role === "admin") return ADMIN;
  return MENTOR;
}

export function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  if (user?.mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }
  const links = linksFor(location.pathname, user?.role);

  return (
    <div className="dash">
      <aside className="dash__side">
        <a className="dash__brand" href="/">
          <img src="/assets/images/logo-mark.png" alt="" />
          <div>
            <strong>Tripple A</strong>
            <span>{user?.role}</span>
          </div>
        </a>
        <nav className="dash__nav" aria-label="Dashboard">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `dash__link${isActive ? " is-active" : ""}`}>
              <Icon className="dash-icon" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="dash__main">
        <header className="dash__top">
          <div>
            <p className="dash__who">{user?.name}</p>
          </div>
          <div className="dash__actions">
            <button className="btn btn--ghost" type="button" onClick={toggle}>{theme === "dark" ? "Light" : "Dark"}</button>
            <Link className="btn btn--ghost" to="/">Public site</Link>
            <button className="btn btn--primary" type="button" onClick={logout}>Log out</button>
          </div>
        </header>
        {children}
      </section>
    </div>
  );
}
