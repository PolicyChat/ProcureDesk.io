import { CATEGORY_REMEDY, REMEDY_ORDER } from "../content/remedies";
import { MODULE_BY_ID, SUPPORTED_STATES, type ModuleState } from "../content/states";
import type { Facts, FinancialEvent, RemedyId, RemedyMatch, RuleStatus, StateRemedyModule } from "../types";
import { evaluate, trueLabels } from "./conditions";

/**
 * Which rule statuses the engine may run on. Production should serve only
 * "published"; until attorney review is complete the MVP runs on unreviewed
 * content and the UI shows a banner (see ContentStatusBanner).
 */
export function allowedStatuses(includeUnreviewed = includeUnreviewedFromEnv()): RuleStatus[] {
  return includeUnreviewed ? ["draft", "legal_review", "approved", "published"] : ["published"];
}

export function includeUnreviewedFromEnv(): boolean {
  return process.env.NEXT_PUBLIC_RULES_INCLUDE_UNREVIEWED !== "false";
}

export function moduleStateFor(state: unknown): ModuleState {
  return SUPPORTED_STATES.includes(state as ModuleState) ? (state as ModuleState) : "US";
}

export function moduleFor(state: unknown, remedyId: RemedyId): StateRemedyModule {
  return MODULE_BY_ID[`${moduleStateFor(state)}.${remedyId}`];
}

/** Assessment answers + facts derived from the financial ledger. */
export function deriveFacts(answers: Facts, ledger: FinancialEvent[]): Facts {
  const facts: Facts = { ...answers };
  for (const r of REMEDY_ORDER) {
    const total = ledgerTotalFor(ledger, r);
    if (ledger.some((e) => CATEGORY_REMEDY[e.category] === r)) facts[`ledger_${r}`] = "yes";
    facts[`ledger_total_${r}`] = total;
  }
  return facts;
}

export function ledgerTotalFor(ledger: FinancialEvent[], remedyId: RemedyId): number {
  return ledger.filter((e) => CATEGORY_REMEDY[e.category] === remedyId).reduce((s, e) => s + (e.amount || 0), 0);
}

/**
 * Remedy Match: runs each state module's trigger over the facts.
 * A pathway appears only when its trigger is definitively TRUE.
 */
export function matchRemedies(
  answers: Facts,
  ledger: FinancialEvent[],
  opts: { includeUnreviewed?: boolean } = {},
): RemedyMatch[] {
  const facts = deriveFacts(answers, ledger);
  const allowed = allowedStatuses(opts.includeUnreviewed ?? includeUnreviewedFromEnv());
  const out: RemedyMatch[] = [];

  for (const remedyId of REMEDY_ORDER) {
    const mod = moduleFor(answers.state, remedyId);
    if (!mod || !allowed.includes(mod.status)) continue;
    if (evaluate(mod.trigger, facts) !== "true") continue;

    const why = [...trueLabels(mod.trigger, facts), ...mod.signals.filter((s) => evaluate(s.when, facts) === "true").map((s) => s.label)];
    const signalCount = mod.signals.filter((s) => evaluate(s.when, facts) === "true").length;

    const infoNeeded = mod.infoNeeded
      .filter((n) => !n.fact || evaluate({ fact: n.fact, op: "answered" }, facts) !== "true")
      .map((n) => n.label);

    const urgency = mod.urgency.filter((u) => evaluate(u.when, facts) === "true").map((u) => ({ level: u.level, label: u.label }));

    const linked = ledger.filter((e) => CATEGORY_REMEDY[e.category] === remedyId);

    out.push({
      remedyId,
      moduleId: mod.id,
      moduleVersion: mod.version,
      moduleStatus: mod.status,
      strength: signalCount >= 2 ? "strong" : signalCount === 1 ? "possible" : "needs_info",
      why: Array.from(new Set(why)),
      infoNeeded,
      urgency,
      linkedAmount: linked.reduce((s, e) => s + e.amount, 0),
      linkedEvents: linked.length,
    });
  }

  // Urgent pathways first, then by money involved.
  const rank = (m: RemedyMatch) => (m.urgency.some((u) => u.level === "urgent") ? 2 : m.urgency.length ? 1 : 0);
  return out.sort((a, b) => rank(b) - rank(a) || b.linkedAmount - a.linkedAmount);
}
