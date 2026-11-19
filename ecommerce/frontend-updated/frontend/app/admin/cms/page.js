"use client";

import { useState } from "react";
import { Image as ImageIcon, Tag, Layers3, Plus, Pencil, Trash2 } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import SectionCard from "@/components/SectionCard";
import Modal from "@/components/Modal";
import { Field, Input, Select, Button } from "@/components/Field";
import { adminNav } from "@/lib/adminNav";
import { useStore } from "@/lib/store";
import HomepageContentEditor from "@/components/HomepageContentEditor";

const emptyBanner = { title: "", channel: "B2C", placement: "Homepage Hero", status: "Scheduled", clicks: 0 };
const emptyCoupon = { code: "", type: "Site-wide %", value: "", channel: "B2C", costBorneBy: "Platform", uses: 0, status: "Active" };

export default function CMSPage() {
  const { state, banners, coupons } = useStore();
  const [bannerModal, setBannerModal] = useState(null);
  const [bannerForm, setBannerForm] = useState(emptyBanner);
  const [couponModal, setCouponModal] = useState(null);
  const [couponForm, setCouponForm] = useState(emptyCoupon);

  const openAddBanner = () => { setBannerForm(emptyBanner); setBannerModal({ mode: "add" }); };
  const openEditBanner = (b) => { setBannerForm(b); setBannerModal({ mode: "edit", id: b.id }); };
  const submitBanner = (e) => {
    e.preventDefault();
    const payload = { ...bannerForm, clicks: Number(bannerForm.clicks) || 0 };
    if (bannerModal.mode === "add") banners.add(payload, { message: "Banner created" });
    else banners.update(bannerModal.id, payload, { message: "Banner updated" });
    setBannerModal(null);
  };
  const removeBanner = (b) => { if (confirm(`Delete banner "${b.title}"?`)) banners.remove(b.id, { message: "Banner deleted" }); };
  const toggleBannerStatus = (b) => banners.update(b.id, { status: b.status === "Live" ? "Scheduled" : "Live" }, { message: "Banner status updated" });

  const openAddCoupon = () => { setCouponForm(emptyCoupon); setCouponModal({ mode: "add" }); };
  const openEditCoupon = (c) => { setCouponForm(c); setCouponModal({ mode: "edit", id: c.id }); };
  const submitCoupon = (e) => {
    e.preventDefault();
    const payload = { ...couponForm, uses: Number(couponForm.uses) || 0 };
    if (couponModal.mode === "add") coupons.add(payload, { message: "Coupon created" });
    else coupons.update(couponModal.id, payload, { message: "Coupon updated" });
    setCouponModal(null);
  };
  const removeCoupon = (c) => { if (confirm(`Delete coupon "${c.code}"?`)) coupons.remove(c.id, { message: "Coupon deleted" }); };
  const toggleCouponStatus = (c) => coupons.update(c.id, { status: c.status === "Active" ? "Paused" : "Active" }, { message: "Coupon status updated" });

  return (
    <DashboardShell
      title="CMS & Marketing"
      roleLabel="Super Admin"
      accent="var(--color-ink)"
      nav={adminNav}
      activeHref="/admin/cms"
      requireRole="admin"
    >
      <SectionCard icon={Layers3} title="Homepage content" description="Edit the hero banner, 'How it works' steps, and testimonials shown on the homepage — no code required. Changes go live as soon as you save each section.">
        <HomepageContentEditor />
      </SectionCard>

      <div className="mt-6">
      <SectionCard icon={ImageIcon} title="Banners & promotions" description="Manage banners, carousels, 'Deal of the Day', and trending categories. Separate CMS-driven landing experiences for the B2C storefront and B2B trade portal.">
        <div className="mb-3 flex justify-end">
          <Button onClick={openAddBanner}><Plus size={15} /> Create new banner</Button>
        </div>
        <DataTable
          columns={[
            { key: "title", label: "Banner / Campaign" },
            { key: "channel", label: "Channel", render: (r) => <Badge tone={r.channel === "B2B" ? "jade" : "gold"}>{r.channel}</Badge> },
            { key: "placement", label: "Placement" },
            { key: "clicks", label: "Clicks", render: (r) => r.clicks.toLocaleString("en-IN") },
            { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Live" ? "green" : "ink"}>{r.status}</Badge> },
            {
              key: "actions", label: "Actions", render: (r) => (
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleBannerStatus(r)} className="text-xs font-semibold" style={{ color: "var(--color-jade)" }}>
                    {r.status === "Live" ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => openEditBanner(r)} className="text-ink-muted hover:text-ink"><Pencil size={14} /></button>
                  <button onClick={() => removeBanner(r)} style={{ color: "var(--color-rose)" }}><Trash2 size={14} /></button>
                </div>
              ),
            },
          ]}
          rows={state.banners}
        />
      </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard icon={Tag} title="Platform-wide coupon engine" description="Site-wide discount codes, seasonal sales, and free-shipping rules — cost absorbed by platform or split with vendor. Includes B2B volume-slab discounts and early-payment discounts.">
          <div className="mb-3 flex justify-end">
            <Button onClick={openAddCoupon}><Plus size={15} /> Create coupon</Button>
          </div>
          <DataTable
            columns={[
              { key: "code", label: "Code" },
              { key: "type", label: "Type" },
              { key: "value", label: "Value" },
              { key: "channel", label: "Channel", render: (r) => <Badge tone={r.channel === "B2B" ? "jade" : "gold"}>{r.channel}</Badge> },
              { key: "costBorneBy", label: "Cost Borne By" },
              { key: "uses", label: "Uses", render: (r) => r.uses.toLocaleString("en-IN") },
              { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Active" ? "green" : "ink"}>{r.status}</Badge> },
              {
                key: "actions", label: "Actions", render: (r) => (
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleCouponStatus(r)} className="text-xs font-semibold" style={{ color: "var(--color-jade)" }}>
                      {r.status === "Active" ? "Pause" : "Activate"}
                    </button>
                    <button onClick={() => openEditCoupon(r)} className="text-ink-muted hover:text-ink"><Pencil size={14} /></button>
                    <button onClick={() => removeCoupon(r)} style={{ color: "var(--color-rose)" }}><Trash2 size={14} /></button>
                  </div>
                ),
              },
            ]}
            rows={state.coupons}
          />
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard icon={Layers3} title="B2B promotional tools" description="Volume-slab discounts (e.g. 'Buy 500+ units, get extra 5% off'), early-payment discounts, and festive bulk-order campaigns targeted at business buyers.">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-line p-3 text-xs">
              <p className="font-semibold text-ink">Volume slab campaign</p>
              <p className="mt-1 text-ink-muted">Buy 500+ units → extra 5% off, auto-applied at checkout.</p>
            </div>
            <div className="rounded-xl border border-line p-3 text-xs">
              <p className="font-semibold text-ink">Early-payment discount</p>
              <p className="mt-1 text-ink-muted">2% off invoice value when paid within 48 hours of dispatch.</p>
            </div>
            <div className="rounded-xl border border-line p-3 text-xs">
              <p className="font-semibold text-ink">Festive bulk campaign</p>
              <p className="mt-1 text-ink-muted">Diwali stock-up drive — targeted push to Retailer & Distributor segments.</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <Modal open={!!bannerModal} onClose={() => setBannerModal(null)} title={bannerModal?.mode === "add" ? "Create banner" : "Edit banner"}>
        <form onSubmit={submitBanner} className="space-y-4">
          <Field label="Title" required><Input required value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Channel">
              <Select value={bannerForm.channel} onChange={(e) => setBannerForm({ ...bannerForm, channel: e.target.value })}>
                <option>B2C</option><option>B2B</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={bannerForm.status} onChange={(e) => setBannerForm({ ...bannerForm, status: e.target.value })}>
                <option>Live</option><option>Scheduled</option>
              </Select>
            </Field>
          </div>
          <Field label="Placement"><Input value={bannerForm.placement} onChange={(e) => setBannerForm({ ...bannerForm, placement: e.target.value })} /></Field>
          <Button type="submit" className="w-full">{bannerModal?.mode === "add" ? "Create banner" : "Save changes"}</Button>
        </form>
      </Modal>

      <Modal open={!!couponModal} onClose={() => setCouponModal(null)} title={couponModal?.mode === "add" ? "Create coupon" : "Edit coupon"}>
        <form onSubmit={submitCoupon} className="space-y-4">
          <Field label="Code" required><Input required value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <Select value={couponForm.type} onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}>
                <option>Site-wide %</option><option>Free shipping</option><option>Volume slab</option><option>Early-payment discount</option>
              </Select>
            </Field>
            <Field label="Channel">
              <Select value={couponForm.channel} onChange={(e) => setCouponForm({ ...couponForm, channel: e.target.value })}>
                <option>B2C</option><option>B2B</option>
              </Select>
            </Field>
          </div>
          <Field label="Value" required><Input required value={couponForm.value} onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })} placeholder="10% off" /></Field>
          <Field label="Cost borne by">
            <Select value={couponForm.costBorneBy} onChange={(e) => setCouponForm({ ...couponForm, costBorneBy: e.target.value })}>
              <option>Platform</option><option>Vendor</option><option>Split w/ Vendor</option>
            </Select>
          </Field>
          <Button type="submit" className="w-full">{couponModal?.mode === "add" ? "Create coupon" : "Save changes"}</Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}
