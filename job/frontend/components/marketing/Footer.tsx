import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="bg-ink-900 text-white/70 mt-24">
      <div className="max-w-[1200px] mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg text-white mb-3">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-spark-500 grid place-items-center text-white text-sm">
              JC
            </span>
            JobConnect
          </Link>
          <p className="text-sm max-w-xs">
            One platform for job search, professional networking, and hiring — built for the Indian market.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">Job seekers</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/seeker/jobs" className="hover:text-white">Browse jobs</Link></li>
            <li><Link href="/seeker/profile" className="hover:text-white">Build your profile</Link></li>
            <li><Link href="/seeker/network" className="hover:text-white">Grow your network</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">Employers</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/employer/jobs" className="hover:text-white">Post a job</Link></li>
            <li><Link href="/employer/candidates" className="hover:text-white">Search resumes</Link></li>
            <li><Link href="/employer/analytics" className="hover:text-white">Hiring analytics</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">Company</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/admin/dashboard" className="hover:text-white">Admin console</Link></li>
            <li><Link href="/seeker/learning" className="hover:text-white">Career resources</Link></li>
            <li><a href="mailto:support@jobconnect.com?subject=JobConnect%20support" className="hover:text-white">Contact support</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © 2026 Pavitram JobConnect. All rights reserved.
      </div>
    </footer>
  );
}
