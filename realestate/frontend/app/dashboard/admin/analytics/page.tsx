import { Download, Calendar } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PreviewBanner } from "@/components/dashboard/PreviewBanner";
import { adminNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TrendChart } from "@/components/charts/TrendChart";
import { BarComparison } from "@/components/charts/BarComparison";
import { mrrTrend } from "@/lib/mock-data";

const retentionCohorts = [
  { label: "Jan '26", value: 61 },
  { label: "Feb '26", value: 58 },
  { label: "Mar '26", value: 64 },
  { label: "Apr '26", value: 67 },
  { label: "May '26", value: 63 },
  { label: "Jun '26", value: 70 },
];

const siteVisitTrend = [
  { label: "Mon", value: 2820 },
  { label: "Tue", value: 3010 },
  { label: "Wed", value: 2950 },
  { label: "Thu", value: 3120 },
  { label: "Fri", value: 3340 },
  { label: "Sat", value: 3980 },
  { label: "Sun", value: 3610 },
];

export default function AdminAnalyticsPage() {
  return (
    <DashboardShell
      groups={adminNav}
      pageTitle="Reports"
      pageSubtitle="Numbers, trends, and reports you can build yourself"
    >
      <PreviewBanner>
        Site-traffic analytics and cohort retention need an analytics pipeline that isn&apos;t wired up yet.
        For real, live numbers today, see the Admin Overview page — this page shows the intended report
        layout with sample data.
      </PreviewBanner>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader eyebrow="Demand" title="Site-visit requests per day" />
          <TrendChart data={siteVisitTrend} dataKey="value" height={240} />
        </Card>
        <Card>
          <CardHeader eyebrow="Retention" title="Seekers who come back (30-day %)" />
          <BarComparison data={retentionCohorts} dataKey="value" height={240} />
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader eyebrow="Revenue" title="MRR trend, all plans" />
        <TrendChart data={mrrTrend} dataKey="value" valuePrefix="₹" height={220} />
      </Card>

      <Card className="mt-6">
        <CardHeader eyebrow="Ad-hoc" title="Custom report builder" subtitle="Export CSV, Excel or PDF — schedule for auto-email delivery" />
        <div className="grid gap-3 sm:grid-cols-4">
          <select className="rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none">
            <option>Metric: Listings</option>
            <option>Metric: Leads</option>
            <option>Metric: Revenue</option>
          </select>
          <select className="rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none">
            <option>Group by: City</option>
            <option>Group by: Plan</option>
            <option>Group by: Week</option>
          </select>
          <div className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-text-500">
            <Calendar size={14} /> Last 90 days
          </div>
          <Button variant="primary" size="sm" icon={<Download size={14} />}>
            Export report
          </Button>
        </div>
      </Card>
    </DashboardShell>
  );
}
