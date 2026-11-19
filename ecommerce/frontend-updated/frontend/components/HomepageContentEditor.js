"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { Field, Input, TextArea, Button } from "@/components/Field";
import api from "@/lib/api";

const DEFAULT_HERO = {
  badge: "🇮🇳 India's everyday shopping + wholesale trade, one site",
  titleLine1: "Buy one saree, or",
  titleHighlight: "ten thousand of them",
  titleSuffix: "— it's that simple.",
  subtitle:
    "Shopping for yourself? Add to cart and pay in a minute — just like any store you already use. Buying or selling for your business? Get wholesale prices, credit terms, and proper GST bills — on the very same account, once you're verified.",
  primaryCta: "Start shopping",
  secondaryCta: "I run a business",
};

const DEFAULT_STEPS = [
  { title: "Browse & choose", text: "Search products by category, price, or vendor — same catalog for everyone." },
  { title: "Buy your way", text: "Shoppers pay instantly and check out. Businesses request a quote (RFQ) for bulk pricing and credit terms." },
  { title: "Track & receive", text: "Follow your order status and get it delivered, with a proper bill every time." },
];

const DEFAULT_TESTIMONIALS = [
  { quote: "I ordered one saree for my sister's wedding and it reached in three days. Checkout took less than a minute.", name: "Priya M.", role: "Shopper, Pune" },
  { quote: "We switched our turmeric sourcing to Pavitram's B2B account. Bulk pricing and GST bills, sorted every month without any calls.", name: "Rakesh Traders", role: "Registered B2B buyer" },
  { quote: "Registering my handloom store took one afternoon. Now I sell to single customers and shops from the same dashboard.", name: "Kutch Handloom Co.", role: "Verified vendor" },
];

// Small helper: shows "Saved ✓" for a moment after a successful save, so the
// admin gets confirmation without a page reload or a toast library.
function SaveButton({ onClick, saving, savedJustNow }) {
  return (
    <Button type="button" onClick={onClick} disabled={saving}>
      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
      {saving ? "Saving…" : savedJustNow ? "Saved ✓" : "Save"}
    </Button>
  );
}

export default function HomepageContentEditor() {
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await api.siteContent.all();
        if (all["homepage.hero"]) setHero({ ...DEFAULT_HERO, ...all["homepage.hero"] });
        if (all["homepage.howItWorks"]?.length) setSteps(all["homepage.howItWorks"]);
        if (all["homepage.testimonials"]?.length) setTestimonials(all["homepage.testimonials"]);
      } catch {
        // Backend not reachable yet — form still works with defaults, admin
        // can still edit and Save will retry the request.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async (key, value) => {
    setSavingKey(key);
    try {
      await api.siteContent.set(key, value);
      setSavedKey(key);
      setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 2000);
    } catch (e) {
      alert(`Couldn't save — ${e.message || "please try again."}`);
    } finally {
      setSavingKey(null);
    }
  };

  const updateStep = (i, field, val) => setSteps((s) => s.map((st, idx) => (idx === i ? { ...st, [field]: val } : st)));

  const updateTestimonial = (i, field, val) =>
    setTestimonials((t) => t.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));
  const addTestimonial = () => setTestimonials((t) => [...t, { quote: "", name: "", role: "" }]);
  const removeTestimonial = (i) => setTestimonials((t) => t.filter((_, idx) => idx !== i));

  if (loading) {
    return <p className="text-sm text-ink-muted">Loading homepage content…</p>;
  }

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-ink">Hero banner (top of homepage)</h4>
          <SaveButton onClick={() => save("homepage.hero", hero)} saving={savingKey === "homepage.hero"} savedJustNow={savedKey === "homepage.hero"} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Small badge text"><Input value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} /></Field>
          <Field label="Primary button label"><Input value={hero.primaryCta} onChange={(e) => setHero({ ...hero, primaryCta: e.target.value })} /></Field>
          <Field label="Headline — first line"><Input value={hero.titleLine1} onChange={(e) => setHero({ ...hero, titleLine1: e.target.value })} /></Field>
          <Field label="Headline — highlighted words"><Input value={hero.titleHighlight} onChange={(e) => setHero({ ...hero, titleHighlight: e.target.value })} /></Field>
          <Field label="Headline — ending"><Input value={hero.titleSuffix} onChange={(e) => setHero({ ...hero, titleSuffix: e.target.value })} /></Field>
          <Field label="Second button label"><Input value={hero.secondaryCta} onChange={(e) => setHero({ ...hero, secondaryCta: e.target.value })} /></Field>
        </div>
        <Field label="Subtitle paragraph" className="mt-3">
          <TextArea rows={3} value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
        </Field>
      </div>

      {/* How it works */}
      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-ink">&quot;How it works&quot; — 3 steps</h4>
          <SaveButton onClick={() => save("homepage.howItWorks", steps)} saving={savingKey === "homepage.howItWorks"} savedJustNow={savedKey === "homepage.howItWorks"} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="rounded-xl border border-line p-3">
              <p className="text-xs font-semibold text-ink-muted">Step {i + 1}</p>
              <Field label="Title" className="mt-2"><Input value={s.title} onChange={(e) => updateStep(i, "title", e.target.value)} /></Field>
              <Field label="Description" className="mt-2"><TextArea rows={3} value={s.text} onChange={(e) => updateStep(i, "text", e.target.value)} /></Field>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-ink">Testimonials</h4>
          <div className="flex items-center gap-2">
            <Button type="button" onClick={addTestimonial}><Plus size={14} /> Add testimonial</Button>
            <SaveButton onClick={() => save("homepage.testimonials", testimonials)} saving={savingKey === "homepage.testimonials"} savedJustNow={savedKey === "homepage.testimonials"} />
          </div>
        </div>
        <div className="mt-3 space-y-3">
          {testimonials.map((t, i) => (
            <div key={i} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-start">
              <Field label="Quote"><TextArea rows={2} value={t.quote} onChange={(e) => updateTestimonial(i, "quote", e.target.value)} /></Field>
              <Field label="Name"><Input value={t.name} onChange={(e) => updateTestimonial(i, "name", e.target.value)} /></Field>
              <Field label="Role / location"><Input value={t.role} onChange={(e) => updateTestimonial(i, "role", e.target.value)} /></Field>
              <button type="button" onClick={() => removeTestimonial(i)} className="mt-6 justify-self-start" style={{ color: "var(--color-rose)" }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
