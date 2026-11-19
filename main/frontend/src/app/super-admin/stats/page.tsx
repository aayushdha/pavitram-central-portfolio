"use client";

import { GenericCrudPage } from "@/components/admin/generic-crud";
import { adminApi, type ApiStat } from "@/lib/admin/api";

export default function AdminStatsPage() {
  return (
    <GenericCrudPage<ApiStat>
      title="Impact Stats"
      description="The animated counters on the homepage (e.g. 10,000+ Community Members). Use a plain number or add a suffix like '+' directly in the value, e.g. '10000+' or '15+'."
      titleField="label"
      subtitleField="value"
      fields={[
        { key: "label", label: "Label (e.g. Community Members)", type: "text", required: true },
        { key: "value", label: "Value (e.g. 10000+ or 15+ or 12)", type: "text", required: true },
        { key: "icon", label: "Icon name (Lucide, e.g. UsersRound, Globe, Cpu, BookOpen)", type: "text" },
        { key: "order", label: "Display Order", type: "number" },
      ]}
      api={adminApi.stats}
      newItemDefaults={{ label: "", value: "", icon: "Sparkles", order: 0, isPublished: true }}
    />
  );
}
