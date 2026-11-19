import { ReactNode } from "react";
import { SealMark } from "./SealMark";

type Variant =
  | "verified"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

const styles: Record<Variant, string> = {
  verified: "bg-brass-50 text-brass-700 ring-1 ring-inset ring-brass-200",
  success: "bg-success-100 text-success-700 ring-1 ring-inset ring-success-200",
  warning: "bg-warning-100 text-warning-600 ring-1 ring-inset ring-warning-100",
  danger: "bg-danger-50 text-danger-700 ring-1 ring-inset ring-danger-100",
  info: "bg-info-100 text-info-600 ring-1 ring-inset ring-info-100",
  neutral: "bg-stone-100 text-text-600 ring-1 ring-inset ring-stone-200",
  brand: "bg-ink-900 text-brass-200 ring-1 ring-inset ring-ink-700",
};

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${styles[variant]} ${className}`}
    >
      {variant === "verified" && <SealMark size={12} />}
      {children}
    </span>
  );
}
