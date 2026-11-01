import type { CaseState } from "../types";
import { readinessAll } from "./evidence";
import { summarizeLoss } from "./loss";
import { deriveFacts, matchRemedies } from "./match";
import { buildPlan } from "./plan";

export * from "./conditions";
export * from "./evidence";
export * from "./loss";
export * from "./match";
export * from "./plan";

/** One call that runs the whole deterministic pipeline for a case. */
export function analyzeCase(c: Pick<CaseState, "answers" | "ledger" | "evidence">, opts: { includeUnreviewed?: boolean } = {}) {
  const facts = deriveFacts(c.answers, c.ledger);
  const loss = summarizeLoss(c.ledger);
  const matches = matchRemedies(c.answers, c.ledger, opts);
  const readiness = readinessAll(matches, c.answers.state, c.evidence, facts);
  const plan = buildPlan(c.answers, c.ledger, matches, readiness.list);
  const urgent = matches.flatMap((m) => m.urgency).filter((u) => u.level === "urgent").length;
  return {
    facts,
    loss,
    matches,
    readiness,
    plan,
    snapshot: {
      impact: loss.total,
      pathways: matches.length,
      readiness: readiness.overall,
      missingEvidence: readiness.missing,
      actions: plan.length,
      urgent,
    },
  };
}

export type CaseAnalysis = ReturnType<typeof analyzeCase>;
