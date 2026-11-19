"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Contact, Building2, Settings, IndianRupee } from "lucide-react";
import { sampleNotifications, NotificationItem } from "@/lib/mock-data";

const iconByType: Record<NotificationItem["type"], typeof Contact> = {
  lead: Contact,
  listing: Building2,
  system: Settings,
  payment: IndianRupee,
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(sampleNotifications);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-text-600 hover:text-ink-900"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger-600" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-20 w-80 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl shadow-ink-900/10 sm:w-96">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
            <p className="text-sm font-semibold text-ink-900">Notifications</p>
            {unread > 0 && (
              <button
                onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
                className="text-xs font-medium text-brass-700 hover:text-brass-600"
              >
                Mark all as read
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {items.map((n) => {
              const Icon = iconByType[n.type];
              return (
                <li
                  key={n.id}
                  onClick={() => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                  className={`flex cursor-pointer gap-3 border-b border-stone-50 px-4 py-3 last:border-0 hover:bg-stone-50 ${
                    !n.read ? "bg-brass-50/40" : ""
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-brass-300">
                    <Icon size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-900">{n.title}</p>
                    <p className="mt-0.5 truncate text-xs text-text-500">{n.body}</p>
                    <p className="mt-1 text-[11px] text-text-400">{n.time}</p>
                  </div>
                  {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
