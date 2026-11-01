import { GLOSSARY, REMEDIES } from "./content/remedies";
import { MODULE_BY_ID } from "./content/states";
import { evidenceItemsFor, matchRemedies, moduleFor } from "./engine";
import type { Facts, FinancialEvent, RemedyId } from "./types";

/**
 * Controlled explanation layer. There is NO free-text question box: the user
 * can only ask one of these question kinds, and the model is given only
 * approved content + the deterministic engine output to answer from.
 */
export const EXPLAIN_KINDS = ["why_remedy", "why_evidence", "where_document", "term", "next_step", "passport_summary"] as const;
export type ExplainKind = (typeof EXPLAIN_KINDS)[number];

export type ExplainRequest = {
  kind: ExplainKind;
  remedyId?: RemedyId;
  evidenceId?: string;
  term?: string;
  action?: { title: string; detail: string };
  answers?: Facts;
  ledger?: Pick<FinancialEvent, "category" | "amount" | "date" | "evidence">[];
};

export const SYSTEM_PROMPT = `You are the explanation layer inside RecoveryPath, a self-help tool that helps women organize financial harm caused by a relationship.

You explain; you never decide. A deterministic rules engine has already decided which pathways to show. Your job is to explain, in plain language, the APPROVED CONTENT and CASE FACTS you are given.

Hard rules:
- Use only what is in APPROVED CONTENT and CASE FACTS. If they don't answer the question, say so briefly and suggest asking an attorney or a legal-aid office.
- Never name a statute, case, deadline, fee, form, court, agency or website unless it appears in APPROVED CONTENT.
- Never say or imply she "has a case", "qualifies", "is eligible", "will win" or "can recover" an amount. Use "may", "could be worth looking into", "an attorney can tell you".
- Never give a probability or prediction.
- Write at about an 8th-grade reading level: warm, direct, no legal jargon unless you define it. Address her as "you".
- At most 150 words. Short paragraphs or a short list. No headings.`;

type Built = { content: string; fallback: string };

function bullet(xs: string[]) {
  return xs.map((x) => `- ${x}`).join("\n");
}

export function buildExplanationContext(req: ExplainRequest): Built | { error: string } {
  const answers = req.answers ?? {};
  const ledger = (req.ledger ?? []).map((e, i) => ({ id: String(i), description: "", resolution: "unresolved" as const, ...e }));

  switch (req.kind) {
    case "why_remedy": {
      if (!req.remedyId || !REMEDIES[req.remedyId]) return { error: "unknown remedy" };
      const remedy = REMEDIES[req.remedyId];
      const mod = moduleFor(answers.state, req.remedyId);
      const match = matchRemedies(answers, ledger).find((m) => m.remedyId === req.remedyId);
      if (!match) return { error: "pathway not identified for these facts" };
      const content = `PATHWAY: ${mod.title}
SUMMARY: ${remedy.summary}
STATE NOTES:
${bullet(mod.stateNotes)}
RULE: ${mod.id} v${mod.version} (status: ${mod.status})

CASE FACTS — reasons the rules engine matched this pathway:
${bullet(match.why)}
Information still needed:
${bullet(match.infoNeeded)}`;
      return {
        content,
        fallback: `This pathway appeared because of what you told us:\n${bullet(match.why)}\n\n${remedy.summary}`,
      };
    }

    case "why_evidence":
    case "where_document": {
      if (!req.remedyId || !REMEDIES[req.remedyId]) return { error: "unknown remedy" };
      const item = evidenceItemsFor(req.remedyId, answers.state).find((e) => e.id === req.evidenceId);
      if (!item) return { error: "unknown evidence item" };
      const content = `PATHWAY: ${REMEDIES[req.remedyId].name}
EVIDENCE ITEM: ${item.label}
WHAT IT SUPPORTS: ${item.supports}
WHY IT MATTERS: ${item.why}
WHERE TO GET IT: ${item.where}`;
      const fallback = req.kind === "why_evidence" ? `${item.why}\n\nIt supports: ${item.supports.toLowerCase()}.` : item.where;
      return { content, fallback };
    }

    case "term": {
      const key = (req.term ?? "").toLowerCase();
      const def = GLOSSARY[key];
      if (!def) return { error: "unknown term" };
      return { content: `TERM: ${key}\nAPPROVED DEFINITION: ${def}`, fallback: def };
    }

    case "next_step": {
      if (!req.action?.title) return { error: "missing action" };
      const content = `RECOMMENDED ACTION: ${req.action.title}
APPROVED GUIDANCE: ${req.action.detail}`;
      return { content, fallback: req.action.detail };
    }

    case "passport_summary": {
      const matches = matchRemedies(answers, ledger);
      const total = ledger.reduce((s, e) => s + (e.amount || 0), 0);
      const content = `TASK: Rewrite these facts as a neutral, third-person, one-paragraph factual summary for an attorney intake (no advice, no conclusions, ≤120 words). Refer to the user as "the client".
TOTAL FINANCIAL IMPACT ITEMIZED: $${total.toLocaleString("en-US")} across ${ledger.length} events.
RELATIONSHIP: ${String(answers.relationship_type ?? "not specified")}, status ${String(answers.relationship_status ?? "not specified")}.
PATHWAYS IDENTIFIED BY RULES ENGINE:
${matches.map((m) => `- ${MODULE_BY_ID[m.moduleId].title}: ${m.why.join("; ")}`).join("\n")}`;
      return { content, fallback: "" };
    }
  }
}
