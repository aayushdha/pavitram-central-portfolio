"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal, ConfirmModal, inputCls } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth-context";
import { useLocalStorage } from "@/lib/use-local-storage";
import { allGroups, useJoinedGroups } from "@/lib/groups";
import { Users2, MessageSquare, Check, Send } from "lucide-react";

const POSTS_KEY = "jobportal_group_posts";
const MAX_POST = 1000;

type GroupPost = { id: string; author: string; text: string; time: string };
type PostsByGroup = Record<string, GroupPost[]>;

export default function GroupsPage() {
  const toast = useToast();
  const { isJoined, toggle } = useJoinedGroups();
  const [openId, setOpenId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<(typeof allGroups)[number] | null>(null);
  const openGroup = allGroups.find((g) => g.id === openId) ?? null;

  function onJoinClick(g: (typeof allGroups)[number]) {
    if (isJoined(g.id)) return setLeaving(g);
    toggle(g.id);
    toast(`You joined ${g.name}.`);
  }

  return (
    <div>
      <PageHeader title="Groups" subtitle="Join groups to talk shop and hear about jobs first." />

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {allGroups.map((g) => {
          const joined = isJoined(g.id);
          return (
            <div key={g.id} className="rounded-2xl border border-border bg-surface p-5 flex flex-col">
              <div className="h-11 w-11 rounded-xl bg-brand-50 text-brand-600 grid place-items-center mb-3">
                <Users2 size={18} />
              </div>
              <p className="font-semibold text-ink mb-1">{g.name}</p>
              <p className="text-sm text-muted mb-3 flex-1">{g.desc}</p>
              <p className="text-xs text-muted mb-4">
                {(g.members + (joined && !g.joined ? 1 : 0) - (!joined && g.joined ? 1 : 0)).toLocaleString("en-IN")} members
              </p>
              <button
                onClick={() => onJoinClick(g)}
                className={`rounded-xl py-2 text-sm font-semibold inline-flex items-center justify-center gap-1.5 ${
                  joined ? "bg-good-100 text-good-500" : "bg-brand-500 hover:bg-brand-600 text-ink-900"
                }`}
              >
                {joined ? <><Check size={14} /> Joined</> : "Join group"}
              </button>
              {joined && (
                <button
                  onClick={() => setOpenId(g.id)}
                  className="mt-2 text-xs font-semibold text-brand-600 inline-flex items-center justify-center gap-1"
                >
                  <MessageSquare size={12} /> Open discussion
                </button>
              )}
            </div>
          );
        })}
      </div>

      {openGroup && <DiscussionModal key={openGroup.id} group={openGroup} onClose={() => setOpenId(null)} />}

      <ConfirmModal
        open={leaving !== null}
        onClose={() => setLeaving(null)}
        onConfirm={() => {
          if (leaving) {
            toggle(leaving.id);
            toast(`You left ${leaving.name}.`, "info");
          }
          setLeaving(null);
        }}
        title="Leave this group?"
        message={`You'll stop seeing ${leaving?.name ?? "this group"} discussions. You can rejoin any time.`}
        confirmLabel="Leave group"
        danger
      />
    </div>
  );
}

function DiscussionModal({ group, onClose }: { group: (typeof allGroups)[number]; onClose: () => void }) {
  const toast = useToast();
  const { user } = useAuth();
  const [stored, write] = useLocalStorage<PostsByGroup>(POSTS_KEY);
  const posts = stored?.[group.id] ?? [];
  const [text, setText] = useState("");

  function submit() {
    const body = text.trim();
    if (!body) return;
    if (body.length > MAX_POST) return toast(`Posts can be up to ${MAX_POST} characters.`, "error");
    const post: GroupPost = {
      id: `${Date.now()}`,
      author: user?.name || "You",
      text: body,
      time: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit" }),
    };
    write({ ...(stored ?? {}), [group.id]: [post, ...posts] });
    setText("");
  }

  return (
    <Modal open onClose={onClose} title={group.name} maxWidth="max-w-lg">
      <div className="flex gap-2 mb-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Start a discussion…"
          className={inputCls}
        />
        <button
          onClick={submit}
          disabled={!text.trim()}
          aria-label="Post"
          className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 px-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={15} />
        </button>
      </div>
      <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pb-2">
        {posts.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No posts yet — be the first to start the conversation.</p>
        )}
        {posts.map((p) => (
          <div key={p.id} className="rounded-xl bg-background p-3">
            <p className="text-xs font-semibold text-ink">
              {p.author} <span className="font-normal text-muted">· {p.time}</span>
            </p>
            <p className="text-sm text-ink mt-1 break-words">{p.text}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
