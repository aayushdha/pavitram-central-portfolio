"use client";

import { useState } from "react";
import { Headset, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Field, Input, TextArea, Select, Button } from "@/components/Field";
import { useStore } from "@/lib/store";

const emptyForm = { from: "", email: "", subject: "", priority: "Normal", message: "" };

export default function SupportPage() {
  const { auth, supportTickets } = useStore();
  const [form, setForm] = useState({
    ...emptyForm,
    from: auth?.name || "",
    email: auth?.email || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supportTickets.add(
        { from: form.from, email: form.email, subject: form.subject, message: form.message, priority: form.priority, status: "Open" },
        { message: "Message sent — our team will get back to you shortly." }
      );
      setSent(true);
      setForm({ ...emptyForm, from: form.from, email: form.email });
    } catch {
      // useStore() already shows an error toast on failure.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-xl px-5 py-16">
        <div className="flex items-center gap-2">
          <Headset size={20} style={{ color: "var(--color-gold)" }} />
          <h1 className="font-display text-2xl font-semibold text-ink">Contact & Help</h1>
        </div>
        <p className="mt-2 text-sm text-ink-muted">
          Question about an order, a product, or your account? Send us a message and our support team will reply by email.
        </p>

        {sent ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-line bg-paper-raised px-6 py-10 text-center">
            <CheckCircle2 size={32} style={{ color: "var(--color-jade)" }} />
            <p className="font-display text-lg font-semibold text-ink">Message sent</p>
            <p className="text-sm text-ink-muted">We've received your message and will get back to you shortly.</p>
            <Button type="button" onClick={() => setSent(false)}>Send another message</Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name" required>
                <Input required value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} />
              </Field>
              <Field label="Email address" required>
                <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
            </div>
            <Field label="Subject" required>
              <Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Order #1234 not delivered" />
            </Field>
            <Field label="Priority">
              <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option>Normal</option>
                <option>Urgent</option>
              </Select>
            </Field>
            <Field label="Message" required>
              <TextArea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us what's going on…" />
            </Field>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Sending…" : "Send message"}
            </Button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
