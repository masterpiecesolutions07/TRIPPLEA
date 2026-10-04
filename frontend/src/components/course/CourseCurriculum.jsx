import {
  AcademicCapIcon,
  BoltIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClockIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline";
import { ReorderList } from "./ReorderList.jsx";

const ICONS = [AcademicCapIcon, ChartBarIcon, BoltIcon, LightBulbIcon, BookOpenIcon];
const TONES = ["violet", "indigo", "mint", "gold"];

export function lessonTotal(phases) {
  return (phases || []).reduce(
    (sum, phase) => sum + (phase.modules || []).reduce((inner, item) => inner + (item.lessons || []).length, 0),
    0
  );
}

export function durationLabel(lessons) {
  const total = (lessons || []).reduce((sum, lesson) => sum + (Number(lesson.durationMinutes) || 0), 0);
  if (total <= 0) return "";
  if (total < 60) return `${total} ${total === 1 ? "minute" : "minutes"}`;
  const hours = Math.round(total / 60);
  return `${hours} ${hours === 1 ? "hour" : "hours"}`;
}

export function CourseCurriculum({ phases = [], selectedId, onSelect, done = 0, total = 0, onReorderPhases, renderPhaseActions, children }) {
  const selected = phases.find((phase) => phase._id === selectedId) || phases[0] || null;
  const index = selected ? Math.max(0, phases.findIndex((phase) => phase._id === selected._id)) : 0;
  const fill = phases.length ? Math.round(((index + 1) / phases.length) * 100) : 0;

  function card(phase, phaseIndex, controls) {
    const Icon = ICONS[phaseIndex % ICONS.length];
    const classes = (phase.modules || []).reduce((sum, item) => sum + (item.lessons || []).length, 0);
    const days = phase.modules?.length || 0;
    const active = selected?._id === phase._id;
    return (
      <article className={`phase-card tone-${TONES[phaseIndex % TONES.length]}${active ? " is-active" : ""}${phase.status === "hidden" ? " is-hidden" : ""}${controls?.isOver ? " is-over" : ""}`} {...(controls?.dropProps || {})}>
        <button className="phase-card__main" type="button" aria-pressed={active} onClick={() => onSelect(phase._id)}>
          <span className="phase-card__icon" aria-hidden="true"><Icon /></span>
          <span className="phase-card__kicker">Phase {phaseIndex + 1}</span>
          <strong>{phase.title}</strong>
          <span className="phase-card__meta">{days} {days === 1 ? "day" : "days"} · {classes} {classes === 1 ? "class" : "classes"}</span>
        </button>
        {renderPhaseActions ? <div className="phase-card__actions">{renderPhaseActions(phase, controls)}</div> : null}
      </article>
    );
  }

  return (
    <div className="curriculum">
      <h2>Course curriculum</h2>
      {total > 0 ? <p className="note">{done} of {total} classes finished</p> : null}
      {phases.length === 0 ? <p className="note">No phases yet.</p> : onReorderPhases ? (
        <div className="phase-strip">
          <ReorderList items={phases} onReorder={onReorderPhases}>
            {(phase, controls) => card(phase, phases.findIndex((item) => item._id === phase._id), controls)}
          </ReorderList>
        </div>
      ) : (
        <div className="phase-strip phase-strip--plain">
          {phases.map((phase, phaseIndex) => <div key={phase._id}>{card(phase, phaseIndex, null)}</div>)}
        </div>
      )}
      <div className="curriculum__track" aria-hidden="true"><span style={{ width: `${fill}%` }} /></div>
      {selected ? (
        <section className="day-list">
          <h3>Course days</h3>
          {children(selected, index)}
        </section>
      ) : null}
    </div>
  );
}

export function DayCard({ day, title, description, lessons = [], time, actions, materialsAction, children }) {
  const clock = time || durationLabel(lessons) || `${lessons.length} ${lessons.length === 1 ? "class" : "classes"}`;
  return (
    <article className="day-card">
      <div className="day-card__head">
        <div>
          <h3>Day {day}: {title}</h3>
          {description ? <p>{description}</p> : null}
          <p className="day-card__time"><ClockIcon aria-hidden="true" /> {clock}</p>
        </div>
        {actions || null}
      </div>
      <div className="day-card__materials">
        <div className="day-card__materials-head">
          <strong>Classes ({lessons.length})</strong>
          {materialsAction || null}
        </div>
        {children}
      </div>
    </article>
  );
}
