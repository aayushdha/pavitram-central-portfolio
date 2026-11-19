"use client";

import { useState, type ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { notifications as initialNotifications } from "@/lib/data";
import {
  Sparkles,
  ClipboardCheck,
  MessageCircle,
  Eye,
  CalendarClock,
  UserPlus,
  Mail,
  Check,
} from "lucide-react";

const iconFor: Record<string, ReactNode> = {
  match: <Sparkles size={16} className="text-brand-600" />,
  status: <ClipboardCheck size={16} className="text-good-500" />,
  message: <MessageCircle size={16} className="text-brand-600" />,
  view: <Eye size={16} className="text-muted" />,
  interview: <CalendarClock size={16} className="text-warn-500" />,
  connection: <UserPlus size={16} className="text-brand-600" />,
  digest: <Mail size={16} className="text-muted" />,
};

export default function NotificationsPage() {
  const [items, setItems] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const shown = filter === "unread" ? items.filter((n) => !n.read) : items;
  const unreadCount = items.filter((n) => !n.read).length;

  function markAllRead() {
    setItems((its) => its.map((n) => ({ ...n, read: true })));
  }
  function markRead(id: string) {
    setItems((its) => its.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
        actions={
          <button onClick={markAllRead} className="text-sm font-semibold text-brand-600 flex items-center gap-1">
            <Check size={14} /> Mark all as read
          </button>
        }
      />

      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setFilter("all")}
          className={`text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
            filter === "all" ? "bg-ink-900 text-white border-ink-900" : "border-border text-muted"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
            filter === "unread" ? "bg-ink-900 text-white border-ink-900" : "border-border text-muted"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="flex flex-col divide-y divide-border">
          {shown.map((n) => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`w-full text-left flex items-start gap-3 px-5 py-4 hover:bg-background/60 transition-colors ${
                !n.read ? "bg-brand-50/40" : ""
              }`}
            >
              <div className="h-9 w-9 rounded-lg bg-background grid place-items-center shrink-0">
                {iconFor[n.type]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink">{n.title}</p>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />}
                </div>
                <p className="text-sm text-muted mt-0.5">{n.body}</p>
                <p className="text-[11px] text-muted mt-1">{n.time}</p>
              </div>
            </button>
          ))}
          {shown.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-muted">Nothing here.</div>
          )}
        </div>
      </div>
    </div>
  );
}
