"use client";

const base =
  "w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-[var(--color-gold)] transition-colors";

export function Field({ label, hint, required, className, children }) {
  return (
    <label className={`block ${className || ""}`}>
      {label && (
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {label} {required && <span style={{ color: "var(--color-rose)" }}>*</span>}
        </span>
      )}
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return <input {...props} className={`${base} ${props.className || ""}`} />;
}

export function TextArea(props) {
  return <textarea {...props} className={`${base} ${props.className || ""}`} rows={props.rows || 3} />;
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`${base} ${props.className || ""}`}>
      {children}
    </select>
  );
}

export function Button({ variant = "primary", className = "", style, ...props }) {
  const variants = {
    primary: { background: "var(--color-navy)", color: "#fff" },
    gold: { background: "var(--color-gold)", color: "#fff" },
    outline: { background: "transparent", color: "var(--color-ink)", border: "1px solid var(--color-line)" },
    danger: { background: "var(--color-rose)", color: "#fff" },
    ghost: { background: "transparent", color: "var(--color-ink-muted)" },
  };
  return (
    <button
      {...props}
      style={{ ...variants[variant], ...style }}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}
