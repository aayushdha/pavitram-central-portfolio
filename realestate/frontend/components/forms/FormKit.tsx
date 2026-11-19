"use client";

import { ReactNode } from "react";
import { Check, Upload } from "lucide-react";

export function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="font-display text-lg font-medium text-ink-900">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-text-600">{subtitle}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </div>
  );
}

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
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-text-700">
        {label}
        {required && <span className="text-brass-600">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-text-400">{hint}</span>}
    </label>
  );
}

const inputClasses =
  "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none placeholder:text-text-400 focus:border-brass-400";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClasses} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClasses} resize-none ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClasses} ${props.className ?? ""}`} />;
}

export function PillGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            value === opt
              ? "border-ink-900 bg-ink-900 text-white"
              : "border-stone-200 bg-white text-text-600 hover:border-stone-300"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function CheckboxGrid({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {options.map((opt) => {
        const checked = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
              checked
                ? "border-brass-400 bg-brass-50 text-ink-900"
                : "border-stone-200 bg-white text-text-600 hover:border-stone-300"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                checked ? "bg-brass-500 text-white" : "border border-stone-300 bg-white"
              }`}
            >
              {checked && <Check size={11} />}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function UploadBox({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/60 px-6 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brass-50 text-brass-600">
        <Upload size={17} />
      </div>
      <p className="text-sm font-medium text-ink-900">{label}</p>
      <p className="text-xs text-text-400">{hint}</p>
    </div>
  );
}

export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="mb-8 flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((label, i) => (
        <div key={label} className="flex shrink-0 items-center gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i < current
                  ? "bg-brass-500 text-ink-900"
                  : i === current
                  ? "bg-ink-900 text-white"
                  : "bg-stone-200 text-text-400"
              }`}
            >
              {i < current ? <Check size={13} /> : i + 1}
            </span>
            <span
              className={`hidden text-xs font-medium sm:block ${
                i <= current ? "text-ink-900" : "text-text-400"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span className={`mx-2 h-px w-6 sm:w-10 ${i < current ? "bg-brass-400" : "bg-stone-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
