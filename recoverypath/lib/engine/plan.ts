import { CATEGORY_REMEDY, REMEDIES } from "../content/remedies";
import type { Condition, EvidenceReadiness, Facts, FinancialEvent, PlanAction, PlanBucket, RemedyId, RemedyMatch } from "../types";
import { evaluate } from "./conditions";
import { formatUSD } from "./loss";
import { deriveFacts, moduleFor } from "./match";

/**
 * Recovery Action Plan — converts matches + evidence gaps into an ordered
 * sequence. Deterministic: same case in, same plan out.
 */

type LibraryAction = {
  id: string;
  remedyId: RemedyId;
  bucket: PlanBucket;
  when?: Condition;
  /** Evidence this action obtains — suppresses the generic "request it" action. */
  evidenceId?: string;
  /** Only for states listed. */
  states?: string[];
  title: string | ((ctx: Ctx) => string);
  detail: string | ((ctx: Ctx) => string);
};

type Ctx = { facts: Facts; ledger: FinancialEvent[]; match: RemedyMatch };

const largest = (ledger: FinancialEvent[], r: RemedyId) =>
  ledger.filter((e) => CATEGORY_REMEDY[e.category] === r).sort((a, b) => b.amount - a.amount)[0];

const LIBRARY: LibraryAction[] = [
  // ---- Coerced debt --------------------------------------------------------
  {
    id: "cd_secure_accounts",
    remedyId: "coerced_debt",
    bucket: "do_first",
    when: { all: [{ fact: "debt_how", op: "includes", value: "control_of_finances" }, { fact: "relationship_status", op: "in", value: ["ongoing", "ending"] }] },
    title: "Secure your accounts from a safe device",
    detail: "From a phone or computer he can't access, change passwords and security questions, and update the email and phone number on your bank and credit accounts. Only do this if it's safe for you.",
  },
  {
    id: "cd_contact_creditor",
    remedyId: "coerced_debt",
    bucket: "do_first",
    title: ({ ledger }) => {
      const top = largest(ledger, "coerced_debt");
      return top ? `Contact the creditor about "${top.description || "your largest account"}" (${formatUSD(top.amount)})` : "Contact the creditor about your largest disputed account";
    },
    detail: "Call, then follow up in writing. Explain that the account was opened, used or obtained through coercion or without your permission, ask what they need from you, and ask them to note the dispute on the account. Write down the date, the name of the person you spoke to and a reference number.",
  },
  {
    id: "cd_credit_reports",
    remedyId: "coerced_debt",
    bucket: "next",
    evidenceId: "credit_report",
    title: "Get your credit reports from all three bureaus",
    detail: "Use AnnualCreditReport.com (the official free site). Mark every account you didn't open or agree to.",
  },
  {
    id: "cd_ftc_report",
    remedyId: "coerced_debt",
    bucket: "next",
    evidenceId: "police_or_ftc_report",
    when: {
      all: [
        { fact: "debt_how", op: "includesAny", value: ["opened_without_knowledge", "used_without_permission"] },
        { not: { fact: "police_or_ftc_report", op: "eq", value: "yes" } },
      ],
    },
    title: "Create an FTC Identity Theft Report",
    detail: "At IdentityTheft.gov. Creditors and credit bureaus commonly ask for it before blocking or removing identity-theft accounts.",
  },
  {
    id: "cd_validation",
    remedyId: "coerced_debt",
    bucket: "next",
    when: { fact: "debt_in_collections", op: "eq", value: "yes" },
    title: "Send the debt collector a written validation request",
    detail: "Ask the collector to validate the debt and state that you dispute it. Keep a copy and proof of mailing.",
  },
  {
    id: "cd_bureau_block",
    remedyId: "coerced_debt",
    bucket: "then",
    title: "Ask the credit bureaus to block or correct the accounts",
    detail: "With your identity theft report, you can ask each bureau to block identity-theft information, or dispute information that is inaccurate.",
  },
  {
    id: "cd_ca_statement",
    remedyId: "coerced_debt",
    bucket: "after",
    states: ["CA"],
    evidenceId: "ca_coerced_statement",
    title: "Complete California's written coerced-debt statement",
    detail: "California's coerced-debt procedure starts with a written statement to the creditor plus supporting documentation. A legal-aid advocate can help you prepare it. Check the official statute for current requirements.",
  },

  // ---- Contributions -------------------------------------------------------
  {
    id: "cr_contribution_list",
    remedyId: "contribution_recovery",
    bucket: "next",
    title: "Build a dated list of every contribution",
    detail: "For each payment: date, amount, what it paid for, how you paid, and the document that proves it. Your ledger here is a starting point.",
  },
  {
    id: "cr_ownership",
    remedyId: "contribution_recovery",
    bucket: "then",
    evidenceId: "ownership_records",
    title: "Get a copy of the deed, title or business registration",
    detail: "Deeds are usually available from the county recorder; business filings from the Secretary of State.",
  },

  // ---- Shared obligations --------------------------------------------------
  {
    id: "so_missed",
    remedyId: "shared_obligation",
    bucket: "do_first",
    when: { fact: "payments_missed", op: "eq", value: "yes" },
    title: "Call the lender or landlord about the missed payments",
    detail: "Ask for the exact past-due amount, deadlines, and any hardship, release or refinance options. Limiting further credit damage comes first.",
  },
  {
    id: "so_calc_share",
    remedyId: "shared_obligation",
    bucket: "next",
    evidenceId: "shared_payment_history",
    title: "Calculate what you paid beyond your share",
    detail: "Get the payment history and total what you paid that was his responsibility.",
  },
  {
    id: "so_demand",
    remedyId: "shared_obligation",
    bucket: "then",
    title: "Send him a written request for repayment",
    detail: "A short, factual letter or email listing the amount and how you calculated it. Don't send it if contacting him isn't safe.",
  },

  // ---- Romance / investment scam -------------------------------------------
  {
    id: "rs_stop",
    remedyId: "romance_scam",
    bucket: "do_first",
    when: { fact: "still_in_contact", op: "eq", value: "yes" },
    title: "Stop sending money — and ignore 'recovery' offers",
    detail: "Don't send any more payments, fees or taxes to release funds. People who contact you offering to recover money for a fee are very often part of the same scam.",
  },
  {
    id: "rs_bank_now",
    remedyId: "romance_scam",
    bucket: "do_first",
    when: { fact: "last_payment", op: "in", value: ["under_3d", "under_30d"] },
    title: "Call your bank or payment app's fraud line today",
    detail: "Ask whether each recent transfer can be recalled, stopped or disputed. Ask for a claim number.",
  },
  {
    id: "rs_card_dispute",
    remedyId: "romance_scam",
    bucket: "next",
    when: { fact: "payment_method", op: "includes", value: "credit_card" },
    title: "Dispute card charges with your card issuer",
    detail: "Card disputes have time limits, so send a written dispute as soon as you can.",
  },
  {
    id: "rs_bank_claim",
    remedyId: "romance_scam",
    bucket: "next",
    when: { not: { fact: "last_payment", op: "in", value: ["under_3d", "under_30d"] } },
    title: "Ask your bank about a fraud claim for each payment",
    detail: "Even older payments are worth reporting. Ask for a claim number for each.",
  },
  {
    id: "rs_ic3",
    remedyId: "romance_scam",
    bucket: "next",
    evidenceId: "report_numbers",
    when: { not: { fact: "scam_reported", op: "includes", value: "ic3" } },
    title: "Report to the FBI at IC3.gov",
    detail: "Include every payment, profile, phone number and wallet address. Save the confirmation.",
  },
  {
    id: "rs_ftc",
    remedyId: "romance_scam",
    bucket: "then",
    when: { not: { fact: "scam_reported", op: "includes", value: "ftc" } },
    title: "Report to the FTC at ReportFraud.ftc.gov",
    detail: "Your report is shared with law enforcement agencies.",
  },
  {
    id: "rs_platform",
    remedyId: "romance_scam",
    bucket: "then",
    title: "Report the profile to the dating app or social platform",
    detail: "Screenshot the profile first — it may disappear once reported.",
  },
];

