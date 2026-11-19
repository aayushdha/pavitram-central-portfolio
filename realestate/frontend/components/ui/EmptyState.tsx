import { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 px-6 py-14 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-text-400 ring-1 ring-stone-200">
          {icon}
        </div>
      )}
      <h3 className="font-display text-base font-medium text-ink-900">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-text-600">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
