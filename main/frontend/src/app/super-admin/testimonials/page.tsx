"use client";

import { GenericCrudPage } from "@/components/admin/generic-crud";
import { adminApi, type ApiTestimonial } from "@/lib/admin/api";

export default function AdminTestimonialsPage() {
  return (
    <GenericCrudPage<ApiTestimonial>
      title="Testimonials"
      description="Member quotes shown in the 'What Our Members Say' section on the homepage."
      titleField="name"
      subtitleField="quote"
      fields={[
        { key: "name", label: "Member Name", type: "text", required: true },
        { key: "role", label: "Role / Location (e.g. Business Associate · Indore)", type: "text" },
        { key: "quote", label: "Quote", type: "textarea", required: true, rows: 4 },
        { key: "avatarUrl", label: "Avatar Image URL (optional)", type: "text" },
        { key: "rating", label: "Rating (1-5)", type: "number" },
        { key: "order", label: "Display Order", type: "number" },
      ]}
      api={adminApi.testimonials}
      newItemDefaults={{ name: "", role: "", quote: "", rating: 5, order: 0, isPublished: true }}
    />
  );
}
