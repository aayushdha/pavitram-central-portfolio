"use client";

import { useState, useSyncExternalStore } from "react";
import { employerConversations, candidates } from "@/lib/data";
import { useLocalStorage } from "@/lib/use-local-storage";
import { useToast } from "@/components/ui/Toast";
import { Send, Search } from "lucide-react";

const CONV_KEY = "jobportal_employer_conversations";
const MAX_MESSAGE = 2000;

type Conversation = (typeof employerConversations)[number];

function nowLabel() {
  return `Today ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

export default function EmployerMessagesPage() {
  const toast = useToast();
  const [stored, write] = useLocalStorage<Conversation[]>(CONV_KEY);
  const saved: Conversation[] = stored ?? employerConversations;

  // ?to=<candidateId> (from Talent pool) opens — or starts — a chat with that candidate.
  const toId = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("to") ?? "",
    () => ""
  );
  const target = candidates.find((c) => c.id === toId);
  const existing = target ? saved.find((c) => c.name === target.name) : undefined;
  const virtual: Conversation | null =
    target && !existing
      ? {
          id: `new-${target.id}`,
          name: target.name,
          role: `Applied for ${target.appliedFor}`,
          lastMessage: "",
          time: "",
          unread: 0,
          messages: [],
        }
      : null;
  const conversations = virtual ? [virtual, ...saved] : saved;

  const [pickedId, setPickedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");

  const activeId = pickedId ?? existing?.id ?? virtual?.id ?? conversations[0]?.id;
  const active = conversations.find((c) => c.id === activeId);

  const visible = conversations.filter(
    (c) => !search.trim() || c.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  function open(id: string) {
    setPickedId(id);
    if (saved.some((c) => c.id === id && c.unread > 0)) {
      write(saved.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    }
  }

  function send() {
    const text = draft.trim();
    if (!text || !active) return;
    if (text.length > MAX_MESSAGE) return toast(`Messages can be up to ${MAX_MESSAGE} characters.`, "error");
    const message = { from: "me", text, time: nowLabel() };
    const updated: Conversation = {
      ...active,
      lastMessage: text,
      time: "now",
      messages: [...active.messages, message],
    };
    const isNew = !saved.some((c) => c.id === active.id);
    const next = isNew ? [updated, ...saved] : saved.map((c) => (c.id === active.id ? updated : c));
    // Keep the most recently active chat at the top.
    next.sort((a, b) => (a.id === updated.id ? -1 : b.id === updated.id ? 1 : 0));
    write(next);
    setPickedId(updated.id);
    setDraft("");
  }

  if (!active) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-16 text-center text-sm text-muted">
        No conversations yet.
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] rounded-2xl border border-border bg-surface overflow-hidden grid grid-cols-1 md:grid-cols-[300px_1fr]">
      <div className="border-r border-border flex flex-col min-h-0">
        <div className="p-4 border-b border-border">
          <h1 className="font-display font-bold text-lg text-ink mb-3">Messages</h1>
          <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2">
            <Search size={14} className="text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates"
              className="flex-1 outline-none text-sm bg-transparent"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {visible.map((c) => (
            <button
              key={c.id}
              onClick={() => open(c.id)}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-border transition-colors ${
                c.id === activeId ? "bg-brand-50" : "hover:bg-background"
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-brand-50 text-brand-700 grid place-items-center text-xs font-semibold shrink-0">
                {c.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink truncate">{c.name}</p>
                  <span className="text-[10px] text-muted shrink-0">{c.time}</span>
                </div>
                <p className="text-xs text-muted truncate">{c.role}</p>
                <p className="text-xs text-muted truncate mt-0.5">{c.lastMessage || "No messages yet"}</p>
              </div>
              {c.unread > 0 && (
                <span className="h-5 w-5 rounded-full bg-brand-500 text-ink-900 text-[10px] font-bold grid place-items-center shrink-0">
                  {c.unread}
                </span>
              )}
            </button>
          ))}
          {visible.length === 0 && <p className="p-6 text-center text-sm text-muted">No matching candidates.</p>}
        </div>
      </div>

      <div className="flex flex-col min-h-0">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-brand-50 text-brand-700 grid place-items-center text-xs font-semibold shrink-0">
            {active.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{active.name}</p>
            <p className="text-xs text-muted">{active.role}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin">
          {active.messages.length === 0 && (
            <p className="m-auto text-sm text-muted">Say hello to {active.name.split(" ")[0]} to start the conversation.</p>
          )}
          {active.messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm break-words ${
                  m.from === "me" ? "bg-brand-500 text-ink-900" : "bg-background text-ink"
                }`}
              >
                {m.text}
                <p className={`text-[10px] mt-1 ${m.from === "me" ? "text-ink-900/60" : "text-muted"}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Write a message..."
            className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand-400"
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            aria-label="Send message"
            className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 p-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
