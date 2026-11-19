"use client";

import { useEffect, useMemo, useState } from "react";
import { Send, ShieldCheck } from "lucide-react";
import { LoadingRow, ErrorRow } from "@/components/ui/DataState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApiData } from "@/lib/hooks/useApiData";
import { messagesApi } from "@/lib/api/messages";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ChatMessage } from "@/lib/api/domain-types";

function initialsOf(name: string | null | undefined, fallback = "?"): string {
  if (!name) return fallback;
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function MessagesInbox() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useApiData(() => messagesApi.conversations());
  const conversations = useMemo(() => data?.conversations ?? [], [data]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [thread, setThread] = useState<ChatMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- selecting a default conversation once the list loads, not a synchronous render-time update
    if (!activeId && conversations.length) setActiveId(conversations[0].id);
  }, [conversations, activeId]);

  useEffect(() => {
    if (!activeId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off an async fetch for the newly-selected thread
    setThreadLoading(true);
    messagesApi
      .thread(activeId)
      .then((res) => setThread(res.messages))
      .catch(() => setThread([]))
      .finally(() => setThreadLoading(false));
  }, [activeId]);

  const active = useMemo(() => conversations.find((c) => c.id === activeId), [conversations, activeId]);
  const otherParty = active
    ? active.participantAId === user?.id
      ? active.participantB
      : active.participantA
    : null;

  async function handleSend() {
    if (!draft.trim() || !otherParty) return;
    setSending(true);
    try {
      const res = await messagesApi.send({
        toUserId: otherParty.id,
        propertyId: active?.propertyId ?? undefined,
        body: draft.trim(),
      });
      setThread((prev) => [...prev, res.chatMessage]);
      setDraft("");
      reload();
    } catch {
      alert("Could not send that message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <LoadingRow label="Loading conversations…" />;
  if (error) return <ErrorRow message={error} onRetry={reload} />;
  if (conversations.length === 0) {
    return (
      <EmptyState
        title="No conversations yet"
        description="When you message someone about a listing, or they message you, it'll show up here."
      />
    );
  }

  return (
    <div className="grid overflow-hidden rounded-2xl border border-stone-200 bg-white lg:grid-cols-[280px_1fr]">
      <div className="max-h-[32rem] overflow-y-auto border-b border-stone-200 lg:border-b-0 lg:border-r">
        {conversations.map((c) => {
          const other = c.participantAId === user?.id ? c.participantB : c.participantA;
          return (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`flex w-full items-start gap-3 border-b border-stone-100 p-4 text-left last:border-0 ${
                activeId === c.id ? "bg-brand-50/60" : "hover:bg-stone-50"
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white">
                {initialsOf(other?.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-900">{other?.name ?? "Pavitram user"}</p>
                <p className="mt-0.5 truncate text-xs text-text-500">
                  {new Date(c.lastMessageAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-stone-200 p-4">
          <div>
            <p className="text-sm font-semibold text-ink-900">{otherParty?.name ?? "Pavitram user"}</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-[11px] text-text-500">
            <ShieldCheck size={12} className="text-brand-600" />
            Call masked
          </span>
        </div>

        <div className="flex-1 space-y-3 p-4" style={{ minHeight: "20rem" }}>
          {threadLoading ? (
            <LoadingRow label="Loading messages…" />
          ) : thread.length === 0 ? (
            <p className="py-10 text-center text-sm text-text-400">No messages in this conversation yet.</p>
          ) : (
            thread.map((m) => (
              <div key={m.id} className={`flex ${m.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${
                    m.senderId === user?.id ? "bg-ink-900 text-white" : "bg-stone-100 text-text-700"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-stone-200 p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message…"
            className="flex-1 rounded-full border border-stone-200 px-4 py-2 text-sm outline-none placeholder:text-text-400"
          />
          <button
            onClick={handleSend}
            disabled={sending || !draft.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
