import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, useLocation } from "react-router-dom";
import {
  AcademicCapIcon,
  Bars3Icon,
  BellIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  VideoCameraIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  HomeIcon,
  LockOpenIcon,
  MegaphoneIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon,
  RectangleStackIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UserPlusIcon,
  UsersIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const STUDENT = [
  ["/student", "Home", HomeIcon],
  ["/student/course", "Course", AcademicCapIcon],
  ["/student/progress", "Progress", ChartBarIcon],
  ["/student/sessions", "Sessions", CalendarDaysIcon],
  ["/student/notifications", "Notifications", BellIcon],
  ["/student/story", "Success stories", PencilSquareIcon],
  ["/student/profile", "Profile", UsersIcon]
];

const MENTOR = [
  ["/mentor", "Overview", HomeIcon],
  ["/mentor/course", "Course", AcademicCapIcon],
  ["/mentor/enrollments", "Enrollments", LockOpenIcon],
  ["/mentor/applications", "Applications", ClipboardDocumentListIcon],
  ["/mentor/users", "Accounts", UsersIcon],
  ["/mentor/cohorts", "Cohorts", CalendarDaysIcon],
  ["/mentor/sessions", "Sessions", VideoCameraIcon],
  ["/mentor/students", "Students", UserGroupIcon],
  ["/mentor/certificates", "Certificates", ShieldCheckIcon],
  ["/mentor/trades", "Trades", ChartBarIcon],
  ["/mentor/alerts", "Alerts", MegaphoneIcon],
  ["/mentor/stories", "Success stories", BookOpenIcon],
  ["/mentor/messages", "Messages", BellIcon],
  ["/mentor/profile", "Profile", UsersIcon]
];

const ADMIN = [
  ["/admin", "Overview", HomeIcon],
  ["/admin/users", "Users", UsersIcon],
  ["/admin/mentors", "Mentors", UserPlusIcon],
  ["/admin/settings", "Settings", Cog6ToothIcon],
  ["/admin/faqs", "Questions", QuestionMarkCircleIcon],
  ["/admin/audit", "Audit log", RectangleStackIcon],
  ["/admin/analytics", "Analytics", ChartBarIcon],
  ...MENTOR.filter(([path]) => path !== "/mentor" && path !== "/mentor/profile"),
  ["/mentor/profile", "Profile", UsersIcon]
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
  const [menu, setMenu] = useState(false);
  useEffect(() => { setMenu(false); }, [location.pathname]);
  if (user?.mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }
  const links = linksFor(location.pathname, user?.role);

  return (
    <div className={`dash${menu ? " is-menu-open" : ""}`}>
      {menu ? <button className="dash__backdrop" type="button" aria-label="Close menu" onClick={() => setMenu(false)} /> : null}
      <aside className={`dash__side${menu ? " is-open" : ""}`}>
        <a className="dash__brand" href="/">
          <img src="/assets/images/logo-mark.png" alt="" />
          <div>
            <strong>Tripple A</strong>
            <span>{user?.role}</span>
          </div>
        </a>
        <nav className="dash__nav" id="dash-nav" aria-label="Dashboard">
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to !== "/mentor/enrollments" && to !== "/student/course"} className={({ isActive }) => `dash__link${isActive ? " is-active" : ""}`}>
              <Icon className="dash-icon" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="dash__main">
        <header className="dash__top">
          <div className="dash__who-row">
            <button className="dash__menu" type="button" aria-expanded={menu} aria-controls="dash-nav" onClick={() => setMenu((open) => !open)}>
              {menu ? <XMarkIcon /> : <Bars3Icon />}
              <span>{menu ? "Close" : "Menu"}</span>
            </button>
            {user?.avatar?.url ? <img className="dash__avatar" src={user.avatar.url} alt="" /> : null}
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
