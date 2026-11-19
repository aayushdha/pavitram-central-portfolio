"use client";

import { GenericCrudPage } from "@/components/admin/generic-crud";
import { adminApi, type ApiFaq } from "@/lib/admin/api";

export default function AdminFaqsPage() {
  return (
    <GenericCrudPage<ApiFaq>
      title="FAQs"
      description="Manage the questions and answers shown on the FAQ page."
      titleField="question"
      subtitleField="answer"
      fields={[
        { key: "question", label: "Question", type: "text", required: true },
        { key: "answer", label: "Answer", type: "textarea", required: true, rows: 4 },
        { key: "category", label: "Category (e.g. About Pavitram, Services)", type: "text" },
        { key: "order", label: "Display Order", type: "number" },
      ]}
      api={adminApi.faqs}
      newItemDefaults={{ question: "", answer: "", category: "General", order: 0, isPublished: true }}
    />
  );
}
