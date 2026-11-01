import { LEDGER_CATEGORIES, REMEDIES } from "./content/remedies";
import { MODULE_BY_ID, STATE_NAMES } from "./content/states";
import { QUESTION_BY_ID } from "./content/assessment";
import type { CaseAnalysis } from "./engine";
import { moduleStateFor } from "./engine/match";
import type { CaseState } from "./types";

/**
 * RecoveryPath Case Passport — a standardized, versioned intake format for
 * relationship-financial-harm matters. The JSON is the product; the printed
 * packet is a rendering of it. Bump PASSPORT_FORMAT on any breaking change.
 */
export const PASSPORT_FORMAT = "recoverypath.case-passport/0.1";

const RELATIONSHIP_LABEL: Record<string, string> = {
  dating: "Former dating partner (not cohabiting)",
  cohabiting: "Former unmarried cohabiting partner",
  engaged: "Former fiancé",
  online: "Online contact (never met in person)",
  married: "Spouse / former spouse",
};

export function answerLabel(id: string, value: unknown): string {
  const q = QUESTION_BY_ID[id];
  if (!q) return String(value);
  const vals = Array.isArray(value) ? value : [value];
  return vals.map((v) => q.options.find((o) => o.value === v)?.label ?? String(v)).join("; ");
}

export function buildPassport(state: CaseState, a: CaseAnalysis) {
  const st = moduleStateFor(state.answers.state);
  const catLabel = Object.fromEntries(LEDGER_CATEGORIES.map((c) => [c.id, c.label]));
  const timelineCount = state.ledger.filter((e) => e.date).length;

  const transactions = [...state.ledger]
    .sort((x, y) => (x.date ?? "9999").localeCompare(y.date ?? "9999"))
    .map((e) => ({
      date: e.date ?? null,
      category: catLabel[e.category],
      description: e.description,
      amount: e.amount,
      evidenceStrength: e.evidence,
      status: e.resolution,
    }));

  const pathways = a.matches.map((m) => {
    const mod = MODULE_BY_ID[m.moduleId];
    const ready = a.readiness.list.find((r) => r.remedyId === m.remedyId);
    return {
      pathway: mod.title,
      remedy: REMEDIES[m.remedyId].name,
      rule: { id: m.moduleId, version: m.moduleVersion, status: m.moduleStatus },
      screeningStrength: m.strength,
      factsSupporting: m.why,
      openQuestions: m.infoNeeded,
      urgency: m.urgency.map((u) => u.label),
      amountIdentified: m.linkedAmount,
      evidenceReadiness: ready?.percent ?? 0,
      evidenceGaps: ready?.items.filter((i) => i.status !== "have").map((i) => ({ item: i.label, status: i.status, supports: i.supports })) ?? [],
      questionsForAttorney: REMEDIES[m.remedyId].attorneyQuestions,
      sources: [...REMEDIES[m.remedyId].baseSources, ...mod.sources].map((s) => s.citation ?? s.title),
    };
  });

  const intake = Object.entries(state.answers)
    .filter(([id]) => QUESTION_BY_ID[id] && id !== "safety_concern")
    .map(([id, v]) => ({ question: QUESTION_BY_ID[id].prompt, answer: answerLabel(id, v) }));

  return {
    format: PASSPORT_FORMAT,
    generatedAt: new Date().toISOString(),
    header: {
      financialImpact: a.loss.total,
      state: STATE_NAMES[st] + (st === "US" ? ` (${String(state.answers.state ?? "not specified")})` : ""),
      relationship: RELATIONSHIP_LABEL[String(state.answers.relationship_type)] ?? "Not specified",
      relationshipStatus: answerLabel("relationship_status", state.answers.relationship_status ?? "—"),
      potentialPathways: a.matches.length,
      transactions: state.ledger.length,
      documents: state.documents.length,
      timeline: state.ledger.length > 0 && timelineCount === state.ledger.length ? "Complete" : `${timelineCount} of ${state.ledger.length} transactions dated`,
      evidenceReadiness: a.readiness.overall,
      urgentIssues: a.snapshot.urgent,
    },
    factualSummary: factualSummary(state, a),
    intake,
    transactions,
    documents: state.documents.map((d) => ({ name: d.name, category: d.category, type: d.type, addedAt: d.addedAt })),
    pathways,
    disclaimer:
      "Prepared by the client using RecoveryPath, a self-help organization tool. It is not legal advice and contains no legal conclusions. Screening results come from rules that may not yet be attorney reviewed (see rule status).",
  };
}

export type Passport = ReturnType<typeof buildPassport>;

/** Deterministic one-paragraph summary. Claude may rewrite it for readability, never for substance. */
export function factualSummary(state: CaseState, a: CaseAnalysis): string {
  const s = state.answers;
  const rel = RELATIONSHIP_LABEL[String(s.relationship_type)]?.toLowerCase() ?? "a partner";
  const parts: string[] = [];
  parts.push(
    `Client reports financial harm connected to a relationship with ${rel}${s.relationship_status ? ` (${answerLabel("relationship_status", s.relationship_status).toLowerCase()})` : ""}.`,
  );
  if (a.loss.total > 0)
    parts.push(`She has itemized ${state.ledger.length} financial event${state.ledger.length === 1 ? "" : "s"} totaling $${a.loss.total.toLocaleString("en-US")}.`);
  for (const m of a.matches) {
    const amt = m.linkedAmount ? ` ($${m.linkedAmount.toLocaleString("en-US")} identified)` : "";
    parts.push(`${REMEDIES[m.remedyId].shortName}${amt}: ${m.why.slice(0, 3).join("; ").toLowerCase()}.`);
  }
  return parts.join(" ");
}
