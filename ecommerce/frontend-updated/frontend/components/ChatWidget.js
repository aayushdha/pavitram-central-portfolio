"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send } from "lucide-react";
import { useStore } from "@/lib/store";
import api from "@/lib/api";

// Site-wide "chat with support" bubble for customers. Admin/vendor/b2b
// portals have their own dashboards, so this widget only renders on the
// customer-facing storefront routes (see HIDDEN_PREFIXES below).
const HIDDEN_PREFIXES = ["/admin", "/vendor", "/b2b", "/business", "/login", "/register"];

const POLL_MS = 6000;

export default function ChatWidget() {
  const pathname = usePathname();
  const { auth } = useStore();
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const hidden = HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p));

  const refreshThread = useCallback(async (id) => {
    try {
      const t = await api.chat.getThread(id);
      setThread(t);
    } catch {
      /* silent — next poll will retry */
    }
  }, []);

  const openWidget = async () => {
    setOpen(true);
    if (thread) {
      refreshThread(thread.id);
      return;
    }
    setLoading(true);
    try {
      const t = await api.chat.startThread({
        userId: auth?.id,
        userName: auth?.name || "Guest",
        userRole: auth?.role === "vendor" ? "vendor" : auth?.role === "b2b" ? "b2b" : "customer",
      });
      setThread(t);
      api.chat.markRead(t.id, "customer").catch(() => {});
    } catch {
      /* leave thread null — send() will retry starting a thread */
    } finally {
      setLoading(false);
    }
  };

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText("");
    try {
      let t = thread;
      if (!t) {
        t = await api.chat.startThread({
          userId: auth?.id,
          userName: auth?.name || "Guest",
          userRole: auth?.role === "vendor" ? "vendor" : auth?.role === "b2b" ? "b2b" : "customer",
        });
        setThread(t);
      }
      await api.chat.sendMessage(t.id, { sender: "customer", senderName: auth?.name || "Guest", body });
      await refreshThread(t.id);
    } finally {
      setSending(false);
    }
  };

  // Poll for admin replies while the panel is open.
  useEffect(() => {
    if (!open || !thread?.id) return;
    pollRef.current = setInterval(() => refreshThread(thread.id), POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [open, thread?.id, refreshThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages?.length]);

  if (hidden) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3" style={{ background: "var(--color-ink)" }}>
            <div>
              <p className="text-sm font-semibold text-white">Pavitram Support</p>
              <p className="text-[11px] text-white/70">Usually replies within a few hours</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white" aria-label="Close chat">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {loading && <p className="text-center text-xs text-ink-muted">Connecting…</p>}
            {!loading && (!thread?.messages || thread.messages.length === 0) && (
              <p className="mt-6 text-center text-xs text-ink-muted">
                Koi bhi sawaal ho — order, delivery, KYC, kuch bhi — yahan likhiye, hamari team reply karegi.
              </p>
            )}
            {thread?.messages?.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "customer" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed"
                  style={
                    m.sender === "customer"
                      ? { background: "var(--color-gold-dim)", color: "var(--color-ink)" }
                      : { background: "#eceef2", color: "var(--color-ink)" }
                  }
                >
                  {m.body}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message…"
              className="flex-1 rounded-full border border-line bg-paper px-3 py-2 text-xs outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full disabled:opacity-50"
              style={{ background: "var(--color-gold)" }}
              aria-label="Send"
            >
              <Send size={14} className="text-white" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => (open ? setOpen(false) : openWidget())}
        className="grid h-14 w-14 place-items-center rounded-full shadow-lg transition hover:scale-105"
        style={{ background: "var(--color-ink)" }}
        aria-label="Chat with support"
      >
        {open ? <X size={20} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </button>
    </div>
  );
}
