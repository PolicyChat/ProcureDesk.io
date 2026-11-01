import { CATEGORY_REMEDY, REMEDY_ORDER } from "../content/remedies";
import type { EvidenceStrength, FinancialEvent, RemedyId, ResolutionStatus } from "../types";

export type LossSummary = {
  total: number;
  byRemedy: Record<RemedyId | "unassigned", number>;
  byStrength: Record<EvidenceStrength, number>;
  byResolution: Record<ResolutionStatus, number>;
  count: number;
};

export function summarizeLoss(ledger: FinancialEvent[]): LossSummary {
  const byRemedy = Object.fromEntries([...REMEDY_ORDER, "unassigned"].map((k) => [k, 0])) as LossSummary["byRemedy"];
  const byStrength: LossSummary["byStrength"] = { strong: 0, moderate: 0, weak: 0, none: 0 };
  const byResolution: LossSummary["byResolution"] = { unresolved: 0, disputed: 0, attorney_review: 0, resolved: 0 };
  let total = 0;
  for (const e of ledger) {
    const amt = Number.isFinite(e.amount) ? Math.max(0, e.amount) : 0;
    total += amt;
    byRemedy[CATEGORY_REMEDY[e.category] ?? "unassigned"] += amt;
    byStrength[e.evidence] += amt;
    byResolution[e.resolution] += amt;
  }
  return { total, byRemedy, byStrength, byResolution, count: ledger.length };
}

export function formatUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
