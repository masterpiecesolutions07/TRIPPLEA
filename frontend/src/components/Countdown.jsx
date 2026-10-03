import { useEffect, useState } from "react";

const START = new Date("2027-01-11T09:00:00+03:00").getTime();

function parts(ms) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const seconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60
  };
}

export function Countdown() {
  const [left, setLeft] = useState(() => parts(START - Date.now()));
  useEffect(() => {
    const timer = window.setInterval(() => setLeft(parts(START - Date.now())), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="countdown">
      {["days", "hours", "minutes", "seconds"].map((unit) => (
        <div key={unit}>
          <strong>{String(left[unit]).padStart(2, "0")}</strong>
          <span>{unit[0].toUpperCase() + unit.slice(1)}</span>
        </div>
      ))}
    </div>
  );
}
