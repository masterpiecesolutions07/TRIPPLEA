import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { clearNotifications, completeLesson, getCourse, getLesson, getNotifications, getStudentHome, getStudentSessions, removeNotification, saveAvatar, saveLessonNotes, saveProfile, setNotificationRead } from "../../api/dashboardApi.js";
import { CourseCatalog } from "../../components/course/CourseCatalog.jsx";
import { courseBlurb, CourseSummaryCard } from "../../components/course/CourseSummaryCard.jsx";
import { DayPlayer } from "../../components/course/DayPlayer.jsx";
import { VideoEmbed } from "../../components/course/VideoEmbed.jsx";
import { SaveAlert } from "../../components/SaveAlert.jsx";
import { ImageUpload } from "../../components/ImageUpload.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { feedbackMessage } from "../../utils/feedback.js";
import { PROGRAMME_WEEKS } from "../../data/programmeLength.js";
import { SuccessStories } from "./SuccessStories.jsx";

const APPLICATION_STATUS = {
  pending: "Received",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Not accepted",
  waitlisted: "Waiting list"
};
const PLAN = { starter: "Starter", premium: "Premium", custom: "Custom price" };
const MODE = { online: "Online", physical: "In person", both: "Online or in person" };

function homeDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function noticeWhen(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function courseDays(course) {
  if (course?.access !== "active") return [];
  return (course.phases || []).flatMap((phase) => (phase.modules || []).map((day) => ({ ...day, phaseTitle: phase.title })));
}

export function StudentHome() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [course, setCourse] = useState(null);
  const [notes, setNotes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    getStudentHome().then(setData).catch((err) => setError(feedbackMessage(err, "Could not load your page. Please try again.")));
    getCourse().then(setCourse).catch((err) => setError(feedbackMessage(err, "Could not load the course. Please try again.")));
    getNotifications().then(setNotes).catch(() => setNotes([]));
    getStudentSessions().then(setSessions).catch(() => setSessions([]));
  }, []);

  const name = data?.user?.name || user?.name || "there";
  const days = courseDays(course);
  const finished = days.filter((item) => item.completed).length;
  const percent = days.length ? Math.round((finished / days.length) * 100) : 0;
  const nextDay = days.find((item) => !item.completed);
  const application = data?.application;
  const cohort = data?.progress?.find((item) => item.cohort)?.cohort;
  const upcoming = [...sessions].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)).slice(0, 2);
  const phases = course?.access === "active" ? (course.phases || []) : [];

  return (
    <>
      {error ? <p className="form-summary">{error}</p> : null}
      <div className="course-page-head">
        <h1>Dashboard</h1>
        <p className="note">Welcome back, {name}.</p>
      </div>
      <div className="stat-row">
        <Link className="stat-tile stat-tile--lead" to="/student/progress">
          <span className="stat-emoji" aria-hidden="true">📈</span>
          <b>{course?.access === "active" ? `${percent}%` : "–"}</b>
          <span>Course progress</span>
        </Link>
        <Link className="stat-tile" to="/student/course">
          <span className="stat-emoji" aria-hidden="true">✅</span>
          <b>{course?.access === "active" ? `${finished}/${days.length}` : "–"}</b>
          <span>Days finished</span>
        </Link>
        <article className="stat-tile">
          <span className="stat-emoji" aria-hidden="true">📝</span>
          <b>{application ? APPLICATION_STATUS[application.status] || "Received" : "None"}</b>
          <span>Application</span>
        </article>
        <Link className="stat-tile" to="/student/notifications">
          <span className="stat-emoji" aria-hidden="true">🔔</span>
          <b>{notes.length}</b>
          <span>Notices</span>
        </Link>
      </div>

      <article className="panel home-progress">
        <h2>Progress</h2>
        {course?.access !== "active" ? <p>{course?.message || "The course opens after your application is approved."}</p> : (
          <>
            <p className="note">{finished} of {days.length} days finished.</p>
            <div className="home-meter" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>
            <ul className="home-phases">
              {phases.map((phase) => {
                const total = phase.modules?.length || 0;
                const done = phase.modules?.filter((item) => item.completed).length || 0;
                const complete = total > 0 && done === total;
                return (
                  <li key={phase._id}>
                    <span>{complete ? "✅ " : ""}{phase.title}</span>
                    <strong>{done}/{total}</strong>
                  </li>
                );
              })}
            </ul>
            {nextDay ? <p><Link className="btn btn--primary btn--small" to={`/student/course/watch/${nextDay._id}`}>Continue: {nextDay.title}</Link></p> : <p>🎉 You have finished the days that are open.</p>}
          </>
        )}
        <p><Link to="/student/progress">Open the full progress list</Link></p>
      </article>

      <div className="student-board">
        <article className="panel">
          <h2>Application</h2>
          {application ? (
            <dl className="home-facts">
              <div><dt>Status</dt><dd>{APPLICATION_STATUS[application.status] || "Received"}</dd></div>
              <div><dt>Plan</dt><dd>{PLAN[application.plan] || "Not given"}</dd></div>
              <div><dt>Attendance</dt><dd>{MODE[application.mode] || "Not given"}</dd></div>
              <div><dt>Applied</dt><dd>{homeDate(application.createdAt) || "Not given"}</dd></div>
            </dl>
          ) : <p><Link to="/apply">Apply for the mentorship</Link></p>}
        </article>

        <article className="panel">
          <h2>Course</h2>
          {course?.access === "active" ? (
            <>
              <p><strong>{course.course?.title || "Forex: From Beginner to Advanced"}</strong></p>
              <p className="note">By Tripple A · {PROGRAMME_WEEKS} weeks · Beginner to advanced</p>
              {course.course?.openedAt ? <p className="note">Opened {homeDate(course.course.openedAt)}.</p> : <p className="note">Access stays open.</p>}
              <p><Link className="btn btn--ghost btn--small" to="/student/course">Open course</Link></p>
            </>
          ) : <p>{course?.message || "The course opens after your application is approved."}</p>}
        </article>

        <article className="panel">
          <h2>Notices</h2>
          {notes.length === 0 ? <p className="note">No application or payment notes yet.</p> : (
            <ul className="home-notes">
              {notes.slice(0, 3).map((item) => (
                <li key={item._id}>
                  <strong>{item.number}. {item.title}</strong>
                  <span>{item.message}</span>
                  <span>Notified {noticeWhen(item.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
          <p><Link to="/student/notifications">All notices</Link></p>
        </article>

        <article className="panel">
          <h2>Sessions</h2>
          {cohort ? <p className="note">{cohort.name}{cohort.mode ? ` · ${MODE[cohort.mode] || cohort.mode}` : ""}{cohort.startDate ? ` · from ${homeDate(cohort.startDate)}` : ""}</p> : <p className="note">No group is assigned yet. The course can still be open.</p>}
          {upcoming.length === 0 ? <p className="note">No sessions yet. When your mentor adds one, it shows here.</p> : (
            <ul className="home-notes">
              {upcoming.map((item) => (
                <li key={item._id}>
                  <strong>{item.title}</strong>
                  <span>{new Date(item.startsAt).toLocaleString("en-GB")} · {item.mode}</span>
                </li>
              ))}
            </ul>
          )}
          <p><Link to="/student/sessions">All sessions</Link></p>
        </article>
      </div>
    </>
  );
}

function phaseCards(phases) {
  return (phases || []).map((phase) => {
    const first = phase.modules?.[0];
    return {
      id: phase._id,
      title: phase.title,
      coverTitle: phase.title,
      cover: phase.cover?.url || "",
      to: first ? `/student/course/watch/${first._id}` : ""
    };
  });
}

function CourseIntro({ course, to, linkState, onView }) {
  if (!course) return <p className="note">Loading the course…</p>;
  if (course.access !== "active") {
    return (
      <article className="panel course-summary">
        <h2>Course</h2>
        <p>{course.message}</p>
      </article>
    );
  }
  return (
    <CourseSummaryCard
      title={course.course?.title || "Forex: From Beginner to Advanced"}
      subtitle="By Tripple A"
      description={courseBlurb(course.course?.description)}
      countLabel={`${PROGRAMME_WEEKS} weeks`}
      assignedAt={course.course?.openedAt}
      to={to}
      linkState={linkState}
      onView={onView}
    />
  );
}

export function StudentCourse() {
  const location = useLocation();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(Boolean(location.state?.open));
  useEffect(() => {
    getCourse().then(setCourse).catch((err) => setError(feedbackMessage(err, "Could not load the course. Please try again.")));
  }, []);
  useEffect(() => {
    setOpen(Boolean(location.state?.open));
  }, [location.key]);
  if (!course) return <p>{error || "Loading the course…"}</p>;
  if (course.access !== "active") {
    return (
      <>
        <div className="course-page-head">
          <h1>My courses</h1>
          <p className="note">Your mentorship course.</p>
        </div>
        <p>{course.message}</p>
      </>
    );
  }
  if (!open) {
    return (
      <>
        {error ? <p className="form-summary">{error}</p> : null}
        <div className="course-page-head">
          <h1>My courses</h1>
          <p className="note">Your mentorship course.</p>
        </div>
        <CourseIntro course={course} onView={() => setOpen(true)} />
      </>
    );
  }
  return (
    <>
      {error ? <p className="form-summary">{error}</p> : null}
      <button className="back-link" type="button" onClick={() => setOpen(false)}>Back to my courses</button>
      <CourseCatalog heading="Your course" cards={phaseCards(course.phases)} />
    </>
  );
}

export function StudentDay() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cheer, setCheer] = useState(null);
  useEffect(() => {
    getCourse().then(setCourse).catch((err) => setError(feedbackMessage(err, "Could not load the course. Please try again.")));
  }, [moduleId]);
  if (!course) return <p>{error || "Loading this day…"}</p>;
  if (course.access !== "active") return <p>{course.message}</p>;
  const phase = (course.phases || []).find((item) => item.modules.some((day) => day._id === moduleId)) || course.phases?.[0];
  const day = phase?.modules?.find((item) => item._id === moduleId) || phase?.modules?.[0];
  if (!phase || !day) return <p>That day is not on your course.</p>;

  async function finish() {
    if (!day.watchLessonId) return;
    setBusy(true);
    try {
      await completeLesson(day.watchLessonId);
      const phases = (course.phases || []).map((item) => ({
        ...item,
        modules: item.modules.map((row) => row._id === day._id ? { ...row, completed: true } : row)
      }));
      setCourse((current) => ({ ...current, phases }));
      const updated = phases.find((item) => item._id === phase._id);
      const phaseDone = updated?.modules?.length > 0 && updated.modules.every((item) => item.completed);
      const courseDone = phases.length > 0 && phases.every((item) => item.modules?.length > 0 && item.modules.every((row) => row.completed));
      if (phaseDone) {
        setCheer({
          emoji: courseDone ? "🏆" : "🎉",
          title: courseDone ? "Course complete" : "Phase complete",
          message: courseDone
            ? "You finished every open phase. Well done. Keep the same written process when you review."
            : `You finished ${updated.title}. Well done. The next phase is ready when you are.`
        });
      }
    } catch (err) {
      setError(feedbackMessage(err, "Could not save that. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {error ? <p className="form-summary">{error}</p> : null}
      {cheer ? (
        <div className="cheer" role="status">
          <div className="cheer__card panel">
            <p className="cheer__emoji" aria-hidden="true">{cheer.emoji}</p>
            <h2>{cheer.title}</h2>
            <p>{cheer.message}</p>
            <button className="btn btn--primary" type="button" onClick={() => setCheer(null)}>Continue</button>
          </div>
        </div>
      ) : null}
      <DayPlayer
        phase={phase}
        dayId={day._id}
        backTo="/student/course"
        backLabel="Back"
        onSelect={(id) => navigate(`/student/course/watch/${id}`)}
      />
      {day.watchLessonId ? (
        <p><button className="btn btn--ghost" type="button" disabled={busy || day.completed} onClick={finish}>{day.completed ? "Finished" : "Mark as finished"}</button></p>
      ) : null}
      <p className="note">This class is education. It is not a signal to buy or sell, and it does not promise a profit.</p>
    </>
  );
}

export function StudentLesson() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getLesson(id).then((item) => {
      setLesson(item);
      setNotes(item.notes || "");
    }).catch((err) => setError(feedbackMessage(err, "Could not open that class. Please try again.")));
  }, [id]);

  async function finish() {
    setBusy(true);
    setError("");
    try {
      await completeLesson(id);
      setLesson((current) => ({ ...current, completed: true }));
      setSaved("Marked as finished.");
    } catch (err) {
      setError(feedbackMessage(err, "Could not save that. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  async function saveNote(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await saveLessonNotes(id, notes);
      setSaved(result.message || "Note saved.");
    } catch (err) {
      setError(feedbackMessage(err, "Could not save that note. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  if (!lesson) return <p>{error || "Loading this class…"}</p>;
  return (
    <>
      <p><Link to="/student/course">Back to the course</Link></p>
      <h1>{lesson.title}</h1>
      {error ? <p className="form-summary">{error}</p> : null}
      <SaveAlert message={saved} />
      <article className="panel course-board">
        <p>{lesson.description}</p>
        <p className="note">This class is education. It is not a signal to buy or sell, and it does not promise a profit.</p>
        {lesson.embedUrl ? <VideoEmbed url={lesson.embedUrl} title={lesson.title} /> : <p className="note">No video yet.</p>}
        {lesson.resources?.length ? lesson.resources.map((item) => (
          <p key={item.url}><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a></p>
        )) : null}
        <p className="note">{lesson.completed ? "Finished" : "Not finished yet"}</p>
        <button className="btn btn--primary" type="button" disabled={busy || lesson.completed} onClick={finish}>{lesson.completed ? "Finished" : "Mark as finished"}</button>
        <form className="dash-form" onSubmit={saveNote}>
          <div className="field">
            <label htmlFor="class-notes">Your private note</label>
            <textarea id="class-notes" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>
          <button className="btn btn--ghost" type="submit" disabled={busy}>{busy ? "Saving…" : "Save note"}</button>
        </form>
      </article>
    </>
  );
}

export function StudentProgress() {
  const [course, setCourse] = useState(null);
  useEffect(() => { getCourse().then(setCourse).catch(() => setCourse({ access: "none", phases: [] })); }, []);
  const days = course?.phases?.flatMap((phase) => phase.modules) || [];
  const finished = days.filter((item) => item.completed).length;
  return (
    <>
      <h1>Progress</h1>
      {course?.access !== "active" ? <p className="note">{course?.message || "The course opens after your application is approved."}</p> : (
        <article className="panel course-board">
          <p className="note">{finished} of {days.length} days finished.</p>
          {days.map((item) => (
            <div className="course-class" key={item._id}>
              <Link to={`/student/course/watch/${item._id}`}>{item.title}</Link>
              <span className="note">{item.completed ? "Finished" : "Not finished yet"}</span>
            </div>
          ))}
        </article>
      )}
    </>
  );
}

export function StudentSessions() {
  const [items, setItems] = useState([]);
  useEffect(() => { getStudentSessions().then(setItems).catch(() => setItems([])); }, []);
  return (
    <>
      <h1>Sessions</h1>
      {items.length === 0 ? <p className="note">No sessions yet. When your mentor adds one, it shows here.</p> : (
        <div className="dash-grid">
          {items.map((item) => (
            <article className="panel" key={item._id}>
              <h2>{item.title}</h2>
              <p className="note">{new Date(item.startsAt).toLocaleString("en-GB")} · {MODE[item.mode] || item.mode} · {item.platform === "meet" ? "Google Meet" : item.platform === "room" ? "Room" : "Zoom"}</p>
              {item.cohort?.name ? <p className="note">{item.cohort.name}</p> : null}
              {item.venue ? <p>{item.venue}</p> : null}
              {item.link ? <p><a href={item.link}>Join</a></p> : null}
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export function StudentNotifications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  function load() {
    getNotifications().then(setItems).catch(() => setItems([]));
  }

  useEffect(() => { load(); }, []);

  async function mark(item) {
    setError("");
    setSaved("");
    try {
      setSaved(await setNotificationRead(item._id, !item.read));
      load();
    } catch (err) {
      setError(feedbackMessage(err, "Could not update that notification. Please try again."));
    }
  }

  async function remove(item) {
    if (!window.confirm(`Remove notification ${item.number}?`)) return;
    setError("");
    setSaved("");
    try {
      setSaved(await removeNotification(item._id));
      load();
    } catch (err) {
      setError(feedbackMessage(err, "Could not remove that notification. Please try again."));
    }
  }

  async function clearAll() {
    if (!window.confirm("Remove all of these notifications?")) return;
    setError("");
    setSaved("");
    try {
      setSaved(await clearNotifications());
      load();
    } catch (err) {
      setError(feedbackMessage(err, "Could not clear the notifications. Please try again."));
    }
  }

  return (
    <div className="notice-page">
      <h1>Notifications</h1>
      <p className="note">Application updates and payment notes sent to you. Number 1 is the first that arrived.</p>
      {error ? <p className="form-summary">{error}</p> : null}
      <SaveAlert message={saved} />
      {items.length === 0 ? <p className="notice-empty">No application or payment notes yet.</p> : (
        <>
          <p><button className="btn btn--ghost btn--small" type="button" onClick={clearAll}>Clear all</button></p>
          <ul className="notice-list">
            {items.map((item) => (
              <li className={`notice notice--${item.type === "payment" ? "payment" : "application"}${item.read ? " is-read" : ""}`} key={item._id}>
                <span className="notice__num">{item.number}</span>
                <h2>{item.title}</h2>
                <p>{item.message}</p>
                <time dateTime={item.createdAt}>Notified {noticeWhen(item.createdAt)}</time>
                <p className="note">{item.read ? "Read" : "New"}</p>
                <div className="notice__actions">
                  <button className="btn btn--ghost btn--small" type="button" onClick={() => mark(item)}>{item.read ? "Mark as unread" : "Mark as read"}</button>
                  <button className="btn btn--ghost btn--small" type="button" onClick={() => remove(item)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function Profile() {
  const { user, reload } = useAuth();
  const staff = user?.role === "admin" || user?.role === "mentor";
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", country: user?.country || "" });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    setForm({ name: user?.name || "", phone: user?.phone || "", country: user?.country || "" });
  }, [user?.name, user?.phone, user?.country]);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaved("");
    try {
      await saveProfile(form);
      await reload();
      setSaved("Profile updated.");
    } catch (err) {
      setError(feedbackMessage(err, "Could not save your details. Please try again."));
    }
  }

  async function onPhoto(image) {
    setError("");
    setSaved("");
    await saveAvatar(image);
    await reload();
    setSaved("Photo updated.");
  }

  return (
    <>
      <h1>Profile</h1>
      <div className="panel profile-panel">
        <div className="profile-photo-wrap">
          {user?.avatar?.url ? <img className="profile-photo" src={user.avatar.url} alt="" /> : <span className="profile-photo profile-photo--empty" aria-hidden="true">{user?.name?.slice(0, 1) || "?"}</span>}
          <ImageUpload label="Upload profile photo" onFile={onPhoto} showPreview={false} />
        </div>
        <p className="note">{user?.email}</p>
        <p className="note">Role: {user?.role}</p>
        {error ? <p className="form-summary">{error}</p> : null}
        <SaveAlert message={saved} />
        {staff ? (
          <form className="dash-form" onSubmit={submit}>
            <div className="field"><label htmlFor="profile-name">Name</label><input id="profile-name" name="name" required value={form.name} onChange={update} /></div>
            <div className="field"><label htmlFor="profile-phone">Phone</label><input id="profile-phone" name="phone" value={form.phone} onChange={update} /></div>
            <div className="field"><label htmlFor="profile-country">Country</label><input id="profile-country" name="country" value={form.country} onChange={update} /></div>
            <button className="btn btn--primary" type="submit">Save profile</button>
          </form>
        ) : (
          <>
            <p><strong>{user?.name}</strong></p>
            <p className="note">{user?.phone} {user?.country}</p>
          </>
        )}
        <p><a href="/change-password">Change password</a></p>
      </div>
    </>
  );
}

export function SubmitStory() {
  return (
    <>
      <h1>Success stories</h1>
      <SuccessStories />
    </>
  );
}
