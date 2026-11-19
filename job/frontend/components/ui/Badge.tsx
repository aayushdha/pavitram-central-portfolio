import { ReactNode } from "react";

type Tone = "brand" | "good" | "warn" | "bad" | "neutral" | "spark";

const tones: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700",
  good: "bg-good-100 text-good-500",
  warn: "bg-warn-100 text-[#8A6300]",
  bad: "bg-bad-100 text-bad-500",
  neutral: "bg-[#F0F1F6] text-muted",
  spark: "bg-[#FFE9D9] text-spark-600",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function stageTone(stage: string): Tone {
  switch (stage) {
    case "Hired":
    case "Offer":
    case "Verified":
    case "Active":
    case "Live":
      return "good";
    case "Rejected":
    case "Suspended":
    case "Closed":
      return "bad";
    case "Interview":
    case "Assessment":
      return "brand";
    case "Applied":
    case "Draft":
      return "neutral";
    case "Shortlisted":
    case "KYC Pending":
    case "Expiring":
      return "warn";
    default:
      return "neutral";
  }
}
