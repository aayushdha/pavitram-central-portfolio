"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Field, Input, Select, Button } from "@/components/Field";
import { useStore } from "@/lib/store";
import KycDocsUpload from "@/components/KycDocsUpload";

const segments = ["Retailer", "Distributor", "Institutional", "Export"];
const buyerDocTypes = [
  { key: "gst", label: "GST Certificate", required: true },
  { key: "pan", label: "PAN Card", required: true },
  { key: "tradeLicense", label: "Trade License", required: true },
  { key: "signatoryKyc", label: "Authorized Signatory KYC", required: true },
  { key: "signature", label: "Signature", required: true },
];

export default function B2BRegisterPage() {
  const { auth, businessBuyers, linkBuyer } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({ company: "", gstin: "", pan: "", cin: "", segment: "Retailer", trade: "", bank: "", docs: {} });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (auth?.buyerId) router.push("/b2b/dashboard");
  }, [auth?.buyerId, router]);

  if (auth?.buyerId) {
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


  const onSubmit = async (e) => {
    e.preventDefault();
    const missingRequired = buyerDocTypes.some((d) => d.required && !form.docs[d.key]);
    if (missingRequired) {
      alert("Please upload all required KYC documents (including your Signature) before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const record = await businessBuyers.add(
        {
          company: form.company,
          segment: form.segment,
          gstin: form.gstin,
          pan: form.pan,
          cin: form.cin,
          tradeLicense: form.trade,
          bankAccount: form.bank,
          status: "Under Review",
          creditLimit: 0,
          utilized: 0,
          terms: "—",
          kycDocuments: form.docs,
        },
        { message: "Business submitted for verification", log: `Business ${form.company} submitted KYC for verification` }
      );
      await linkBuyer(record.id);
      router.push("/b2b/dashboard");
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
          className="mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ background: "var(--color-jade)" }}
        >
          Step 2 of 2 · Business KYC
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
          Register your business
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          You&apos;re logged in with your business account — this last step
          verifies your company so purchases unlock tiered pricing, credit
          terms, and RFQ tools. Once you submit, an admin will review your
          documents — your buyer dashboard unlocks automatically as soon
          as you&apos;re approved.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name" required>
              <Input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Aarav Retail Chain Pvt Ltd" />
            </Field>
            <Field label="GSTIN" required>
              <Input required value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="24AAACA1234F1Z5" />
            </Field>
            <Field label="Business PAN" required>
              <Input required value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} placeholder="AAACA1234F" />
            </Field>
            <Field label="CIN / Udyam number">
              <Input value={form.cin} onChange={(e) => setForm({ ...form, cin: e.target.value })} placeholder="U51909GJ2020PTC123456" />
            </Field>
          </div>

          <Field label="Business segment" required>
            <Select value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
              {segments.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Trade license number">
              <Input value={form.trade} onChange={(e) => setForm({ ...form, trade: e.target.value })} placeholder="TL-2025-004821" />
            </Field>
            <Field label="Bank account (for settlements)" required>
              <Input required value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} placeholder="Account number" />
            </Field>
          </div>

          <div>
            <span className="text-xs font-medium text-ink-muted">Document vault — upload each required KYC document separately</span>
            <p className="mt-1 text-[11px] text-ink-muted">
              Each document (including your signature) is stored and can be reviewed separately by our admin team.
            </p>
            <div className="mt-2">
              <KycDocsUpload
                folder="b2b-kyc"
                docTypes={buyerDocTypes}
                value={form.docs}
                onChange={(docs) => setForm((f) => ({ ...f, docs }))}
              />
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full" style={{ background: "var(--color-jade)" }}>
            {submitting ? "Submitting…" : "Submit for verification"}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
