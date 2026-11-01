import Link from "next/link";
import { REMEDIES } from "@/lib/content/remedies";
import { MODULES, STATE_NAMES } from "@/lib/content/states";
import { Badge, PageHeader } from "@/components/ui";
import type { RuleStatus } from "@/lib/types";
import { STATUS_TONE } from "@/components/statusTone";

export const dynamic = "force-dynamic";


export default function AdminPage() {
  const counts = MODULES.reduce<Record<string, number>>((acc, m) => ((acc[m.status] = (acc[m.status] ?? 0) + 1), acc), {});
  return (
    <div>
      <PageHeader eyebrow="Internal · Legal content" title="State Remedy Knowledge Graph">
        Every state × remedy module, its status and its review trail. Published modules are immutable — changes create a new version.
      </PageHeader>
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        {(["draft", "legal_review", "approved", "published", "retired"] as RuleStatus[]).map((s) => (
          <Badge key={s} tone={STATUS_TONE[s]}>{s.replace("_", " ")}: {counts[s] ?? 0}</Badge>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-paper-line bg-white">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-paper-line bg-paper-deep text-ink-mute">
            <tr>
              <th className="px-4 py-3">Module</th><th className="px-4 py-3">State</th><th className="px-4 py-3">Remedy</th>
              <th className="px-4 py-3">Status</th><th className="px-4 py-3">Version</th><th className="px-4 py-3">Reviewed by</th><th className="px-4 py-3">Last verified</th>
            </tr>
          </thead>
          <tbody>
            {MODULES.map((m) => (
              <tr key={m.id} className="border-b border-paper-line last:border-0">
                <td className="px-4 py-2.5"><Link className="font-medium text-teal-700 hover:underline" href={`/admin/${encodeURIComponent(m.id)}`}>{m.id}</Link></td>
                <td className="px-4 py-2.5">{STATE_NAMES[m.state]}</td>
                <td className="px-4 py-2.5">{REMEDIES[m.remedyId].shortName}</td>
                <td className="px-4 py-2.5"><Badge tone={STATUS_TONE[m.status]}>{m.status.replace("_", " ")}</Badge></td>
                <td className="px-4 py-2.5 tabular">v{m.version}</td>
                <td className="px-4 py-2.5 text-ink-mute">{m.reviewedBy ?? "—"}</td>
                <td className="px-4 py-2.5 text-ink-mute">{m.lastVerified ?? "Not verified"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
