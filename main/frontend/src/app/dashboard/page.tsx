"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { DASHBOARD_SERVICES, type DashboardService } from "@/lib/auth/services";
import { getServices } from "@/lib/api/cms";
import { getIcon } from "@/lib/icon-map";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<DashboardService[]>(DASHBOARD_SERVICES);

  useEffect(() => {
    let active = true;
    getServices().then((data) => {
      if (!active || !data || data.length === 0) return;
      const mapped: DashboardService[] = data
        .filter((s) => s.isPublished && s.showOnDashboard)
        .sort((a, b) => a.order - b.order)
        .map((s) => ({
          id: s.slug,
          name: s.name,
          description: s.dashboardDescription || s.tagline,
          href: s.dashboardHref || `/services/${s.slug}`,
          external: s.dashboardExternal,
          sso: s.dashboardSso,
          Icon: getIcon(s.heroIcon),
          accent: s.dashboardAccent,
        }));
      if (mapped.length > 0) setServices(mapped);
    });
    return () => {
      active = false;
    };
  }, []);

  function openService(service: DashboardService) {
    if (service.sso) {
      // Handoff Bearer token (pavitram_token) to realestate app
      router.push("/sso/properties");
      return;
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-3xl bg-navy px-6 py-8 text-white shadow-[0_20px_60px_-24px_rgba(10,15,30,0.55)] md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Welcome</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
          Namaste, {user?.name?.split(" ")[0] || "Member"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
          Access Pavitram services from one place. Properties opens the real-estate portal with your
          session so you should not need to log in again.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-xs">
          <span className="rounded-full bg-white/10 px-3 py-1.5">
            Status: {user?.accountStatus || "ACTIVE"}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">
            KYC: {user?.kycStatus || "—"}
          </span>
          <span className="rounded-full bg-gold/20 px-3 py-1.5 text-gold">
            {user?.role?.replaceAll("_", " ")}
          </span>
        </div>
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Your services</h2>
          <p className="mt-1 text-sm text-mist">Jump into any Pavitram vertical below.</p>
        </div>
        <Link href="/dashboard/profile" className="text-sm font-semibold text-gold hover:underline">
          Manage profile
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => {
          const Icon = service.Icon;
          const card = (
            <div
              className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(13,27,62,0.25)]`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${service.accent}`}
              />
              <div className="relative">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-gold">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-ink">{service.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-mist">{service.description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-gold">
                  {service.external ? (
                    <>
                      Open portal <ExternalLink className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      Open service <ArrowUpRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </span>
              </div>
            </div>
          );

          if (service.sso) {
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => openService(service)}
                className="text-left"
              >
                {card}
              </button>
            );
          }

          return (
            <Link key={service.id} href={service.href}>
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
