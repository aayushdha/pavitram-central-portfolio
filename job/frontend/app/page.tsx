import Link from "next/link";
import { MarketingNav } from "@/components/marketing/Nav";
import { MarketingFooter } from "@/components/marketing/Footer";
import { MatchRing } from "@/components/ui/MatchRing";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  Users2,
  ShieldCheck,
  Sparkles,
  Briefcase,
  BarChart3,
  MessageSquare,
  Video,
  Award,
  Building2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const diffRows = [
  { dim: "Main job", seeker: "Search jobs, apply, connect, build a profile", employer: "Post jobs, search resumes, screen and hire" },
  { dim: "Finding people", seeker: "Job alerts, smart picks, saved searches", employer: "Matched candidates, resume search" },
  { dim: "Talking", seeker: "Apply, chat with recruiters, get interview calls", employer: "Message many people, set up interviews" },
  { dim: "Success looks like", seeker: "More interviews, more offers", employer: "Faster hires, better hires, lower cost" },
];

const seekerFeatures = [
  { icon: <Search size={18} />, title: "Easy job search", desc: "Search by title, skill, or company. Even small typing mistakes still find the right jobs.", href: "/seeker/jobs" },
  { icon: <Sparkles size={18} />, title: "Smart job matches", desc: "Every job shows a match score based on your skills and past activity.", href: "/seeker/dashboard" },
  { icon: <Users2 size={18} />, title: "Build your network", desc: "Connect with people, share updates, join groups, and find old classmates.", href: "/seeker/network" },
  { icon: <Video size={18} />, title: "Video profile", desc: "Add a short video so recruiters can see you before they call.", href: "/seeker/profile" },
];

const employerFeatures = [
  { icon: <Briefcase size={18} />, title: "Easy job posting", desc: "Upload many jobs at once, save templates, and copy old posts in one click.", href: "/employer/jobs" },
  { icon: <Users2 size={18} />, title: "Full hiring pipeline", desc: "Move candidates from Applied to Hired with simple drag and drop.", href: "/employer/candidates" },
  { icon: <Search size={18} />, title: "Search resumes", desc: "Search the full candidate list by skill, experience, and location.", href: "/employer/candidates" },
  { icon: <BarChart3 size={18} />, title: "Hiring reports", desc: "See how fast you hire, what it costs, and where good hires come from.", href: "/employer/analytics" },
];

const platformFeatures = [
  { icon: <ShieldCheck size={16} />, label: "Fake job detection" },
  { icon: <Video size={16} />, label: "Video interviews, built in" },
  { icon: <Award size={16} />, label: "Skill tests with verified badges" },
  { icon: <MessageSquare size={16} />, label: "Help chatbot, day or night" },
  { icon: <Building2 size={16} />, label: "Company reviews & ratings" },
  { icon: <BarChart3 size={16} />, label: "Salary comparison tool" },
];

