"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { MatchRing } from "@/components/ui/MatchRing";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { seekerProfile, profileExperience, profileEducation, profileRecommendations, profileViewers } from "@/lib/data";
import {
  BadgeCheck,
  FileText,
  Video,
  GraduationCap,
  Eye,
  EyeOff,
  Download,
  Upload,
  Briefcase,
  Quote,
  TrendingUp,
  Circle,
  Square,
  Trash2,
} from "lucide-react";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 60;

/** Builds a real PDF from the profile data and downloads it. */
async function downloadResume(versionName: string, personal: { name: string; title: string; email: string; phone: string; location: string }) {
  const { downloadResumePdf } = await import("@/lib/resume-pdf");
  const base = versionName.replace(/\.(pdf|docx?|txt)$/i, "").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "_") || "Resume";
  await downloadResumePdf(
    {
      personal,
      summary: "",
      experience: profileExperience.map((e, i) => ({
        id: `e${i}`,
        role: e.role,
        company: e.company,
        from: String(e.from),
        to: String(e.to),
        details: e.desc,
      })),
      education: profileEducation.map((ed, i) => ({ id: `d${i}`, school: ed.school, degree: ed.degree, year: String(ed.year) })),
      skills: seekerProfile.skills.map((sk) => sk.name),
    },
    `${base}.pdf`
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  // Header details come from the logged-in account; the rest of the page still shows demo content.
  const displayName = user?.name?.trim() || seekerProfile.name;
  const displayInitials = displayName.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || seekerProfile.avatarInitials;
  const displayHeadline = user?.designation || user?.profession || seekerProfile.headline;
  const displayLocation = [user?.city, user?.state].filter(Boolean).join(", ") || seekerProfile.location;
  const toast = useToast();
  const [openToWork, setOpenToWork] = useState(seekerProfile.openToWork);
  const [resumes, setResumes] = useState<string[]>(seekerProfile.resumeVersions);
  const fileRef = useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recorderOpen, setRecorderOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  function onResumePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/\.(pdf|docx?)$/i.test(file.name)) return toast("Please upload a PDF or Word file.", "error");
    if (file.size > MAX_RESUME_BYTES) return toast("Resume must be under 5 MB.", "error");
    if (resumes.includes(file.name)) return toast("A resume with this name is already added.", "error");
    setResumes((r) => [...r, file.name]);
    toast(`"${file.name}" added to your resume versions.`);
  }

  return (
    <div>
      <PageHeader title="Your profile" subtitle="This is what recruiters see when they open your profile." />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-500 to-spark-500 text-white grid place-items-center font-display text-2xl font-bold shrink-0">
                {displayInitials}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-ink">{displayName}</h2>
                  <BadgeCheck size={18} className="text-brand-500" />
                </div>
                <p className="text-sm text-muted mt-0.5">{displayHeadline}</p>
                <p className="text-xs text-muted mt-1">{displayLocation}</p>
              </div>
              <button
                onClick={() => setOpenToWork((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold border transition-colors shrink-0 ${
                  openToWork
                    ? "bg-good-100 text-good-500 border-good-500/30"
                    : "bg-background text-muted border-border"
                }`}
              >
                {openToWork ? <Eye size={14} /> : <EyeOff size={14} />}
                {openToWork ? "Open to work · Recruiters only" : "Not signaling availability"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Briefcase size={16} className="text-brand-500" /> Experience
            </h3>
            <div className="flex flex-col">
              {profileExperience.map((e, i) => (
                <div key={e.id} className="flex gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-700 grid place-items-center text-[10px] font-bold">
                      {e.company.slice(0, 2).toUpperCase()}
                    </div>
                    {i < profileExperience.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className={i < profileExperience.length - 1 ? "pb-5" : ""}>
                    <p className="text-sm font-semibold text-ink">{e.role}</p>
                    <p className="text-xs text-muted">{e.company} · {e.location}</p>
                    <p className="text-[11px] text-muted mt-0.5">{e.from} – {e.to}</p>
                    <p className="text-sm text-muted mt-1.5">{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <GraduationCap size={16} className="text-brand-500" /> Education
            </h3>
            <div className="flex flex-col gap-3">
              {profileEducation.map((ed) => (
                <div key={ed.id}>
                  <p className="text-sm font-semibold text-ink">{ed.school}</p>
                  <p className="text-xs text-muted">{ed.degree} · {ed.year}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-display font-semibold mb-4">Skills & endorsements</h3>
            <div className="flex flex-wrap gap-2">
              {seekerProfile.skills.map((s) => (
                <Badge key={s.name} tone={s.verified ? "good" : "neutral"}>
                  {s.verified && <BadgeCheck size={12} />} {s.name}
                </Badge>
              ))}
            </div>
            <Link href="/seeker/assessments" className="inline-block text-sm font-semibold text-brand-600 mt-4">+ Take a skill assessment</Link>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Quote size={16} className="text-brand-500" /> Recommendations
            </h3>
            <div className="flex flex-col gap-4">
              {profileRecommendations.map((r) => (
                <div key={r.id} className="rounded-xl bg-background p-4">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-700 grid place-items-center text-xs font-semibold shrink-0">
                      {r.author.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{r.author}</p>
                      <p className="text-[11px] text-muted">{r.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted italic">&ldquo;{r.text}&rdquo;</p>
                  <p className="text-[11px] text-muted mt-1.5">{r.relation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-display font-semibold mb-4">Resume versions</h3>
            <div className="flex flex-col gap-2">
              {resumes.map((r) => (
                <div key={r} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-background">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={16} className="text-brand-500 shrink-0" />
                    <span className="text-sm text-ink truncate">{r}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => {
                        downloadResume(r, {
                          name: displayName,
                          title: displayHeadline,
                          email: user?.email ?? "",
                          phone: user?.phone ?? "",
                          location: displayLocation,
                        })
                          .then(() => toast(`Downloaded ${r}`, "success"))
                          .catch(() => toast("Couldn't create the PDF. Please try again.", "error"));
                      }}
                      aria-label={`Download ${r}`}
                      className="text-muted hover:text-brand-600"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setResumes((list) => list.filter((x) => x !== r));
                        toast("Resume version removed.");
                      }}
                      disabled={resumes.length === 1}
                      aria-label={`Remove ${r}`}
                      title={resumes.length === 1 ? "Keep at least one resume" : "Remove"}
                      className="text-muted hover:text-bad-500 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={onResumePicked} className="hidden" />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 border border-dashed border-border rounded-xl p-3 text-sm text-muted hover:border-brand-400 hover:text-brand-600"
              >
                <Upload size={15} /> Upload new resume — auto-fills your profile
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Video size={16} className="text-brand-500" /> Video introduction
            </h3>
            {videoUrl ? (
              <video src={videoUrl} controls className="aspect-video w-full rounded-xl bg-ink-900" />
            ) : (
              <div className="aspect-video rounded-xl bg-ink-900 grid place-items-center text-white/60 text-sm">
                No video added yet
              </div>
            )}
            <div className="flex items-center gap-4 mt-3">
              <button onClick={() => setRecorderOpen(true)} className="text-sm font-semibold text-brand-600">
                {videoUrl ? "Record again" : "Record a 60-second intro"}
              </button>
              {videoUrl && (
                <button
                  onClick={() => {
                    setVideoUrl(null);
                    toast("Video removed.");
                  }}
                  className="text-sm font-semibold text-bad-500"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-surface p-6 flex items-center gap-4">
            <MatchRing value={seekerProfile.profileStrength} size={72} label="complete" />
            <div>
              <p className="font-semibold text-ink text-sm">Profile strength</p>
              <p className="text-xs text-muted mt-1">
                Strong profiles get 3.2x more recruiter views on average.
              </p>
            </div>
          </div>

          <Link href="/seeker/profile-views" className="rounded-2xl border border-border bg-surface p-6 hover:border-brand-400 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-semibold flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-500" /> Profile views
              </h3>
              <span className="font-display text-lg font-bold text-ink">{profileViewers.total}</span>
            </div>
            <p className="text-xs text-muted">{profileViewers.last7days} views in the last 7 days — see who&apos;s looking →</p>
          </Link>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-display font-semibold mb-3">Suggested next steps</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-spark-500 mt-1.5" /> Add 2 more project case studies
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-spark-500 mt-1.5" /> Verify your SQL skill
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-spark-500 mt-1.5" /> Record a video introduction
              </li>
            </ul>
          </div>

          <Link href="/seeker/learning" className="rounded-2xl border border-border bg-surface p-6 hover:border-brand-400 transition-colors block">
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <GraduationCap size={16} className="text-brand-500" /> Learning hub
            </h3>
            <p className="text-sm text-muted mb-3">1 course completed this quarter.</p>
            <div className="rounded-xl bg-background p-3">
              <p className="text-sm font-medium text-ink">Advanced Design Systems</p>
              <div className="h-1.5 rounded-full bg-border mt-2 overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: "65%" }} />
              </div>
              <p className="text-[11px] text-muted mt-1">65% complete</p>
            </div>
          </Link>
        </div>
      </div>

      <VideoRecorderModal
        open={recorderOpen}
        onClose={() => setRecorderOpen(false)}
        onSaved={(url) => {
          setVideoUrl(url);
          setRecorderOpen(false);
          toast("Video introduction added to your profile preview.");
        }}
      />
    </div>
  );
}

function VideoRecorderModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (url: string) => void;
}) {
  const toast = useToast();
  const previewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [ready, setReady] = useState(false);

  function stopStream() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
    setRecording(false);
    setSeconds(0);
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        toast("Video recording isn't supported in this browser.", "error");
        onClose();
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (previewRef.current) previewRef.current.srcObject = stream;
        setReady(true);
      } catch {
        toast("Camera/microphone access was blocked. Allow it in your browser and try again.", "error");
        onClose();
      }
    })();
    return () => {
      cancelled = true;
      const rec = recorderRef.current;
      if (rec) {
        rec.onstop = null; // closing the dialog discards an in-progress take
        if (rec.state !== "inactive") rec.stop();
      }
      recorderRef.current = null;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function start() {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const rec = new MediaRecorder(streamRef.current);
    recorderRef.current = rec;
    rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || "video/webm" });
      if (blob.size > 0) onSaved(URL.createObjectURL(blob));
      stopStream();
    };
    rec.start();
    setRecording(true);
    setSeconds(0);
    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 1;
      setSeconds(elapsed);
      if (elapsed >= MAX_VIDEO_SECONDS) stop();
    }, 1000);
  }

  function stop() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
  }

  return (
    <Modal open={open} onClose={onClose} title="Record your intro" maxWidth="max-w-lg">
      <div className="aspect-video rounded-xl bg-ink-900 overflow-hidden relative">
        <video ref={previewRef} autoPlay muted playsInline className="h-full w-full object-cover" />
        {!ready && <p className="absolute inset-0 grid place-items-center text-white/60 text-sm">Starting camera…</p>}
        {recording && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 text-white text-xs px-2.5 py-1">
            <Circle size={8} className="fill-bad-500 text-bad-500" /> {seconds}s / {MAX_VIDEO_SECONDS}s
          </span>
        )}
      </div>
      <div className="flex items-center justify-center gap-3 py-4">
        {!recording ? (
          <button
            onClick={start}
            disabled={!ready}
            className="inline-flex items-center gap-2 rounded-xl bg-bad-500 text-white font-semibold px-5 py-2.5 text-sm disabled:opacity-50"
          >
            <Circle size={14} className="fill-white" /> Start recording
          </button>
        ) : (
          <button
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-xl bg-ink-900 text-white font-semibold px-5 py-2.5 text-sm"
          >
            <Square size={14} className="fill-white" /> Stop &amp; save
          </button>
        )}
      </div>
    </Modal>
  );
}
