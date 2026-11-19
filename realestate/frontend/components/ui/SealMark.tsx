type SealMarkProps = {
  size?: number;
  className?: string;
  title?: string;
};

/**
 * The Pavitram "verification seal" — a registry-stamp motif used wherever
 * trust is being asserted: verified listings, RERA-checked projects,
 * completed KYC, confirmed bookings. Ticks radiate like a wax seal;
 * the inner ring reads as an official stamp rather than a generic checkmark.
 */
export function SealMark({ size = 16, className = "", title }: SealMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="10.25" fill="currentColor" fillOpacity="0.12" />
      <circle cx="12" cy="12" r="10.25" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="12" r="7.4" stroke="currentColor" strokeWidth="0.7" strokeDasharray="1.4 2.1" />
      <path
        d="M8.4 12.3l2.35 2.3 4.85-5.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
