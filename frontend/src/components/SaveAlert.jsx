import { useEffect, useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

const VISIBLE_MS = 4000;

export function SaveAlert({ message }) {
  const [shown, setShown] = useState("");
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!message) {
      setShown("");
      setLeaving(false);
      return undefined;
    }
    setShown(message);
    setLeaving(false);
    const fade = window.setTimeout(() => setLeaving(true), VISIBLE_MS - 350);
    const hide = window.setTimeout(() => setShown(""), VISIBLE_MS);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(hide);
    };
  }, [message]);

  if (!shown) return null;
  return (
    <p className={`save-alert${leaving ? " is-leaving" : ""}`} role="status">
      <CheckCircleIcon aria-hidden="true" />
      <span>{shown}</span>
    </p>
  );
}
