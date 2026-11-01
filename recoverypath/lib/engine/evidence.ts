import { REMEDIES } from "../content/remedies";
import type { EvidenceItem, EvidenceReadiness, EvidenceStatus, Facts, RemedyId, RemedyMatch } from "../types";
import { evaluate } from "./conditions";
import { moduleFor } from "./match";

/**
 * Evidence Readiness methodology
 * ------------------------------
 * This is NOT a probability of winning. It measures how much of the evidence
 * generally needed to evaluate or pursue a pathway has been gathered.
 *
 *   readiness = Σ(weight × credit) / Σ(weight)
 *   credit: have = 1, requested = 0.5, not_requested = 0, unavailable = 0
 *
 * Weights: 3 = core to the pathway, 2 = important, 1 = helpful.
 * "Unavailable" still counts against readiness — it is a real gap an attorney
 * should know about — but generates no "request it" action.
 */
export const CREDIT: Record<EvidenceStatus, number> = { have: 1, requested: 0.5, not_requested: 0, unavailable: 0 };

export function evidenceKey(remedyId: RemedyId, evidenceId: string) {
  return `${remedyId}:${evidenceId}`;
}

export function evidenceItemsFor(remedyId: RemedyId, state: unknown): EvidenceItem[] {
  return [...REMEDIES[remedyId].evidence, ...(moduleFor(state, remedyId)?.extraEvidence ?? [])];
}

/** Statuses we can infer from the assessment so the user doesn't answer twice. */
function inferredStatus(key: string, facts: Facts): EvidenceStatus | undefined {
  const t = (c: Parameters<typeof evaluate>[0]) => evaluate(c, facts) === "true";
  switch (key) {
    case "coerced_debt:police_or_ftc_report":
      return t({ fact: "police_or_ftc_report", op: "eq", value: "yes" }) ? "have" : undefined;
    case "romance_scam:report_numbers":
      return t({ fact: "scam_reported", op: "includesAny", value: ["ic3", "ftc", "police"] }) ? "have" : undefined;
    case "romance_scam:bank_dispute_records":
      return t({ fact: "scam_reported", op: "includes", value: "bank" }) ? "requested" : undefined;
    case "contribution_recovery:payment_records":
      return t({ fact: "contribution_documented", op: "eq", value: "yes" }) ? "have" : undefined;
    case "contribution_recovery:promise_evidence":
      return t({ fact: "promise_made", op: "eq", value: "written" }) ? "have" : undefined;
    default:
      return undefined;
  }
}

export function statusFor(key: string, stored: Record<string, EvidenceStatus>, facts: Facts): EvidenceStatus {
  return stored[key] ?? inferredStatus(key, facts) ?? "not_requested";
}

export function readinessFor(remedyId: RemedyId, state: unknown, stored: Record<string, EvidenceStatus>, facts: Facts): EvidenceReadiness {
  const items = evidenceItemsFor(remedyId, state).map((it) => {
    const key = evidenceKey(remedyId, it.id);
    return { ...it, key, status: statusFor(key, stored, facts) };
  });
  const total = items.reduce((s, i) => s + i.weight, 0);
  const got = items.reduce((s, i) => s + i.weight * CREDIT[i.status], 0);
  return {
    remedyId,
    percent: total ? Math.round((got / total) * 100) : 0,
    items,
    missing: items.filter((i) => i.status !== "have").length,
  };
}

export function readinessAll(matches: RemedyMatch[], state: unknown, stored: Record<string, EvidenceStatus>, facts: Facts) {
  const list = matches.map((m) => readinessFor(m.remedyId, state, stored, facts));
  let total = 0;
  let got = 0;
  for (const r of list) {
    for (const i of r.items) {
      total += i.weight;
      got += i.weight * CREDIT[i.status];
    }
  }
  return {
    list,
    overall: total ? Math.round((got / total) * 100) : 0,
    missing: list.reduce((s, r) => s + r.missing, 0),
  };
}
