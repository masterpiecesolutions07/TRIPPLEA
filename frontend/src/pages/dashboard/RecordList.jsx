import { useEffect, useState } from "react";
import { getCollection } from "../../api/dashboardApi.js";

const COLUMNS = {
  students: [["name", "Name"], ["email", "Email"], ["phone", "Phone"], ["country", "Country"]],
  messages: [["name", "Name"], ["email", "Email"], ["subject", "Subject"], ["status", "Status"]],
  certificates: [["title", "Title"], ["category", "Category"], ["status", "Status"], ["consent", "Consent"]],
  trades: [["instrument", "Instrument"], ["direction", "Direction"], ["status", "Status"], ["published", "Published"]],
  alerts: [["title", "Title"], ["type", "Type"], ["isActive", "Active"]],
  posts: [["title", "Title"], ["category", "Category"], ["status", "Status"], ["consent", "Consent"]],
  testimonials: [["name", "Name"], ["role", "Role"], ["published", "Published"]]
};

export function RecordList({ title, resource, empty }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    getCollection(resource).then(setItems).catch((err) => setError(err.response?.data?.message || "Could not load this list."));
  }, [resource]);
  const columns = COLUMNS[resource];
  return (
    <>
      <h1>{title}</h1>
      {error ? <p className="form-summary">{error}</p> : null}
      {items.length === 0 ? <div className="panel"><p className="note">{empty}</p></div> : (
        <div className="table-wrap panel">
          <table className="dash-table">
            <thead><tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id || item.id}>
                  {columns.map(([key]) => <td key={key}>{String(item[key] ?? "")}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
