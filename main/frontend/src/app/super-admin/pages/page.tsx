"use client";

import { useEffect, useState } from "react";
import { Plus, Save, ChevronRight } from "lucide-react";
import { adminApi } from "@/lib/admin/api";
import { AdminCard, AdminButton, AdminInput, AdminTextarea, AdminBadge } from "@/components/admin/admin-ui";

type PageSummary = { id: string; slug: string; title: string; _count: { sections: number } };
type Section = {
  id: string;
  key: string;
  type: string;
  title: string | null;
  hindi: string | null;
  subtitle: string | null;
  body: Record<string, unknown>;
  order: number;
};
type PageDetail = {
  id: string;
  slug: string;
  title: string;
  hindi: string | null;
  subtitle: string | null;
  metaDescription: string | null;
  sections: Section[];
};

function SectionEditor({ pageSlug, section, onSaved }: { pageSlug: string; section: Section; onSaved: () => void }) {
  const [title, setTitle] = useState(section.title ?? "");
  const [hindi, setHindi] = useState(section.hindi ?? "");
  const [subtitle, setSubtitle] = useState(section.subtitle ?? "");
  const [bodyText, setBodyText] = useState(JSON.stringify(section.body ?? {}, null, 2));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(bodyText || "{}");
    } catch {
      setError("Body must be valid JSON.");
      setSaving(false);
      return;
    }
    try {
      await adminApi.pages.upsertSection(pageSlug, {
        key: section.key,
        type: section.type,
        title,
        hindi,
        subtitle,
        body,
        order: section.order,
      });
      onSaved();
    } catch (e: any) {
      setError(e.message || "Failed to save section");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminCard className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="font-mono text-xs text-mist">key: {section.key}</p>
          <AdminBadge tone="gold">{section.type}</AdminBadge>
        </div>
        <AdminButton size="sm" onClick={handleSave} loading={saving}>
          <Save className="h-3.5 w-3.5" /> Save Section
        </AdminButton>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <AdminInput label="Title (English)" value={title} onChange={setTitle} />
        <AdminInput label="Title (Hindi)" value={hindi} onChange={setHindi} />
      </div>
      <div className="mt-4">
        <AdminTextarea label="Subtitle" value={subtitle} rows={2} onChange={setSubtitle} />
      </div>
      <div className="mt-4">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-mist">
          Body content (structured JSON — paragraphs, card lists, etc.)
        </span>
        <textarea
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          rows={10}
          className="w-full rounded-lg border border-ink/12 bg-ink/[0.02] px-3.5 py-2.5 font-mono text-xs text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
      </div>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</p>}
    </AdminCard>
  );
}

export default function AdminPagesEditor() {
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<PageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSectionKey, setNewSectionKey] = useState("");

  useEffect(() => {
    adminApi.pages
      .list()
      .then((data) => {
        setPages(data);
        if (data.length > 0) setActiveSlug(data[0].slug);
      })
      .catch((e) => setError(e.message || "Failed to load pages"))
      .finally(() => setLoading(false));
  }, []);

  function loadDetail(slug: string) {
    setDetailLoading(true);
    adminApi.pages
      .get(slug)
      .then(setDetail)
      .catch((e) => setError(e.message || "Failed to load page"))
      .finally(() => setDetailLoading(false));
  }

  useEffect(() => {
    if (activeSlug) loadDetail(activeSlug);
  }, [activeSlug]);

  async function addSection() {
    if (!activeSlug || !newSectionKey.trim()) return;
    try {
      await adminApi.pages.upsertSection(activeSlug, {
        key: newSectionKey.trim(),
        type: "CUSTOM",
        title: "",
        body: {},
        order: (detail?.sections.length ?? 0) + 1,
      });
      setNewSectionKey("");
      loadDetail(activeSlug);
    } catch (e: any) {
      setError(e.message || "Failed to add section");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Pages & Sections</h1>
      <p className="mt-1 text-sm text-mist">
        Edit hero text and content blocks for Home, About, and every About sub-page. Every page on the site
        can have its content sections extended here.
      </p>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-sm text-mist">Loading…</p>}

      {!loading && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="space-y-1">
            {pages.map((p) => (
              <button
                key={p.slug}
                onClick={() => setActiveSlug(p.slug)}
                className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition ${
                  activeSlug === p.slug ? "bg-navy text-white" : "text-ink hover:bg-white"
                }`}
              >
                <span className="truncate">{p.title}</span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
              </button>
            ))}
          </div>

          <div>
            {detailLoading && <p className="text-sm text-mist">Loading page…</p>}
            {!detailLoading && detail && (
              <div className="space-y-4">
                <AdminCard className="p-4">
                  <p className="text-xs text-mist">
                    Page slug: <span className="font-mono">{detail.slug}</span> · {detail.sections.length}{" "}
                    section(s)
                  </p>
                </AdminCard>

                {detail.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <SectionEditor
                      key={section.id}
                      pageSlug={detail.slug}
                      section={section}
                      onSaved={() => loadDetail(detail.slug)}
                    />
                  ))}

                <AdminCard className="flex items-center gap-3 p-4">
                  <input
                    value={newSectionKey}
                    onChange={(e) => setNewSectionKey(e.target.value)}
                    placeholder="new-section-key (e.g. 'pillars', 'timeline')"
                    className="flex-1 rounded-lg border border-ink/12 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                  <AdminButton size="sm" onClick={addSection}>
                    <Plus className="h-3.5 w-3.5" /> Add Section
                  </AdminButton>
                </AdminCard>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
