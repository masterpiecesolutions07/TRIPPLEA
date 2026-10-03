import { useEffect, useState } from "react";
import { getOverview } from "../../api/dashboardApi.js";

const TILES = [
  ["applications", "Applications"],
  ["students", "Students"],
  ["cohorts", "Cohorts"],
  ["messages", "New messages"],
  ["certificates", "Certificates"],
  ["trades", "Trades"]
];

export function Overview({ title }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    getOverview().then(setData).catch((err) => setError(err.response?.data?.message || "The API is not reachable."));
  }, []);
  return (
    <>
      <h1>{title}</h1>
      {error ? <p className="form-summary">{error}</p> : null}
      <div className="stat-row">
        {TILES.map(([key, label]) => (
          <article className="stat-tile" key={key}>
            <b>{data ? data[key] : "–"}</b>
            <span>{label}</span>
          </article>
        ))}
      </div>
      {data?.applicationStatus ? (
        <div className="panel" style={{ marginTop: "1rem" }}>
          <h2>Application status</h2>
          <p className="note">{Object.entries(data.applicationStatus).map(([key, count]) => `${key}: ${count}`).join(" · ") || "No applications yet."}</p>
        </div>
      ) : null}
    </>
  );
}
