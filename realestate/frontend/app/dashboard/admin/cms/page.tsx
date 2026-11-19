import { Image as ImageIcon, Tag, Send, Plus } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PreviewBanner } from "@/components/dashboard/PreviewBanner";
import { adminNav } from "@/lib/nav-config";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { cmsBanners, promoCodes } from "@/lib/mock-data";

export default function AdminCmsPage() {
  const bannerCols: Column<(typeof cmsBanners)[number]>[] = [
    { header: "Banner", accessor: (r) => <span className="font-medium text-ink-900">{r.title}</span> },
    { header: "Placement", accessor: (r) => r.placement },
    { header: "Status", accessor: (r) => <Badge variant={r.live ? "success" : "neutral"}>{r.live ? "Live" : "Draft"}</Badge> },
    {
      header: "Actions",
      accessor: () => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm">{"Unpublish"}</Button>
        </div>
      ),
      align: "right",
    },
  ];

  const promoCols: Column<(typeof promoCodes)[number]>[] = [
    { header: "Code", accessor: (r) => <span className="font-mono text-xs font-medium">{r.code}</span> },
    { header: "Description", accessor: (r) => r.desc },
    { header: "Scope", accessor: (r) => <Badge variant="neutral">{r.scope}</Badge> },
    { header: "Redemptions", accessor: (r) => r.redemptions, align: "center" },
    { header: "Status", accessor: (r) => <Badge variant={r.status === "Active" ? "success" : "neutral"}>{r.status}</Badge> },
  ];

  return (
    <DashboardShell
      groups={adminNav}
      pageTitle="Website & marketing"
      pageSubtitle="Homepage builder, promo codes & campaigns"
    >
      <PreviewBanner>
        There&apos;s no CMS content model on the backend yet (banners, promo codes, campaigns). This page shows
        the intended editor with sample content until a `cms` module is added to the backend.
      </PreviewBanner>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" padded={false}>
          <div className="p-5 pb-0 sm:p-6 sm:pb-0">
            <CardHeader
              eyebrow="No-code homepage builder"
              title="Homepage banners & rails"
              action={
                <Button variant="primary" size="sm" icon={<Plus size={14} />}>
                  New banner
                </Button>
              }
            />
          </div>
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <DataTable columns={bannerCols} data={cmsBanners} keyField={(r) => r.id} />
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="Segments" title="Send a campaign" />
          <div className="space-y-3">
            <label className="block text-xs font-medium text-text-600">
              Audience
              <select className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none">
                <option>Seekers — city: Ahmedabad, budget &lt; ₹1 Cr</option>
                <option>Owners — plan expiring in 7 days</option>
                <option>Builders — RERA renewal due</option>
              </select>
            </label>
            <label className="block text-xs font-medium text-text-600">
              Channel
              <div className="mt-1.5 flex gap-2">
                {["Email", "Push", "SMS"].map((c) => (
                  <span key={c} className="rounded-full border border-stone-200 px-3 py-1.5 text-xs text-text-600">
                    {c}
                  </span>
                ))}
              </div>
            </label>
            <Button variant="secondary" size="sm" icon={<Send size={13} />} className="w-full">
              Send campaign
            </Button>
          </div>
        </Card>
      </div>

      <Card className="mt-6" padded={false}>
        <div className="p-5 pb-0 sm:p-6 sm:pb-0">
          <CardHeader
            eyebrow="Growth"
            title="Promo codes"
            action={
              <Button variant="outline" size="sm" icon={<Tag size={14} />}>
                New code
              </Button>
            }
          />
        </div>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <DataTable columns={promoCols} data={promoCodes} keyField={(r) => r.code} />
        </div>
      </Card>

      <Card className="mt-6">
        <div className="flex items-start gap-3">
          <ImageIcon size={18} className="mt-0.5 shrink-0 text-brand-600" />
          <div>
            <p className="font-medium text-ink-900">Real Estate Resource Center</p>
            <p className="text-sm text-text-600">
              Blog articles, home-buying guides and locality price-trend reports publish here and
              surface on the seeker-facing homepage automatically.
            </p>
          </div>
        </div>
      </Card>
    </DashboardShell>
  );
}
