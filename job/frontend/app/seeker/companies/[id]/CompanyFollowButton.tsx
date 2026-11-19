"use client";

import { Check, Plus } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useLocalStorage } from "@/lib/use-local-storage";

const FOLLOW_KEY = "jobportal_followed_companies";

export function CompanyFollowButton({ companyId, followers }: { companyId: string; followers: number }) {
  const toast = useToast();
  const [stored, write] = useLocalStorage<string[]>(FOLLOW_KEY);
  const followed = stored ?? [];
  const following = followed.includes(companyId);

  function toggle() {
    write(following ? followed.filter((x) => x !== companyId) : [...followed, companyId]);
    toast(following ? "You unfollowed this company." : "You're now following this company.", following ? "info" : "success");
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted">{(followers + (following ? 1 : 0)).toLocaleString("en-IN")} followers</span>
      <button
        onClick={toggle}
        aria-pressed={following}
        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold ${
          following ? "bg-good-100 text-good-500" : "bg-brand-500 hover:bg-brand-600 text-ink-900"
        }`}
      >
        {following ? <Check size={15} /> : <Plus size={15} />}
        {following ? "Following" : "Follow"}
      </button>
    </div>
  );
}
