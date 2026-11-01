import { includeUnreviewedFromEnv } from "@/lib/engine/match";
import type { RuleStatus } from "@/lib/types";

/** Shown wherever results come from rules that aren't attorney approved yet. */
export function ContentStatusBanner({ statuses }: { statuses: RuleStatus[] }) {
  const unreviewed = statuses.some((s) => s !== "published" && s !== "approved");
  if (!unreviewed || !includeUnreviewedFromEnv()) return null;
  return (
    <div className="mb-6 rounded-xl border border-gold-500/30 bg-gold-50 px-4 py-3 text-sm text-ink-soft">
      <strong className="text-ink">Early-access content.</strong> These screening rules are still in legal review. Treat every result as a starting point
      for your own research or a conversation with an attorney.
    </div>
  );
}
