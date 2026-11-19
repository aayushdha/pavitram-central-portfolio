"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useLocalStorage } from "@/lib/use-local-storage";
import { assessments, sampleQuiz } from "@/lib/data";
import { Clock, ListChecks, Award, CheckCircle2, ArrowRight, X } from "lucide-react";

export default function AssessmentsPage() {
  const toast = useToast();
  const [taking, setTaking] = useState<{ id: string; title: string } | null>(null);
  const [results, writeResults] = useLocalStorage<Record<string, number>>("jobportal_assessment_scores");
  const PASS_MARK = 60;

  // A passing score saved from this browser marks the test completed.
  const list = assessments.map((a) => {
    const score = results?.[a.id];
    return score !== undefined && score >= PASS_MARK ? { ...a, status: "completed" as const, score } : a;
  });

  function finish(id: string, title: string, score: number) {
    const best = Math.max(score, results?.[id] ?? 0);
    writeResults({ ...(results ?? {}), [id]: best });
    toast(
      score >= PASS_MARK ? `You passed "${title}" with ${score}%. Badge added.` : `You scored ${score}% on "${title}" — you need ${PASS_MARK}% to pass.`,
      score >= PASS_MARK ? "success" : "info"
    );
  }

  return (
    <div>
      <PageHeader title="Skill assessments" subtitle="Take a short test and get a verified badge on your profile." />

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {list.map((a) => (
          <div key={a.id} className="rounded-2xl border border-border bg-surface p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center">
                <Award size={18} />
              </div>
              {a.status === "completed" && <Badge tone="good"><CheckCircle2 size={11} /> Passed · {a.score}%</Badge>}
              {a.status === "in_progress" && <Badge tone="warn">In progress</Badge>}
            </div>
            <p className="font-semibold text-ink mb-1">{a.title}</p>
            <div className="flex items-center gap-3 text-xs text-muted mb-4">
              <span className="flex items-center gap-1"><ListChecks size={12} /> {a.questions} questions</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {a.minutes} min</span>
              <span>{a.level}</span>
            </div>
            {a.status === "in_progress" && (
              <div className="h-1.5 rounded-full bg-border overflow-hidden mb-4">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${a.progress}%` }} />
              </div>
            )}
            <button
              onClick={() => a.status !== "completed" && setTaking(a)}
              disabled={a.status === "completed"}
              className="mt-auto rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-ink-900 font-semibold py-2 text-sm"
            >
              {a.status === "completed" ? "Completed" : a.status === "in_progress" ? "Resume test" : "Start test"}
            </button>
          </div>
        ))}
      </div>

      {taking && (
        <QuizModal
          title={taking.title}
          onClose={() => setTaking(null)}
          onFinish={(score) => finish(taking.id, taking.title, score)}
        />
      )}
    </div>
  );
}

function QuizModal({ title, onClose, onFinish }: { title: string; onClose: () => void; onFinish: (score: number) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const q = sampleQuiz[step];

  function choose(idx: number) {
    const next = [...answers, idx];
    setAnswers(next);
    if (step + 1 < sampleQuiz.length) {
      setStep(step + 1);
    } else {
      setDone(true);
      const finalScore = Math.round((next.filter((a, i) => a === sampleQuiz[i].answer).length / sampleQuiz.length) * 100);
      onFinish(finalScore);
    }
  }

  const score = done
    ? Math.round((answers.filter((a, i) => a === sampleQuiz[i].answer).length / sampleQuiz.length) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={20} /></button>
        </div>

        {!done ? (
          <>
            <div className="h-1.5 rounded-full bg-border overflow-hidden mb-5">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(step / sampleQuiz.length) * 100}%` }} />
            </div>
            <p className="text-xs text-muted mb-2">Question {step + 1} of {sampleQuiz.length}</p>
            <p className="font-medium text-ink mb-4">{q.prompt}</p>
            <div className="flex flex-col gap-2">
              {q.options.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => choose(i)}
                  className="text-left rounded-xl border border-border px-4 py-3 text-sm text-ink hover:border-brand-400 hover:bg-brand-50"
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="h-16 w-16 rounded-full bg-good-100 text-good-500 grid place-items-center mx-auto mb-4">
              <Award size={28} />
            </div>
            <p className="font-display text-2xl font-bold text-ink mb-1">{score}%</p>
            <p className="text-sm text-muted mb-6">
              {score >= 60 ? "Nice work — this badge is now on your profile." : "Good try — you can retake this test in 7 days."}
            </p>
            <button onClick={onClose} className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold px-6 py-2.5 text-sm inline-flex items-center gap-2">
              Done <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
