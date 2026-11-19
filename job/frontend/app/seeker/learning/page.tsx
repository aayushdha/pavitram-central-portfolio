"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useLocalStorage } from "@/lib/use-local-storage";
import { courses as initialCourses } from "@/lib/data";
import { Clock, GraduationCap, CheckCircle2, PlayCircle } from "lucide-react";

const COURSES_KEY = "jobportal_courses";

type Course = (typeof initialCourses)[number];
type Progress = Record<string, { enrolled: boolean; progress: number }>;

export default function LearningPage() {
  const toast = useToast();
  const [stored, write] = useLocalStorage<Progress>(COURSES_KEY);
  const [activeId, setActiveId] = useState<string | null>(null);

  const courses: Course[] = initialCourses.map((c) => ({ ...c, ...stored?.[c.id] }));
  const enrolled = courses.filter((c) => c.enrolled);
  const suggested = courses.filter((c) => !c.enrolled);
  const active = courses.find((c) => c.id === activeId) ?? null;

  function setCourse(id: string, patch: { enrolled?: boolean; progress?: number }) {
    const current = courses.find((c) => c.id === id)!;
    write({
      ...(stored ?? {}),
      [id]: { enrolled: patch.enrolled ?? current.enrolled, progress: patch.progress ?? current.progress },
    });
  }

  function enroll(c: Course) {
    setCourse(c.id, { enrolled: true, progress: 5 });
    toast(`Enrolled in "${c.title}".`);
  }

  // One module per course hour; finishing a module moves progress forward.
  function completeModule(c: Course) {
    const step = Math.max(1, Math.round(100 / Math.max(1, c.hours)));
    const next = Math.min(100, c.progress + step);
    setCourse(c.id, { progress: next });
    if (next === 100) {
      toast(`You completed "${c.title}". Nice work!`);
      setActiveId(null);
    } else {
      toast(`Module complete — ${next}% done.`, "info");
    }
  }

  return (
    <div>
      <PageHeader title="Learning" subtitle="Short courses to build skills recruiters look for." />

      {enrolled.length > 0 && (
        <>
          <h2 className="font-display font-semibold text-lg mb-3">Your courses</h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            {enrolled.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-surface p-5">
                <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center mb-3">
                  <GraduationCap size={18} />
                </div>
                <p className="font-semibold text-ink mb-1">{c.title}</p>
                <div className="flex items-center gap-3 text-xs text-muted mb-3">
                  <span className="flex items-center gap-1"><Clock size={12} /> {c.hours} hrs</span>
                  <span>{c.level}</span>
                </div>
                {c.progress === 100 ? (
                  <Badge tone="good"><CheckCircle2 size={11} /> Completed</Badge>
                ) : (
                  <>
                    <div className="h-1.5 rounded-full bg-border overflow-hidden mb-1.5">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${c.progress}%` }} />
                    </div>
                    <p className="text-[11px] text-muted mb-3">{c.progress}% complete</p>
                    <button
                      onClick={() => setActiveId(c.id)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 text-sm font-semibold py-2"
                    >
                      <PlayCircle size={14} /> Continue
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="font-display font-semibold text-lg mb-3">Suggested for you</h2>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {suggested.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center mb-3">
              <GraduationCap size={18} />
            </div>
            <p className="font-semibold text-ink mb-1">{c.title}</p>
            <div className="flex items-center gap-3 text-xs text-muted mb-4">
              <span className="flex items-center gap-1"><Clock size={12} /> {c.hours} hrs</span>
              <span>{c.level}</span>
            </div>
            <button
              onClick={() => enroll(c)}
              className="w-full rounded-xl border border-brand-300 text-brand-700 hover:bg-brand-50 text-sm font-semibold py-2"
            >
              Enroll — Free
            </button>
          </div>
        ))}
        {suggested.length === 0 && (
          <p className="col-span-full text-sm text-muted">You&apos;re enrolled in every available course.</p>
        )}
      </div>

      <Modal
        open={active !== null}
        onClose={() => setActiveId(null)}
        title={active?.title ?? "Course"}
        footer={
          active && (
            <>
              <button onClick={() => setActiveId(null)} className="rounded-xl border border-border text-muted hover:text-ink px-4 py-2 text-sm font-medium">
                Close
              </button>
              <button onClick={() => completeModule(active)} className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold px-4 py-2 text-sm">
                Mark next module complete
              </button>
            </>
          )
        }
      >
        {active && (
          <>
            <p className="text-muted mb-3">
              {active.provider} · {active.level} · {active.hours} hrs
            </p>
            <div className="h-2 rounded-full bg-border overflow-hidden mb-1.5">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${active.progress}%` }} />
            </div>
            <p className="text-xs text-muted">
              {active.progress}% complete · module {Math.min(active.hours, Math.floor((active.progress / 100) * active.hours) + 1)} of {active.hours}
            </p>
            <p className="text-xs text-muted mt-3">
              Lesson videos aren&apos;t connected yet, so progress here is tracked manually.
            </p>
          </>
        )}
      </Modal>
    </div>
  );
}
