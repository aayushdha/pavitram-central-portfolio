import { HTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
  padded = true,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; padded?: boolean }) {
  return (
    <div
      className={`min-w-0 rounded-2xl border border-stone-200 bg-white ${padded ? "p-5 sm:p-6" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  eyebrow,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-brass-600">
            {eyebrow}
          </p>
        )}
        <h3 className="font-display text-lg font-medium text-ink-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-text-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
