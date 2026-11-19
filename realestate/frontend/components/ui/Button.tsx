import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brass-500 text-ink-900 hover:bg-brass-600 shadow-sm shadow-ink-900/10 ring-1 ring-inset ring-brass-600/30",
  secondary:
    "bg-ink-900 text-white hover:bg-ink-800 ring-1 ring-inset ring-brass-500/40",
  outline:
    "bg-transparent text-ink-900 ring-1 ring-inset ring-stone-300 hover:bg-stone-100",
  ghost: "bg-transparent text-text-700 hover:bg-stone-100",
  danger: "bg-danger-600 text-white hover:bg-danger-700",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  icon?: ReactNode;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { children, variant = "primary", size = "md", className = "", icon } = props;
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} target={props.target} className={classes}>
        {icon}
        {children}
      </Link>
    );
  }

  const {
    href: _href,
    children: _children,
    variant: _variant,
    size: _size,
    className: _className,
    icon: _icon,
    ...buttonProps
  } = props as ButtonAsButton;
  return (
    <button className={classes} {...buttonProps}>
      {icon}
      {children}
    </button>
  );
}
