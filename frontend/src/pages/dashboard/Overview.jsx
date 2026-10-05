import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOverview } from "../../api/dashboardApi.js";
import { feedbackMessage } from "../../utils/feedback.js";

const TILES = [
  ["applications", "Applications", "📥", "/mentor/applications"],
  ["students", "Students", "🎓", "/mentor/students"],
  ["cohorts", "Cohorts", "📅", "/mentor/cohorts"],
  ["messages", "New messages", "💬", "/mentor/messages"],
  ["certificates", "Certificates", "🏅", "/mentor/certificates"],
  ["trades", "Trades", "📊", "/mentor/trades"]
];

const STATUS = {
  pending: ["Received", "📥"],
  under_review: ["Under review", "👀"],
  approved: ["Approved", "✅"],
  rejected: ["Not accepted", "📌"],
  waitlisted: ["Waiting list", "⏳"]
};

export function Overview({ title }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    getOverview().then(setData).catch((err) => setError(feedbackMessage(err, "Could not load this page. Please try again.")));
  }, []);
  return (
    <>
      <h1>{title}</h1>
      {error ? <p className="form-summary">{error}</p> : null}
      <div className="stat-row">
        {TILES.map(([key, label, emoji, to], index) => (
          <Link className={`stat-tile${index === 0 ? " stat-tile--lead" : ""}`} to={to} key={key}>
            <span className="stat-emoji" aria-hidden="true">{emoji}</span>
            <b>{data ? data[key] : "–"}</b>
            <span>{label}</span>
          </Link>
        ))}
      </div>
      {data?.applicationStatus ? (
        <div className="panel status-board">
          <h2>Application status</h2>
          {Object.keys(data.applicationStatus).length === 0 ? <p className="note">No applications yet.</p> : (
            <ul className="status-pills">
              {Object.entries(data.applicationStatus).map(([key, count]) => {
                const [label, emoji] = STATUS[key] || [key, "•"];
                return <li key={key}><span aria-hidden="true">{emoji}</span><strong>{count}</strong><span>{label}</span></li>;
              })}
            </ul>
          )}
        </div>
      ) : null}
    </>
  );
}
