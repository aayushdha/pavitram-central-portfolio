"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Field, Input, Button } from "@/components/Field";
import { useStore } from "@/lib/store";
import KycDocsUpload from "@/components/KycDocsUpload";

const categories = ["Textiles & Fabrics", "Spices & Foodgrain", "Handicrafts & Decor", "Electronics", "Ayurveda", "Packaging"];
const vendorDocTypes = [
  { key: "gst", label: "GST Certificate", required: true },
  { key: "pan", label: "PAN Card", required: true },
  { key: "shopReg", label: "Shop / Udyam Registration", required: true },
  { key: "idProof", label: "Owner ID Proof", required: true },
  { key: "signature", label: "Signature", required: true },
];

export default function VendorRegisterPage() {
  const { auth, vendors, linkVendor, upsertVendorStoreProfile } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", gstin: "", pan: "", bank: "", state: "", categories: [], docs: {} });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (auth?.vendorId) router.push("/vendor/dashboard");
  }, [auth?.vendorId, router]);

  if (auth?.vendorId) {
    return null;
  }
  if (!auth) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="mx-auto max-w-md px-5 py-16 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Log in first</h1>
          <p className="mt-2 text-sm text-ink-muted">
            You need to be logged in to your Pavitram account before completing this step.
          </p>
          <Link
            href="/business/signup"
            className="mt-5 inline-block rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ background: "var(--color-jade)" }}
          >
            Go back and log in
          </Link>
        </div>
        <Footer />
      </div>
    );
  }


  const toggle = (key, val) =>
    setForm((f) => ({ ...f, [key]: f[key].includes(val) ? f[key].filter((v) => v !== val) : [...f[key], val] }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const missingRequired = vendorDocTypes.some((d) => d.required && !form.docs[d.key]);
    if (missingRequired) {
      alert("Please upload all required KYC documents (including your Signature) before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const record = await vendors.add(
        {
          name: form.name,
          channel: "Both",
          status: "Under Review",
          gstin: form.gstin,
          pan: form.pan,
          bankAccount: form.bank,
          state: form.state,
          gmvB2C: 0,
          gmvB2B: 0,
          rating: 0,
          returns: "0%",
          joined: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
          kycDocuments: form.docs,
        },
        { message: "Store submitted for verification", log: `Vendor ${form.name} submitted KYC for verification` }
      );
      await upsertVendorStoreProfile(record.id, {
        name: form.name,
        tagline: `Verified seller across ${form.categories.join(", ") || "multiple categories"}`,
        channels: ["B2C", "B2B"],
      });
      await linkVendor(record.id);
      router.push("/vendor/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-2xl px-5 py-14 lg:px-8">
        <Link href="/business/signup" className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-ink">
          <ChevronLeft size={14} /> Back
        </Link>
        <span
          className="mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold text-ink"
          style={{ background: "var(--color-gold-dim)", color: "var(--color-gold)" }}
        >
          Step 2 of 2 · Store verification
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
          Register your store
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          You&apos;re logged in with your business account — this last step
          verifies your store so you can list products for both retail
          shoppers and bulk business buyers. Once you submit, an admin
          will review your documents — your seller dashboard unlocks
          automatically as soon as you&apos;re approved.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Store / brand name" required>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kutch Handloom Co." />
            </Field>
            <Field label="GSTIN" required>
              <Input required value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="24AAACA1234F1Z5" />
            </Field>
            <Field label="PAN" required>
              <Input required value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} placeholder="AAACA1234F" />
            </Field>
            <Field label="Bank account (for payouts)" required>
              <Input required value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} placeholder="Account number" />
            </Field>
            {/* BUGFIX: Vendor.state (business origin state) had a DTO field and
                DB column, but no form anywhere ever collected it. Without it,
                the GST engine could never detect an intra-state order — every
                single order was taxed as Inter-State (IGST) even when the
                vendor and customer were in the same state, which is a real
                CGST/SGST-vs-IGST compliance misclassification, not just a
                cosmetic bug. */}
            <Field label="Business state (for GST)" required>
              <Input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="e.g. Gujarat" />
            </Field>
          </div>

          <div>
            <span className="text-xs font-medium text-ink-muted">What do you sell? (select all that apply)</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => toggle("categories", c)}
                  className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm"
                  style={{
                    borderColor: form.categories.includes(c) ? "var(--color-gold)" : "var(--color-line)",
                    background: form.categories.includes(c) ? "var(--color-gold-dim)" : "var(--color-paper-raised)",
                    color: "var(--color-ink)",
                  }}
                >
                  {form.categories.includes(c) && <Check size={13} />}
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-ink-muted">Documents — upload each required KYC document separately</span>
            <p className="mt-1 text-[11px] text-ink-muted">
              Each document (including your signature) is stored and can be reviewed separately by our admin team.
            </p>
            <div className="mt-2">
              <KycDocsUpload
                folder="vendor-kyc"
                docTypes={vendorDocTypes}
                value={form.docs}
                onChange={(docs) => setForm((f) => ({ ...f, docs }))}
              />
            </div>
          </div>

          <Button type="submit" variant="gold" disabled={submitting} className="w-full" style={{ color: "var(--color-ink)" }}>
            {submitting ? "Submitting…" : "Submit for verification"}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
