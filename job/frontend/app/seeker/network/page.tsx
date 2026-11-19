"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth-context";
import { useLocalStorage } from "@/lib/use-local-storage";
import { useJoinedGroups, allGroups } from "@/lib/groups";
import { seekerNetwork, seekerProfile } from "@/lib/data";
import { Heart, MessageCircle, Share2, UserPlus, Users2, Clock } from "lucide-react";

const NET_KEY = "jobportal_network_state";
const MAX_POST = 1500;
const MAX_COMMENT = 500;

type OwnPost = { id: string; author: string; role: string; time: string; content: string; likes: number; comments: number };
type NetState = {
  posts: OwnPost[];
  liked: string[];
  pending: string[]; // names of people with a pending connection request
  comments: Record<string, string[]>;
};
const emptyState: NetState = { posts: [], liked: [], pending: [], comments: {} };

let postCounter = 0;
function newPostId() {
  postCounter += 1;
  return `own-${Date.now().toString(36)}-${postCounter}`;
}

export default function NetworkPage() {
  const toast = useToast();
  const { user } = useAuth();
  const { joined } = useJoinedGroups();
  const [stored, write] = useLocalStorage<NetState>(NET_KEY);
  const state: NetState = { ...emptyState, ...stored };
  const save = (patch: Partial<NetState>) => write({ ...state, ...patch });

  const [draft, setDraft] = useState("");
  const [openComments, setOpenComments] = useState<string[]>([]);
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});

  const feed = [...state.posts, ...seekerNetwork.feed];

  function publish() {
    const text = draft.trim();
    if (!text) return toast("Write something to share first.", "error");
    if (text.length > MAX_POST) return toast(`Posts can be up to ${MAX_POST} characters.`, "error");
    const post: OwnPost = {
      id: newPostId(),
      author: user?.name || "You",
      role: seekerProfile.headline,
      time: "now",
      content: text,
      likes: 0,
      comments: 0,
    };
    save({ posts: [post, ...state.posts] });
    setDraft("");
    toast("Your update is posted.");
  }

  function toggleLike(id: string) {
    save({ liked: state.liked.includes(id) ? state.liked.filter((x) => x !== id) : [...state.liked, id] });
  }

  function addComment(id: string) {
    const text = (commentDraft[id] ?? "").trim();
    if (!text) return;
    if (text.length > MAX_COMMENT) return toast(`Comments can be up to ${MAX_COMMENT} characters.`, "error");
    save({ comments: { ...state.comments, [id]: [...(state.comments[id] ?? []), text] } });
    setCommentDraft((d) => ({ ...d, [id]: "" }));
  }

  async function share(id: string) {
    const url = `${window.location.origin}/seeker/network#post-${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "JobConnect post", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast("Post link copied to clipboard.");
    } catch (err) {
      // Closing the native share sheet throws AbortError — that isn't a failure.
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast("Couldn't copy the link in this browser.", "error");
    }
  }

  function toggleConnect(name: string) {
    const isPending = state.pending.includes(name);
    save({ pending: isPending ? state.pending.filter((n) => n !== name) : [...state.pending, name] });
    toast(isPending ? `Request to ${name} withdrawn.` : `Connection request sent to ${name}.`, isPending ? "info" : "success");
  }

  const myGroups = allGroups.filter((g) => joined.includes(g.id));

  return (
    <div>
      <PageHeader
        title="Your network"
        subtitle={`${seekerNetwork.connections} connections · ${seekerNetwork.pendingInvites} pending invites`}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Share an update, article, or achievement..."
              rows={2}
              className="w-full resize-none outline-none text-sm placeholder:text-muted bg-transparent"
            />
            <div className="flex items-center justify-end gap-3">
              {draft.length > MAX_POST * 0.8 && (
                <span className={`text-xs ${draft.length > MAX_POST ? "text-bad-500" : "text-muted"}`}>
                  {draft.length}/{MAX_POST}
                </span>
              )}
              <button
                onClick={publish}
                disabled={!draft.trim()}
                className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 text-sm font-semibold px-4 py-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </div>

          {feed.map((p) => {
            const liked = state.liked.includes(p.id);
            const extraComments = state.comments[p.id] ?? [];
            const commentsOpen = openComments.includes(p.id);
            return (
              <div key={p.id} id={`post-${p.id}`} className="rounded-2xl border border-border bg-surface p-5 scroll-mt-24">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-brand-50 text-brand-700 grid place-items-center font-semibold text-sm">
                    {p.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{p.author}</p>
                    <p className="text-xs text-muted">{p.role} · {p.time}</p>
                  </div>
                </div>
                <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap break-words">{p.content}</p>
                <div className="flex items-center gap-5 mt-4 text-xs text-muted">
                  <button
                    onClick={() => toggleLike(p.id)}
                    aria-pressed={liked}
                    className={`flex items-center gap-1.5 hover:text-bad-500 ${liked ? "text-bad-500 font-semibold" : ""}`}
                  >
                    <Heart size={14} className={liked ? "fill-bad-500" : ""} /> {p.likes + (liked ? 1 : 0)}
                  </button>
                  <button
                    onClick={() => setOpenComments((o) => (o.includes(p.id) ? o.filter((x) => x !== p.id) : [...o, p.id]))}
                    className="flex items-center gap-1.5 hover:text-brand-600"
                  >
                    <MessageCircle size={14} /> {p.comments + extraComments.length}
                  </button>
                  <button onClick={() => share(p.id)} className="flex items-center gap-1.5 hover:text-brand-600">
                    <Share2 size={14} /> Share
                  </button>
                </div>

                {commentsOpen && (
                  <div className="mt-4 pt-4 border-t border-border">
                    {extraComments.length > 0 && (
                      <ul className="flex flex-col gap-2 mb-3">
                        {extraComments.map((c, i) => (
                          <li key={i} className="rounded-xl bg-background px-3 py-2 text-sm text-ink break-words">
                            <span className="font-semibold">{user?.name || "You"}</span> {c}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex gap-2">
                      <input
                        value={commentDraft[p.id] ?? ""}
                        onChange={(e) => setCommentDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addComment(p.id);
                          }
                        }}
                        placeholder="Add a comment…"
                        className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-brand-400"
                      />
                      <button
                        onClick={() => addComment(p.id)}
                        disabled={!(commentDraft[p.id] ?? "").trim()}
                        className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 text-sm font-semibold px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <UserPlus size={16} className="text-brand-500" /> People you may know
            </h3>
            <div className="flex flex-col gap-4">
              {seekerNetwork.suggestions.map((s) => {
                const pending = state.pending.includes(s.name);
                return (
                  <div key={s.name} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-background border border-border grid place-items-center font-semibold text-sm text-muted shrink-0">
                      {s.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">{s.name}</p>
                      <p className="text-xs text-muted truncate">{s.role}</p>
                      <p className="text-[11px] text-muted">{s.mutual} mutual connections</p>
                    </div>
                    <button
                      onClick={() => toggleConnect(s.name)}
                      title={pending ? "Click to withdraw request" : "Send connection request"}
                      className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 shrink-0 inline-flex items-center gap-1 border ${
                        pending ? "text-muted border-border" : "text-brand-600 border-brand-200 hover:bg-brand-50"
                      }`}
                    >
                      {pending ? <><Clock size={11} /> Pending</> : "Connect"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <Users2 size={16} className="text-brand-500" /> Groups
            </h3>
            <ul className="flex flex-col gap-1 text-sm text-ink">
              {myGroups.map((g) => (
                <li key={g.id}>
                  <Link href="/seeker/groups" className="block p-2.5 rounded-lg hover:bg-background">
                    {g.name}
                  </Link>
                </li>
              ))}
              {myGroups.length === 0 && <li className="p-2.5 text-muted">You haven&apos;t joined any groups yet.</li>}
            </ul>
            <Link href="/seeker/groups" className="inline-block text-xs font-semibold text-brand-600 mt-3">
              Discover groups
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
