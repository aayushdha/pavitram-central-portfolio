"use client";

import { GenericCrudPage } from "@/components/admin/generic-crud";
import { adminApi, type ApiTeamMember } from "@/lib/admin/api";

export default function AdminTeamPage() {
  return (
    <GenericCrudPage<ApiTeamMember>
      title="Team & Network"
      description="Leadership and network profiles shown on About > Network."
      titleField="name"
      subtitleField="role"
      fields={[
        { key: "name", label: "Name", type: "text", required: true },
        { key: "role", label: "Role / Title", type: "text" },
        { key: "bio", label: "Bio", type: "textarea", rows: 4 },
        { key: "avatarUrl", label: "Photo URL (optional)", type: "text" },
        { key: "order", label: "Display Order", type: "number" },
      ]}
      api={adminApi.team}
      newItemDefaults={{ name: "", role: "", bio: "", order: 0, isPublished: true }}
    />
  );
}
