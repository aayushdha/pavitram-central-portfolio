"use client";

import { type ReactNode, useState } from "react";
import { X, Loader2, Trash2 } from "lucide-react";

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-ink/8 bg-white shadow-sm ${className}`}>{children}</div>
  );
}

export function AdminButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled,
  loading,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm";
  const variants: Record<string, string> = {
    primary: "bg-navy text-white hover:bg-navy-deep",
    secondary: "bg-haze text-ink hover:bg-ink/10 border border-ink/10",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    ghost: "text-ink hover:bg-haze",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes} ${variants[variant]} ${className}`}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}

export function AdminInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  hint,
}: {
  label?: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-mist">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-ink/12 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
      />
      {hint && <span className="mt-1 block text-[11px] text-mist">{hint}</span>}
    </label>
  );
}

export function AdminTextarea({
  label,
  value,
  onChange,
  rows = 3,
  required,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-mist">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </span>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-ink/12 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
      />
    </label>
  );
}

export function AdminSelect({
  label,
  value,
  onChange,
  options,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-mist">{label}</span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-ink/12 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-ink/10 px-3.5 py-2.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-navy" : "bg-ink/15"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

export function AdminBadge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warning" | "danger" | "gold" }) {
  const tones: Record<string, string> = {
    default: "bg-ink/8 text-ink",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    gold: "bg-gold/15 text-gold-dark",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function AdminModal({
  title,
  open,
  onClose,
  children,
  wide,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-4 py-10 backdrop-blur-sm">
      <div
        className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} rounded-2xl bg-white shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-ink/8 px-6 py-4">
          <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-mist hover:bg-haze">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDeleteButton({ onConfirm, label = "Delete" }: { onConfirm: () => void; label?: string }) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <AdminButton size="sm" variant="danger" onClick={onConfirm}>
          Confirm
        </AdminButton>
        <AdminButton size="sm" variant="ghost" onClick={() => setConfirming(false)}>
          Cancel
        </AdminButton>
      </span>
    );
  }
  return (
    <AdminButton size="sm" variant="ghost" onClick={() => setConfirming(true)}>
      <Trash2 className="h-3.5 w-3.5" /> {label}
    </AdminButton>
  );
}

/** Simple editable list-of-strings field (used for pills, whyUs, benefits, ...). */
export function AdminStringArrayEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-mist">{label}</span>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="w-full rounded-lg border border-ink/12 bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="shrink-0 rounded-lg border border-ink/10 px-2.5 text-mist hover:bg-haze"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-2 text-xs font-semibold text-gold hover:underline"
      >
        + Add item
      </button>
    </div>
  );
}

export type FeatureItem = { icon: string; title: string; desc: string };

/** Editable list of { icon, title, desc } — used for service "features". */
export function AdminFeatureListEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: FeatureItem[];
  onChange: (items: FeatureItem[]) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-mist">{label}</span>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-2 rounded-lg border border-ink/10 p-2.5">
            <input
              value={item.icon}
              placeholder="Icon (e.g. ShieldCheck)"
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], icon: e.target.value };
                onChange(next);
              }}
              className="min-w-0 rounded-md border border-ink/12 px-2.5 py-1.5 text-xs outline-none focus:border-gold"
            />
            <input
              value={item.title}
              placeholder="Title"
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], title: e.target.value };
                onChange(next);
              }}
              className="min-w-0 rounded-md border border-ink/12 px-2.5 py-1.5 text-xs outline-none focus:border-gold"
            />
            <input
              value={item.desc}
              placeholder="Description"
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], desc: e.target.value };
                onChange(next);
              }}
              className="min-w-0 rounded-md border border-ink/12 px-2.5 py-1.5 text-xs outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="shrink-0 rounded-md border border-ink/10 px-2 text-mist hover:bg-haze"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, { icon: "Sparkles", title: "", desc: "" }])}
        className="mt-2 text-xs font-semibold text-gold hover:underline"
      >
        + Add feature
      </button>
    </div>
  );
}

export type StepItem = { num?: string; title: string; desc?: string; body?: string };

/** Editable list of steps — supports both { num, title, desc } (services) and { title, body } (opportunities). */
export function AdminStepListEditor({
  label,
  items,
  onChange,
  hasNum = true,
  descKey = "desc",
}: {
  label: string;
  items: StepItem[];
  onChange: (items: StepItem[]) => void;
  hasNum?: boolean;
  descKey?: "desc" | "body";
}) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-mist">{label}</span>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className={`grid gap-2 rounded-lg border border-ink/10 p-2.5 ${
              hasNum ? "grid-cols-[60px_1fr_2fr_auto]" : "grid-cols-[1fr_2fr_auto]"
            }`}
          >
            {hasNum && (
              <input
                value={item.num ?? ""}
                placeholder="01"
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], num: e.target.value };
                  onChange(next);
                }}
                className="min-w-0 rounded-md border border-ink/12 px-2.5 py-1.5 text-xs outline-none focus:border-gold"
              />
            )}
            <input
              value={item.title}
              placeholder="Step title"
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], title: e.target.value };
                onChange(next);
              }}
              className="min-w-0 rounded-md border border-ink/12 px-2.5 py-1.5 text-xs outline-none focus:border-gold"
            />
            <input
              value={(item as any)[descKey] ?? ""}
              placeholder="Description"
              onChange={(e) => {
                const next = [...items];
                (next[i] as any)[descKey] = e.target.value;
                onChange(next);
              }}
              className="min-w-0 rounded-md border border-ink/12 px-2.5 py-1.5 text-xs outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="shrink-0 rounded-md border border-ink/10 px-2 text-mist hover:bg-haze"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          onChange([...items, hasNum ? { num: String(items.length + 1).padStart(2, "0"), title: "", desc: "" } : { title: "", body: "" }])
        }
        className="mt-2 text-xs font-semibold text-gold hover:underline"
      >
        + Add step
      </button>
    </div>
  );
}
