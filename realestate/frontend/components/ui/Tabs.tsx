"use client";

import { useState, ReactNode } from "react";

export function Tabs({
  tabs,
  defaultTab,
}: {
  tabs: { label: string; count?: number; content: ReactNode }[];
  defaultTab?: number;
}) {
  const [active, setActive] = useState(defaultTab ?? 0);
  return (
    <div>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-stone-200">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`relative flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              active === i
                ? "text-ink-900"
                : "text-text-400 hover:text-text-700"
            }`}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  active === i
                    ? "bg-brass-100 text-brass-700"
                    : "bg-stone-100 text-text-400"
                }`}
              >
                {tab.count}
              </span>
            )}
            {active === i && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brass-500" />
            )}
          </button>
        ))}
      </div>
      {tabs[active].content}
    </div>
  );
}
