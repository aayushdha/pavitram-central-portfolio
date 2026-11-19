"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, Send, RefreshCw } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import DataTable from "@/components/DataTable";
import Badge from "@/components/Badge";
import { Select } from "@/components/Field";
import { adminNav } from "@/lib/adminNav";
import { useStore } from "@/lib/store";
import api from "@/lib/api";

const orderStatuses = ["Pending", "Accepted", "Ready to Ship", "Shipped", "Delivered", "PO Received", "Partial Fulfillment", "Fully Delivered", "Consolidated Invoice Raised"];
const disputeStages = ["Evidence Review", "Vendor Response Pending", "Admin Arbitration", "Refund Approved", "Closed", "Rejected"];
const returnStatuses = ["Requested", "Approved", "Rejected", "PickupScheduled", "Refunded"];

export default function AdminOrdersPage() {
  const { state, orders, disputes, returns } = useStore();
  const [tab, setTab] = useState("disputes"); // "disputes" | "returns" | "chat"

  // ---- Customer support chat inbox ----
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [reply, setReply] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef(null);

  const loadThreads = useCallback(async () => {
    setChatLoading(true);
    try {
      const list = await api.chat.listThreads();
      setThreads(Array.isArray(list) ? list : []);
    } catch {
      /* leave list as-is on failure */
    } finally {
      setChatLoading(false);
    }
  }, []);

  const openThread = useCallback(async (id) => {
    setActiveThreadId(id);
    try {
      const t = await api.chat.getThread(id);
      setActiveThread(t);
      api.chat.markRead(id, "admin").catch(() => {});
      setThreads((list) => list.map((x) => (x.id === id ? { ...x, unreadForAdmin: 0 } : x)));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (tab !== "chat") return;
    loadThreads();
    const iv = setInterval(loadThreads, 8000);
    return () => clearInterval(iv);
  }, [tab, loadThreads]);

  useEffect(() => {
    if (!activeThreadId || tab !== "chat") return;
    const iv = setInterval(() => openThread(activeThreadId), 6000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThreadId, tab]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages?.length]);

  const sendReply = async (e) => {
    e.preventDefault();
    const body = reply.trim();
    if (!body || !activeThreadId) return;
    setReply("");
    await api.chat.sendMessage(activeThreadId, { sender: "admin", senderName: "Pavitram Support", body });
    openThread(activeThreadId);
    loadThreads();
  };

  const resolveThread = async () => {
    if (!activeThreadId) return;
    await api.chat.setStatus(activeThreadId, "Resolved");
    loadThreads();
    openThread(activeThreadId);
  };

  const totalUnread = threads.reduce((sum, t) => sum + (t.unreadForAdmin || 0), 0);

  const setDisputeStage = (id, stage) =>
    disputes.update(id, { stage }, { message: `Dispute moved to ${stage}`, log: `Updated dispute ${id} to stage ${stage}` });

  const setReturnStatus = (id, status) =>
    returns.update(id, { status }, { message: `Return ${status}`, log: `Updated return ${id} to ${status}` });

  const setOrderStatus = (order, status) =>
    orders.update(order.id, { status }, { message: `${order.id} → ${status}`, log: `Updated order ${order.id} status to ${status}` });

  return (
    <DashboardShell
      title="Disputes & Global Logistics"
      roleLabel="Super Admin"
      accent="var(--color-ink)"
      nav={adminNav}
      activeHref="/admin/orders"
      requireRole="admin"
    >
      <div className="mb-5 flex gap-2 rounded-full border border-line bg-paper-raised p-1 w-fit">
        <button
          onClick={() => setTab("disputes")}
          className="rounded-full px-4 py-1.5 text-xs font-semibold transition"
          style={tab === "disputes" ? { background: "var(--color-ink)", color: "white" } : { color: "var(--color-ink-muted)" }}
        >
          Disputes & Shipments
        </button>
        <button
          onClick={() => setTab("returns")}
          className="rounded-full px-4 py-1.5 text-xs font-semibold transition"
          style={tab === "returns" ? { background: "var(--color-ink)", color: "white" } : { color: "var(--color-ink-muted)" }}
        >
          Returns & Refunds
        </button>
        <button
          onClick={() => setTab("chat")}
          className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition"
          style={tab === "chat" ? { background: "var(--color-ink)", color: "white" } : { color: "var(--color-ink-muted)" }}
        >
          <MessageCircle size={13} /> Customer Chat
          {totalUnread > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px]" style={{ background: "var(--color-rose)", color: "white" }}>
              {totalUnread}
            </span>
          )}
        </button>
      </div>

      {tab === "disputes" && (
        <>
          <h2 className="font-display text-lg font-semibold text-ink">Escalation Matrix</h2>
          <div className="mt-3">
            {state.disputes.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-muted">
                No disputes raised yet.
              </p>
            ) : (
              <DataTable
                columns={[
                  { key: "id", label: "Dispute ID" },
                  { key: "orderId", label: "Order" },
                  { key: "type", label: "Type" },
                  { key: "raisedBy", label: "Raised By" },
                  { key: "against", label: "Against", render: (r) => r.against || "—" },
                  {
                    key: "stage",
                    label: "Stage",
                    render: (r) => (
                      <Select
                        value={r.stage}
                        onChange={(e) => setDisputeStage(r.id, e.target.value)}
                        className="!w-auto py-1.5 text-xs"
                      >
                        {disputeStages.map((s) => <option key={s}>{s}</option>)}
                      </Select>
                    ),
                  },
                ]}
                rows={state.disputes}
              />
            )}
          </div>

          <h2 className="mt-8 font-display text-lg font-semibold text-ink">All Marketplace Shipments</h2>
          <div className="mt-3">
            <DataTable
              columns={[
                { key: "id", label: "Order ID" },
                { key: "type", label: "Channel", render: (r) => <Badge tone={r.type === "B2B" ? "jade" : "gold"}>{r.type}</Badge> },
                { key: "vendor", label: "Vendor" },
                {
                  key: "status",
                  label: "Status",
                  render: (r) => (
                    <Select value={r.status} onChange={(e) => setOrderStatus(r, e.target.value)} className="!w-auto py-1.5 text-xs">
                      {orderStatuses.map((s) => <option key={s}>{s}</option>)}
                    </Select>
                  ),
                },
                { key: "date", label: "Date" },
              ]}
              rows={state.orders}
            />
          </div>
        </>
      )}

      {tab === "returns" && (
        <>
          <h2 className="font-display text-lg font-semibold text-ink">Return / Refund Requests</h2>
          <div className="mt-3">
            {state.returns.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-muted">
                No return requests yet.
              </p>
            ) : (
              <DataTable
                columns={[
                  { key: "id", label: "Return ID" },
                  { key: "orderId", label: "Order" },
                  { key: "reason", label: "Reason" },
                  {
                    key: "status",
                    label: "Status",
                    render: (r) => (
                      <Select
                        value={r.status}
                        onChange={(e) => setReturnStatus(r.id, e.target.value)}
                        className="!w-auto py-1.5 text-xs"
                      >
                        {returnStatuses.map((s) => <option key={s}>{s}</option>)}
                      </Select>
                    ),
                  },
                ]}
                rows={state.returns}
              />
            )}
          </div>
        </>
      )}

      {tab === "chat" && (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="rounded-2xl border border-line bg-paper-raised">
            <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Conversations</span>
              <button onClick={loadThreads} className="text-ink-muted hover:text-ink">
                <RefreshCw size={13} className={chatLoading ? "animate-spin" : ""} />
              </button>
            </div>
            <div className="max-h-[32rem] overflow-y-auto">
              {threads.length === 0 && <p className="p-4 text-xs text-ink-muted">Koi conversation nahi hai abhi.</p>}
              {threads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => openThread(t.id)}
                  className="flex w-full flex-col gap-0.5 border-b border-line px-3 py-2.5 text-left hover:bg-paper"
                  style={activeThreadId === t.id ? { background: "var(--color-gold-dim)" } : {}}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink">{t.userName}</span>
                    {t.unreadForAdmin > 0 && (
                      <span className="grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px]" style={{ background: "var(--color-rose)", color: "white" }}>
                        {t.unreadForAdmin}
                      </span>
                    )}
                  </div>
                  <span className="truncate text-[11px] text-ink-muted">{t.lastMessage || "—"}</span>
                  <Badge tone={t.status === "Resolved" ? "jade" : "gold"}>{t.status}</Badge>
                </button>
              ))}
            </div>
          </div>

          <div className="flex h-[36rem] flex-col rounded-2xl border border-line bg-paper-raised">
            {!activeThread ? (
              <div className="grid flex-1 place-items-center text-sm text-ink-muted">Ek conversation select karein</div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{activeThread.userName}</p>
                    <p className="text-[11px] text-ink-muted">{activeThread.userRole || "customer"}</p>
                  </div>
                  {activeThread.status !== "Resolved" && (
                    <button onClick={resolveThread} className="text-xs font-semibold" style={{ color: "var(--color-jade)" }}>
                      Mark resolved
                    </button>
                  )}
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
                  {activeThread.messages?.map((m) => (
                    <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                      <div
                        className="max-w-[70%] rounded-2xl px-3 py-2 text-xs leading-relaxed"
                        style={
                          m.sender === "admin"
                            ? { background: "var(--color-ink)", color: "white" }
                            : { background: "#eceef2", color: "var(--color-ink)" }
                        }
                      >
                        {m.body}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={sendReply} className="flex items-center gap-2 border-t border-line p-3">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Reply likhein…"
                    className="flex-1 rounded-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
                  />
                  <button
                    type="submit"
                    disabled={!reply.trim()}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full disabled:opacity-50"
                    style={{ background: "var(--color-gold)" }}
                  >
                    <Send size={15} className="text-white" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