const PRESERVE: Record<RemedyId, string | undefined> = {
  coerced_debt: "coercion_communications",
  contribution_recovery: "promise_evidence",
  shared_obligation: "payment_agreement",
  romance_scam: "conversation_logs",
};

export const BUCKET_LABELS: Record<PlanBucket, string> = {
  do_first: "Do first",
  next: "Next",
  then: "Then",
  after: "After that",
  professional: "Professional review",
  lower: "Lower priority",
};

export const BUCKET_ORDER: PlanBucket[] = ["do_first", "next", "then", "after", "professional", "lower"];

export function buildPlan(
  answers: Facts,
  ledger: FinancialEvent[],
  matches: RemedyMatch[],
  readiness: EvidenceReadiness[],
): PlanAction[] {
  const facts = deriveFacts(answers, ledger);
  const actions: PlanAction[] = [];

  if (facts.safety_concern === "yes") {
    actions.push({
      id: "safety_plan",
      bucket: "do_first",
      title: "Make a safety plan before taking financial steps",
      detail: "Some steps (closing accounts, sending letters) can alert a former partner. The National Domestic Violence Hotline (1-800-799-7233, thehotline.org) can help you plan safely, confidentially, 24/7.",
    });
  }

  for (const match of matches) {
    const ctx: Ctx = { facts, ledger, match };
    const covered = new Set<string>();
    const ready = readiness.find((r) => r.remedyId === match.remedyId);
    const statusOf = (evidenceId: string) => ready?.items.find((i) => i.id === evidenceId)?.status;

    for (const a of LIBRARY.filter((x) => x.remedyId === match.remedyId)) {
      if (a.states && !a.states.includes(String(facts.state))) continue;
      if (a.when && evaluate(a.when, facts) !== "true") continue;
      if (a.evidenceId) {
        covered.add(a.evidenceId);
        if (statusOf(a.evidenceId) === "have") continue;
      }
      actions.push({
        id: a.id,
        bucket: a.bucket,
        remedyId: match.remedyId,
        evidenceKey: a.evidenceId ? `${match.remedyId}:${a.evidenceId}` : undefined,
        title: typeof a.title === "function" ? a.title(ctx) : a.title,
        detail: typeof a.detail === "function" ? a.detail(ctx) : a.detail,
      });
    }

    // Preserve communications — always "then", it's cheap and evidence disappears.
    const preserveId = PRESERVE[match.remedyId];
    if (preserveId && statusOf(preserveId) !== "have") {
      covered.add(preserveId);
      const item = ready?.items.find((i) => i.id === preserveId);
      actions.push({
        id: `preserve_${match.remedyId}`,
        bucket: "then",
        remedyId: match.remedyId,
        evidenceKey: `${match.remedyId}:${preserveId}`,
        title: `Preserve: ${item?.label.toLowerCase() ?? "communications"}`,
        detail: `${item?.where ?? ""} Store copies somewhere he can't access, such as a new email account.`.trim(),
      });
    }

    // Evidence-gap actions.
    for (const item of ready?.items ?? []) {
      if (covered.has(item.id) || item.status === "have" || item.status === "unavailable") continue;
      actions.push({
        id: `ev_${item.key}`,
        bucket: item.weight === 3 ? "next" : item.weight === 2 ? "then" : "after",
        remedyId: match.remedyId,
        evidenceKey: item.key,
        title: item.status === "requested" ? `Follow up: ${item.label}` : `Obtain: ${item.label}`,
        detail: `${item.why} Where: ${item.where}`,
      });
    }

    // Professional review.
    const mod = moduleFor(facts.state, match.remedyId);
    const threshold = mod?.professionalReviewAt;
    const remedy = REMEDIES[match.remedyId];
    if (match.remedyId === "shared_obligation" && threshold !== undefined && match.linkedAmount > threshold) {
      actions.push({
        id: "pro_shared",
        bucket: "professional",
        remedyId: match.remedyId,
        title: "Get advice before filing — the amount may exceed small claims",
        detail: `You've identified ${formatUSD(match.linkedAmount)} in shared obligations, above the ${formatUSD(threshold)} small claims limit noted for your state. An attorney or legal-aid office can advise on the right court.`,
      });
    } else if (match.remedyId === "shared_obligation" && match.linkedAmount > 0) {
      actions.push({
        id: "so_small_claims",
        bucket: "after",
        remedyId: match.remedyId,
        title: "Consider small claims court if he won't repay",
        detail: "Small claims is designed for people without lawyers. Check your state's current limit and filing fee with the court.",
      });
    } else if (threshold !== undefined && match.remedyId !== "shared_obligation" && (match.linkedAmount >= threshold || threshold === 0) && match.linkedAmount > 0) {
      const ownership = facts.property_title === "partner_only" ? " but ownership was never transferred" : "";
      actions.push({
        id: `pro_${match.remedyId}`,
        bucket: "professional",
        remedyId: match.remedyId,
        title: `Have an attorney evaluate your ${remedy.shortName.toLowerCase()}`,
        detail: `This warrants attorney evaluation because ${formatUSD(match.linkedAmount)} is identified${ownership}. Bring your Attorney Case Passport.`,
      });
    }

    // Lower priority: theories that currently lack their key ingredient.
    if (match.remedyId === "contribution_recovery" && (facts.promise_made === "no" || facts.promise_made === "implied")) {
      actions.push({
        id: "lower_agreement",
        bucket: "lower",
        remedyId: match.remedyId,
        title: "An agreement-based theory currently lacks evidence of an agreement",
        detail: "If you find messages or witnesses showing repayment or ownership was discussed, add them — it can change the analysis.",
      });
    }
    if (match.strength === "needs_info") {
      actions.push({
        id: `lower_info_${match.remedyId}`,
        bucket: "lower",
        remedyId: match.remedyId,
        title: `Fill in the open questions about ${remedy.shortName.toLowerCase()}`,
        detail: match.infoNeeded.slice(0, 3).join("; ") + ".",
      });
    }
  }

  return actions.sort((a, b) => BUCKET_ORDER.indexOf(a.bucket) - BUCKET_ORDER.indexOf(b.bucket));
}
