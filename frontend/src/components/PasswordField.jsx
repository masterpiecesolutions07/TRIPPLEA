import { useState } from "react";
import { Icon } from "./Icon.jsx";

export function PasswordField({ id, label, name, value, onChange, autoComplete, note }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-wrap">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={onChange}
        />
        <button
          className="icon-btn"
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          <Icon name={visible ? "i-eye-off" : "i-eye"} />
        </button>
      </div>
      {note ? <p className="note">{note}</p> : null}
    </div>
  );
}
