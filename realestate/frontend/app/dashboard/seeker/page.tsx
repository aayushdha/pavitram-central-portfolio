"use client";

import { Bookmark, Heart, CalendarClock, ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { seekerNav } from "@/lib/nav-config";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { EmptyState } from "@/components/ui/EmptyState";
import { RealPropertyCard } from "@/components/dashboard/RealPropertyCard";
import { useApiData } from "@/lib/hooks/useApiData";
import { useAuth } from "@/lib/auth/AuthProvider";
import { savedSearchesApi } from "@/lib/api/saved-searches";
import { wishlistApi } from "@/lib/api/wishlist";
import { siteVisitsApi } from "@/lib/api/site-visits";
import { propertiesApi } from "@/lib/api/properties";

async function loadSeekerOverview() {
  const [savedRes, wishlistRes, visitsRes, recommendedRes] = await Promise.all([
    savedSearchesApi.list(),
    wishlistApi.list(),
    siteVisitsApi.mineAsSeeker(),
    propertiesApi.list({ pageSize: 6 }),
  ]);
  return {
    savedSearches: savedRes.savedSearches,
    wishlist: wishlistRes.items,
    siteVisits: visitsRes.siteVisits,
    recommended: recommendedRes.properties,
  };
}

export default function SeekerOverviewPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useApiData(loadSeekerOverview);

  const savedSearches = data?.savedSearches ?? [];
  const wishlist = data?.wishlist ?? [];
  const siteVisits = data?.siteVisits ?? [];
  const recommended = data?.recommended ?? [];
  const upcomingVisits = siteVisits.filter((v) => v.status !== "COMPLETED" && v.status !== "CANCELLED");
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <DashboardShell
      groups={seekerNav}
      pageTitle={`Welcome back, ${firstName}`}
      pageSubtitle="Your searches, shortlist & upcoming visits"
    >
      {loading && <LoadingRow label="Loading your dashboard…" />}
      {error && <ErrorRow message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Saved searches" value={String(savedSearches.length)} icon={<Bookmark size={16} />} />
            <StatCard label="Shortlisted" value={String(wishlist.length)} icon={<Heart size={16} />} />
            <StatCard label="Upcoming visits" value={String(upcomingVisits.length)} icon={<CalendarClock size={16} />} />
            <StatCard label="Recommended for you" value={String(recommended.length)} hint="based on live listings" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2" padded={false}>
              <div className="p-5 pb-0 sm:p-6 sm:pb-0">
                <CardHeader
                  eyebrow="Upcoming"
                  title="Site visits"
                  action={
                    <Button href="/dashboard/seeker/site-visits" variant="ghost" size="sm" icon={<ArrowRight size={14} />}>
                      View all
                    </Button>
                  }
                />
              </div>
              {siteVisits.length ? (
                <ul className="divide-y divide-stone-100 px-5 pb-5 sm:px-6 sm:pb-6">
                  {siteVisits.slice(0, 5).map((v) => (
                    <li key={v.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-900">{v.property?.title ?? v.project?.name ?? "Property visit"}</p>
                        <p className="text-xs text-text-400">
                          {new Date(v.scheduledAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · with {v.host?.name ?? "host"}
                        </p>
                      </div>
                      <Badge variant={v.status === "CONFIRMED" ? "success" : v.status === "REQUESTED" ? "warning" : "neutral"}>
                        {v.status === "REQUESTED" ? "Pending" : v.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-5 sm:p-6">
                  <p className="text-sm text-text-400">No site visits scheduled yet.</p>
                </div>
              )}
            </Card>

            <Card>
              <CardHeader
                eyebrow="Alerts on"
                title="Saved searches"
                action={
                  <Button href="/dashboard/seeker/saved-searches" variant="ghost" size="sm" icon={<ArrowRight size={14} />}>
                    All
                  </Button>
                }
              />
              {savedSearches.length ? (
                <ul className="space-y-3">
                  {savedSearches.slice(0, 5).map((s) => (
                    <li key={s.id} className="rounded-xl border border-stone-200 p-3">
                      <p className="text-sm text-ink-900">{s.name}</p>
                      {s.alertsEnabled && (
                        <Badge variant="verified" className="mt-2">Alerts on</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-400">No saved searches yet.</p>
              )}
            </Card>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-medium text-ink-900">Recommended for you</h2>
              <Button href="/properties" variant="outline" size="sm" icon={<ArrowRight size={14} />}>
                Browse more
              </Button>
            </div>
            {recommended.length ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.map((p) => (
                  <RealPropertyCard key={p.id} property={p} />
                ))}
              </div>
            ) : (
              <EmptyState title="No live listings yet" description="Once properties are approved by our moderation team, they'll be recommended here." />
            )}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
