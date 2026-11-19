"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { interviewPrepTopics } from "@/lib/data";
import { ChevronDown, Lightbulb, MessageSquareText } from "lucide-react";

export default function InterviewPrepPage() {
  const [openTopic, setOpenTopic] = useState(interviewPrepTopics[0].id);
  const [openQ, setOpenQ] = useState<string | null>(null);

  return (
    <div>
      <PageHeader title="Interview preparation" subtitle="Common questions, with tips on how to answer them well." />

      <div className="flex flex-col gap-4">
        {interviewPrepTopics.map((topic) => (
          <div key={topic.id} className="rounded-2xl border border-border bg-surface overflow-hidden">
            <button
              onClick={() => setOpenTopic(openTopic === topic.id ? "" : topic.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-display font-semibold text-ink flex items-center gap-2">
                <MessageSquareText size={17} className="text-brand-600" /> {topic.title}
              </span>
              <ChevronDown size={18} className={`text-muted transition-transform ${openTopic === topic.id ? "rotate-180" : ""}`} />
            </button>
            {openTopic === topic.id && (
              <div className="px-5 pb-5 flex flex-col gap-2">
                {topic.questions.map((q, i) => {
                  const key = `${topic.id}-${i}`;
                  return (
                    <div key={key} className="rounded-xl bg-background p-4">
                      <button onClick={() => setOpenQ(openQ === key ? null : key)} className="w-full text-left flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-ink">{q.q}</span>
                        <ChevronDown size={15} className={`text-muted shrink-0 transition-transform ${openQ === key ? "rotate-180" : ""}`} />
                      </button>
                      {openQ === key && (
                        <p className="text-sm text-muted mt-2.5 flex items-start gap-2">
                          <Lightbulb size={14} className="text-warn-500 mt-0.5 shrink-0" /> {q.tip}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
