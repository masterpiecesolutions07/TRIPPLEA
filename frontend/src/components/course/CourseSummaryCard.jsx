import { BookOpenIcon, ClockIcon, EyeIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

function formatAssigned(value, label, fallback) {
  if (!value) return fallback || label;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback || label;
  return `${label} ${date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`;
}

export function courseBlurb(text) {
  const value = String(text || "").trim();
  if (!value || value.startsWith("Placeholder description")) {
    return "A 3-month forex mentorship, from beginner foundations to advanced execution.";
  }
  return value;
}

export function CourseSummaryCard({
  title,
  subtitle,
  description,
  countLabel,
  level = "Beginner to advanced",
  assignedAt,
  assignedLabel = "Assigned:",
  assignedFallback = "Access stays open",
  to,
  linkState,
  onView,
  viewLabel = "View Course"
}) {
  const view = to ? (
    <Link className="btn btn--primary course-summary__view" to={to} state={linkState}><EyeIcon aria-hidden="true" /> {viewLabel}</Link>
  ) : (
    <button className="btn btn--primary course-summary__view" type="button" onClick={onView}><EyeIcon aria-hidden="true" /> {viewLabel}</button>
  );

  return (
    <article className="panel course-summary">
      <div className="course-summary__top">
        <span className="course-summary__icon" aria-hidden="true"><BookOpenIcon /></span>
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="course-summary__sub">{subtitle}</p> : null}
        </div>
      </div>
      {description ? <p>{description}</p> : null}
      <div className="course-summary__meta">
        <span className="course-summary__count"><ClockIcon aria-hidden="true" /> {countLabel}</span>
        <span className="course-pill">{level}</span>
      </div>
      <div className="course-summary__foot">
        <span>{formatAssigned(assignedAt, assignedLabel, assignedFallback)}</span>
        {(to || onView) ? view : null}
      </div>
    </article>
  );
}
