"use client";

import Link from "next/link";
import { type FormEvent, type ReactNode } from "react";
import { LOGO_URL } from "@/components/site";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-navy text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 20%, rgba(201,149,42,0.18), transparent 45%), radial-gradient(ellipse at 80% 80%, rgba(232,184,75,0.12), transparent 50%)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <Link href="/" className="mb-10 flex items-center gap-3 self-center">
          <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-navy ring-1 ring-gold/40">
            <img src={LOGO_URL} alt="Pavitram India" className="h-11 w-11 object-contain" />
          </span>
          <span className="font-display text-xl font-bold">
            Pavitram <span className="text-gold">India</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-9">
          <h1 className="font-display text-3xl font-bold text-white">{title}</h1>
          <p className="mt-2 text-sm text-white/65">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-white/60">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-gold/90">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-gold/60 focus:bg-white/10";

export function SubmitButton({
  loading,
  children,
}: {
  loading?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 w-full rounded-full bg-gold px-5 py-3.5 text-sm font-bold text-navy transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

export type { FormEvent };
