"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="mx-auto mt-8 max-w-3xl divide-y divide-line rounded-2xl border border-line bg-paper-raised">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-display text-[15px] font-semibold text-ink">{item.q}</span>
              <ChevronDown
                size={18}
                className="shrink-0 transition-transform"
                style={{
                  color: "var(--color-gold)",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-4">
                <p className="text-sm leading-relaxed text-ink-muted">{item.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