export default function LandingPage() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section className="bg-ink-900 text-white">
        <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/40 bg-brand-500/10 text-brand-400 px-3 py-1 text-xs font-semibold mb-5">
            <Sparkles size={12} /> Smart matching, made for India
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-[1.08] tracking-tight">
            Find jobs. Grow your network.
            <span className="text-brand-400"> Hire faster.</span>
          </h1>
          <p className="text-white/60 text-lg mt-5 max-w-lg">
            JobConnect brings job search, networking, and hiring together in one place — one login for job seekers and employers.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/seeker/dashboard" className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold px-5 py-3 text-sm inline-flex items-center gap-2">
              Find a job <ArrowRight size={16} />
            </Link>
            <Link href="/employer/dashboard" className="rounded-xl border border-brand-500/50 bg-white/5 hover:bg-white/10 text-white font-semibold px-5 py-3 text-sm inline-flex items-center gap-2">
              Hire on JobConnect
            </Link>
          </div>
          <div className="flex items-center gap-6 mt-8 text-sm text-white/50">
            <span><strong className="text-white font-display">4.8L+</strong> job seekers</span>
            <span><strong className="text-white font-display">12.8K</strong> employers</span>
            <span><strong className="text-white font-display">61.8%</strong> match rate</span>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-semibold text-muted uppercase tracking-wide">Live match</span>
              <Badge tone="good"><CheckCircle2 size={12} /> Open to work</Badge>
            </div>
            <div className="flex items-center gap-4">
              <MatchRing value={94} size={72} label="match" />
              <div>
                <p className="font-display font-bold text-ink">Senior Product Designer</p>
                <p className="text-sm text-muted">Anthropi Finserve · Bengaluru</p>
                <div className="flex gap-1.5 mt-2">
                  <Badge tone="neutral">Figma</Badge>
                  <Badge tone="neutral">Design Systems</Badge>
                </div>
              </div>
            </div>
            <div className="h-px bg-border my-5" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Ananya Kulkarni</span>
              <span className="font-semibold text-ink">₹28L – ₹38L</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted">
              <div className="h-6 w-6 rounded-full bg-brand-50 text-brand-700 grid place-items-center font-semibold">AK</div>
              Matched 6 hours ago
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 rounded-2xl border border-border bg-surface p-4 shadow-lg hidden sm:block">
            <p className="text-xs text-muted">Time to hire</p>
            <p className="font-display text-xl font-bold text-good-500">22 days ↓</p>
          </div>
        </div>
        </div>
      </section>

      {/* Two ecosystems */}
      <section id="platform" className="max-w-[1200px] mx-auto px-6 py-16">
        <span className="block text-center text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">One platform, two sides</span>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink text-center mb-2">Built for job seekers and employers</h2>
        <p className="text-muted text-center max-w-xl mx-auto mb-10">
          Everyone signs in one way. Job seekers and employers share the same smart-matching engine behind the scenes.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left border-b border-border bg-background/60">
                <th className="px-5 py-3 font-semibold text-ink w-1/5">What</th>
                <th className="px-5 py-3 font-semibold text-brand-600 w-2/5">Job Seeker</th>
                <th className="px-5 py-3 font-semibold text-spark-600 w-2/5">Employer / Recruiter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {diffRows.map((r) => (
                <tr key={r.dim}>
                  <td className="px-5 py-4 font-medium text-ink align-top">{r.dim}</td>
                  <td className="px-5 py-4 text-muted align-top">{r.seeker}</td>
                  <td className="px-5 py-4 text-muted align-top">{r.employer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Seeker features */}
      <section id="seekers" className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">For job seekers</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">Your career, one profile</h2>
          </div>
          <Link href="/seeker/dashboard" className="text-sm font-semibold text-brand-600 flex items-center gap-1">
            Open job seeker dashboard <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {seekerFeatures.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="rounded-2xl border border-border bg-surface p-5 hover:border-brand-400 hover:shadow-sm transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center mb-4">{f.icon}</div>
              <p className="font-semibold text-ink mb-1">{f.title}</p>
              <p className="text-sm text-muted">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Employer features */}
      <section id="employers" className="bg-ink-900 py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <div>
              <span className="text-xs font-semibold text-spark-400 uppercase tracking-wide">For employers</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">All your hiring tools, one screen</h2>
            </div>
            <Link href="/employer/dashboard" className="text-sm font-semibold text-spark-400 flex items-center gap-1">
              Open hiring dashboard <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {employerFeatures.map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-spark-400/50 hover:bg-white/[0.07] transition-all"
              >
                <div className="h-10 w-10 rounded-xl bg-spark-500/20 text-spark-400 grid place-items-center mb-4">{f.icon}</div>
                <p className="font-semibold text-white mb-1">{f.title}</p>
                <p className="text-sm text-white/60">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Platform-wide features */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink text-center mb-8">Everything you need, already in</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformFeatures.map((f) => (
            <div key={f.label} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5">
              <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 grid place-items-center shrink-0">{f.icon}</div>
              <span className="text-sm font-medium text-ink">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Admin CTA */}
      <section className="max-w-[1200px] mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-ink-900 border border-brand-500/30 text-white p-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-bold mb-2 text-white">One screen to run the whole platform</h2>
            <p className="text-white/60 max-w-lg">
              Admins can manage job seekers, employers, content, and money — checking, approving, and reporting, all in one place.
            </p>
          </div>
          <Link href="/admin/dashboard" className="rounded-xl bg-brand-500 hover:bg-brand-600 text-ink-900 font-semibold px-5 py-3 text-sm whitespace-nowrap">
            Open Admin console
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
