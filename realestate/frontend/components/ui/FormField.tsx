import { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, InputHTMLAttributes } from "react";

export function Field({
  label,
  hint,
  required,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink-900">
        {label}
        {required && <span className="text-danger-600">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-text-400">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      className={`w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none placeholder:text-text-400 focus:border-brass-400 ${className}`}
      {...rest}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return (
    <select
      className={`w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-brass-400 ${className}`}
      {...rest}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      className={`w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none placeholder:text-text-400 focus:border-brass-400 ${className}`}
      {...rest}
    />
  );
}

export function FormSection({
  step,
  title,
  subtitle,
  children,
}: {
  step?: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-stone-100 py-7 first:pt-0 last:border-0 last:pb-0">
      <div className="mb-5 flex items-start gap-3">
        {step && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-900 font-mono text-xs font-medium text-brass-300">
            {step}
          </span>
        )}
        <div>
          <h3 className="font-display text-lg font-medium text-ink-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-text-600">{subtitle}</p>}
        </div>
      </div>
      <div className={step ? "pl-10" : ""}>{children}</div>
    </div>
  );
}

export function PillToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
            value === opt.value ? "bg-ink-900 text-white" : "text-text-600 hover:text-ink-900"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function CheckboxTile({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
        checked
          ? "border-brass-400 bg-brass-50 text-ink-900"
          : "border-stone-200 bg-white text-text-600 hover:border-stone-300"
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
          checked ? "border-brass-500 bg-brass-500" : "border-stone-300 bg-white"
        }`}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}
