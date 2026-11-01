import type {
  Agency,
  Condition,
  DeadlineNote,
  EvidenceItem,
  InfoNeed,
  RemedyId,
  RuleStatus,
  Signal,
  Source,
  StateRemedyModule,
  UrgencyRule,
} from "../types";

/**
 * State Remedy Knowledge Graph — MVP: 4 remedies × 5 states (+ a federal-only
 * fallback for every other state).
 *
 * IMPORTANT — CONTENT STATUS
 * No module below has been attorney reviewed. Each is "draft" or
 * "legal_review", carries `reviewedBy: null`, and every deadline note is
 * `verified: false`. Citations were chosen because they are well-known primary
 * sources, but each must be verified against the official text before a
 * module is moved to "approved" → "published". Production should run with
 * NEXT_PUBLIC_RULES_INCLUDE_UNREVIEWED=false once modules are published.
 *
 * Published modules are immutable. To change one, add a new version
 * (see supabase/migrations/0001_schema.sql: legal_rule_versions).
 */

export type ModuleState = StateRemedyModule["state"];

const yes = (fact: string, label: string): Condition => ({ fact, op: "eq", value: "yes", label });

// ---------------------------------------------------------------------------
// Base screening logic per remedy (shared by every state, extended by overlays)
// ---------------------------------------------------------------------------

type Base = {
  trigger: Condition;
  signals: Signal[];
  infoNeeded: InfoNeed[];
  urgency: UrgencyRule[];
  procedure: string[];
  deadlines: DeadlineNote[];
  professionalReviewAt?: number;
};

const BASE: Record<RemedyId, Base> = {
  coerced_debt: {
    trigger: {
      any: [
        yes("debt_in_name", "Someone opened or used an account in your name"),
        yes("coerced_borrowing", "You were pressured or threatened into borrowing"),
        yes("ledger_coerced_debt", "You listed debt in your name in your financial ledger"),
      ],
    },
    signals: [
      { when: { fact: "debt_how", op: "includes", value: "threats_or_pressure" }, label: "You described threats, intimidation or pressure" },
      { when: { fact: "debt_how", op: "includes", value: "opened_without_knowledge" }, label: "An account was opened without your knowledge" },
      { when: { fact: "debt_how", op: "includes", value: "used_without_permission" }, label: "Your card or account was used without permission" },
      { when: { fact: "debt_how", op: "includes", value: "control_of_finances" }, label: "Your partner controlled your money, mail or passwords" },
      { when: { fact: "debt_how", op: "includes", value: "deceived" }, label: "You were misled about what the borrowing was for" },
      { when: { fact: "debt_on_credit_report", op: "eq", value: "yes" }, label: "The debt appears on your credit report" },
      { when: { fact: "police_or_ftc_report", op: "eq", value: "yes" }, label: "You already have a police or FTC report" },
    ],
    infoNeeded: [
      { fact: "debt_type", label: "What type of debt it is" },
      { fact: "debt_on_credit_report", label: "Whether it appears on your credit report" },
      { fact: "debt_still_open", label: "Whether the account is still open" },
      { fact: "debt_in_collections", label: "Whether a debt collector is involved" },
      { label: "Who currently owns the debt (the original creditor or a collector)" },
      { label: "Whether the debt is secured by property, such as a car" },
    ],
    urgency: [
      {
        when: { all: [{ fact: "debt_how", op: "includes", value: "control_of_finances" }, { fact: "relationship_status", op: "in", value: ["ongoing", "ending"] }] },
        level: "urgent",
        label: "He may still have access to your accounts. Change passwords and contact details from a device he can't reach.",
      },
      { when: yes("debt_in_collections", ""), level: "soon", label: "A collector is involved — collection notices can carry response deadlines." },
      { when: yes("debt_still_open", ""), level: "soon", label: "The account is still open and the balance could keep growing." },
    ],
    procedure: [
      "Get your credit reports from all three bureaus and mark every account you didn't open or agree to.",
      "Contact each creditor in writing: explain the account was opened, used or obtained through coercion or without your permission, and ask for account-opening records.",
      "If an account was opened or used without your permission, create an FTC Identity Theft Report at IdentityTheft.gov.",
      "Ask the credit bureaus to block identity-theft information (FCRA § 605B) or dispute inaccurate information (FCRA § 611).",
      "If a collector contacts you, request validation of the debt in writing.",
    ],
    deadlines: [
      {
        label: "Debt collector validation window",
        description:
          "If you dispute a debt in writing within 30 days of a collector's validation notice, the collector must pause collection until it provides verification (15 U.S.C. § 1692g(b)).",
        verified: false,
      },
    ],
  },

  contribution_recovery: {
    trigger: {
      any: [
        yes("contributed_property", "You contributed money toward property you don't fully own"),
        yes("contributed_business", "You put money or work into your partner's business"),
        yes("ledger_contribution_recovery", "You listed contributions to his property or business in your ledger"),
      ],
    },
    signals: [
      { when: { fact: "promise_made", op: "eq", value: "written" }, label: "Repayment or ownership was promised in writing" },
      { when: { fact: "promise_made", op: "eq", value: "verbal" }, label: "Repayment or ownership was promised verbally" },
      { when: { fact: "property_title", op: "eq", value: "partner_only" }, label: "The property is only in your partner's name" },
      { when: { fact: "contribution_documented", op: "eq", value: "yes" }, label: "You can document most of the payments" },
    ],
    infoNeeded: [
      { fact: "property_title", label: "Whose name the property is in" },
      { fact: "promise_made", label: "Whether repayment or ownership was promised" },
      { fact: "contribution_documented", label: "Whether the payments can be documented" },
      { label: "The date of each contribution — limitation periods may run from these dates" },
      { label: "The current value of the property or business" },
    ],
    urgency: [
      {
        when: { all: [{ fact: "relationship_status", op: "eq", value: "ended" }, { any: [yes("contributed_property", ""), yes("contributed_business", "")] }] },
        level: "soon",
        label: "Limitation periods for these claims can be short and may already be running.",
      },
    ],
    procedure: [
      "Build a dated list of every contribution with proof of payment.",
      "Collect every message where repayment, ownership or a shared future in the property was discussed.",
      "Get a copy of the deed, title or business registration.",
      "Have an attorney evaluate which claims your state recognizes and which deadlines apply.",
    ],
    deadlines: [
      {
        label: "Limitation periods",
        description: "Contract, unjust-enrichment and trust claims each have their own deadlines, which vary by state. Get attorney advice on dates.",
        verified: false,
      },
    ],
    professionalReviewAt: 5000,
  },

  shared_obligation: {
    trigger: {
      any: [
        yes("shared_obligation", "Your partner stopped paying a shared loan, lease or bill"),
        yes("ledger_shared_obligation", "You listed shared obligations in your ledger"),
      ],
    },
    signals: [
      { when: { fact: "obligation_role", op: "in", value: ["co_borrower", "joint_lease"] }, label: "You're both on the account" },
      { when: { fact: "obligation_role", op: "eq", value: "mine_only" }, label: "It's in your name but was for both of you" },
      { when: { fact: "partner_kept_asset", op: "eq", value: "yes" }, label: "He kept what the debt paid for" },
    ],
    infoNeeded: [
      { fact: "obligation_type", label: "Which obligations are affected" },
      { fact: "obligation_role", label: "How you are named on each account" },
      { fact: "payments_missed", label: "Whether payments are currently being missed" },
      { label: "How much each of you paid, month by month" },
    ],
    urgency: [
      {
        when: yes("payments_missed", ""),
        level: "urgent",
        label: "Payments are being missed — this can damage your credit and lead to repossession or eviction.",
      },
    ],
    procedure: [
      "Call the lender or landlord to learn the exact balance, what's past due and your options (hardship plan, release, refinance).",
      "Calculate what you paid beyond your share.",
      "Send your former partner a written request for repayment of his share.",
      "If he doesn't pay, consider small claims court where the amount fits the limit.",
    ],
    deadlines: [],
  },

  romance_scam: {
    trigger: {
      any: [
        yes("romance_scam", "You sent money to someone you met romantically online"),
        yes("ledger_romance_scam", "You listed scam-related losses in your ledger"),
      ],
    },
    signals: [
      { when: { fact: "never_met", op: "eq", value: "never" }, label: "You've never met this person in person" },
      { when: { fact: "investment_platform", op: "eq", value: "yes" }, label: "They steered you to an investment app or website" },
      { when: { fact: "payment_method", op: "includesAny", value: ["crypto", "gift_cards", "wire"] }, label: "You used payment methods scammers commonly request" },
      { when: { fact: "payment_method", op: "includes", value: "credit_card" }, label: "You paid by card — a card dispute may be available" },
    ],
    infoNeeded: [
      { fact: "payment_method", label: "How each payment was sent" },
      { fact: "last_payment", label: "When the most recent payment was sent" },
      { fact: "scam_reported", label: "Who it has been reported to" },
      { label: "Transaction IDs or reference numbers for each payment" },
    ],
    urgency: [
      {
        when: { fact: "last_payment", op: "in", value: ["under_3d", "under_30d"] },
        level: "urgent",
        label: "Your last payment was recent. Contact your bank or payment provider's fraud line now — some recalls are only possible within days.",
      },
      {
        when: yes("still_in_contact", ""),
        level: "urgent",
        label: "You're still being asked for money. Stop sending funds. 'Recovery' services that charge fees are a common follow-up scam.",
      },
      { when: { fact: "scam_reported", op: "includes", value: "none" }, level: "soon", label: "It hasn't been reported yet." },
    ],
    procedure: [
      "Stop sending money and stop engaging, including with anyone who offers to recover funds for a fee.",
      "Call your bank, card issuer or payment app's fraud department and ask about a recall, dispute or claim for each payment.",
      "Report to the FBI at IC3.gov and to the FTC at ReportFraud.ftc.gov.",
      "Report the profile to the dating app or social platform.",
    ],
    deadlines: [
      {
        label: "Credit card billing-error notice",
        description:
          "Under the Fair Credit Billing Act, a written billing-error notice is generally due within 60 days after the statement showing the charge was sent (15 U.S.C. § 1666).",
        verified: false,
      },
      {
        label: "Debit, ACH and app transfers",
        description:
          "Regulation E has reporting timelines for unauthorized transfers, but payments you authorized — even because of fraud — are often not treated as 'unauthorized'. Report anyway, as fast as possible.",
        verified: false,
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// State overlays
// ---------------------------------------------------------------------------

type Overlay = {
  title?: string;
  status?: RuleStatus;
  effectiveDate?: string;
  stateNotes: string[];
  requirements?: string[];
  procedure?: string[];
  extraSignals?: Signal[];
  extraInfo?: InfoNeed[];
  extraUrgency?: UrgencyRule[];
  extraEvidence?: EvidenceItem[];
  sources?: Source[];
  agencies?: Agency[];
  deadlines?: DeadlineNote[];
  professionalReviewAt?: number;
};

const NO_STATE_COERCED =
  "Our content doesn't yet include a coerced-debt statute specific to this state. Federal identity-theft and credit-reporting tools may still apply, and an attorney can tell you whether newer state law covers your situation.";

const OVERLAYS: Record<ModuleState, Record<RemedyId, Overlay>> = {
  CA: {
    coerced_debt: {
      title: "California coerced-debt pathway",
      status: "legal_review",
      effectiveDate: "2025-01-01",
      stateNotes: [
        "California has a specific coerced-debt law (effective January 1, 2025). It lets a survivor notify a creditor that a debt was coerced and, in some situations, ask a court to determine that she isn't liable for it.",
        "Coverage, the documentation the creditor may request, and the creditor's obligations are defined in the statute — confirm the current text before relying on it.",
      ],
      requirements: [
        "A written statement to the creditor that the debt, or part of it, was coerced.",
        "Supporting documentation of the coercion of the kind the statute accepts (for example, a police report, FTC identity theft report, court order, or a statement from a qualified third party) — confirm the accepted list in the official text.",
      ],
      extraInfo: [{ label: "Whether the debt is a type covered by California's coerced-debt law (some debts may be excluded)" }],
      extraEvidence: [
        {
          id: "ca_coerced_statement",
          label: "Written coerced-debt statement to the creditor",
          supports: "The creditor has been formally notified under California's procedure",
          why: "California's procedure starts with notifying the creditor in writing. An attorney or legal-aid advocate can help you prepare it.",
          where: "You prepare it; keep proof of when and how you sent it.",
          weight: 2,
        },
      ],
      sources: [
        {
          kind: "statute",
          title: "California coerced-debt law (SB 975, 2024)",
          citation: "Cal. Civ. Code § 1798.97.1 et seq.",
          url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240SB975",
        },
      ],
      agencies: [
        { name: "California Courts Self-Help Guide", purpose: "Court forms and self-help resources.", url: "https://selfhelp.courts.ca.gov" },
      ],
    },
    contribution_recovery: {
      stateNotes: [
        "California courts have recognized that unmarried partners can enforce express agreements, and agreements implied from conduct, about property and earnings (Marvin v. Marvin, 1976).",
        "California generally gives oral contracts a shorter limitation period than written contracts — dates matter.",
      ],
      sources: [{ kind: "case", title: "Marvin v. Marvin", citation: "18 Cal.3d 660 (1976)" }],
      deadlines: [
        {
          label: "Contract limitation periods (California)",
          description: "Written and oral contracts have different limitation periods (Cal. Code Civ. Proc. §§ 337, 339). Confirm which applies with an attorney.",
          verified: false,
        },
      ],
    },
    shared_obligation: {
      stateNotes: ["California small claims court generally handles claims by individuals up to $12,500 (Cal. Code Civ. Proc. § 116.221). Verify the current limit."],
      sources: [{ kind: "statute", title: "California small claims jurisdictional limit", citation: "Cal. Code Civ. Proc. § 116.221" }],
      agencies: [{ name: "California Courts Self-Help Guide — Small Claims", purpose: "How to file in small claims.", url: "https://selfhelp.courts.ca.gov" }],
      professionalReviewAt: 12500,
    },
    romance_scam: {
      stateNotes: ["California's Department of Financial Protection and Innovation (DFPI) takes complaints about investment and crypto scams."],
      agencies: [{ name: "California DFPI", purpose: "File a complaint about an investment or crypto scam.", url: "https://dfpi.ca.gov" }],
    },
  },

  TX: {
    coerced_debt: {
      stateNotes: [
        NO_STATE_COERCED,
        "Texas identity-theft law includes a process for a court to declare someone a victim of identity theft (Tex. Bus. & Com. Code ch. 521) — ask an attorney whether it fits your facts.",
      ],
      sources: [{ kind: "statute", title: "Texas Identity Theft Enforcement and Protection Act", citation: "Tex. Bus. & Com. Code ch. 521" }],
    },
    contribution_recovery: {
      stateNotes: [
        "Texas's statute of frauds requires certain agreements made in consideration of nonmarital cohabitation to be in writing (Tex. Bus. & Com. Code § 26.01(b)(3)). Whether a written promise exists may be especially important.",
        "Claims that don't depend on the relationship itself — such as a documented loan or business investment — may be analyzed differently.",
      ],
      extraSignals: [{ when: { fact: "promise_made", op: "in", value: ["verbal", "implied"] }, label: "The promise wasn't in writing — Texas's writing requirement may matter" }],
      sources: [{ kind: "statute", title: "Texas statute of frauds", citation: "Tex. Bus. & Com. Code § 26.01(b)(3)" }],
    },
    shared_obligation: {
      stateNotes: ["Texas justice courts hear small claims up to $20,000 (Tex. Gov't Code § 27.031). Verify the current limit."],
      sources: [{ kind: "statute", title: "Texas justice court jurisdiction", citation: "Tex. Gov't Code § 27.031" }],
      agencies: [{ name: "TexasLawHelp.org", purpose: "Free legal information and small-claims guides for Texans.", url: "https://texaslawhelp.org" }],
      professionalReviewAt: 20000,
    },
    romance_scam: {
      stateNotes: ["The Texas State Securities Board investigates investment fraud, including crypto schemes."],
      agencies: [{ name: "Texas State Securities Board", purpose: "Report investment fraud.", url: "https://www.ssb.texas.gov" }],
    },
  },

  NY: {
    coerced_debt: {
      stateNotes: [NO_STATE_COERCED],
      agencies: [{ name: "New York Division of Consumer Protection", purpose: "Identity theft guidance and consumer complaints.", url: "https://dos.ny.gov/consumer-protection" }],
    },
    contribution_recovery: {
      stateNotes: [
        "New York enforces express agreements between unmarried partners, but has declined to imply a contract from the relationship alone (Morone v. Morone, 1980). Evidence of an actual agreement may be especially important.",
        "Unjust-enrichment or constructive-trust theories may still be worth an attorney's review.",
      ],
      extraSignals: [{ when: { fact: "promise_made", op: "eq", value: "implied" }, label: "The agreement was only implied — New York treats implied agreements between partners cautiously" }],
      sources: [{ kind: "case", title: "Morone v. Morone", citation: "50 N.Y.2d 481 (1980)" }],
    },
    shared_obligation: {
      stateNotes: ["New York small claims limits depend on the court — about $10,000 in New York City, $5,000 in other city courts, and $3,000 in town and village courts. Verify current limits."],
      agencies: [{ name: "NY CourtHelp — Small Claims", purpose: "How small claims works in New York.", url: "https://www.nycourts.gov/courthelp/" }],
      professionalReviewAt: 10000,
    },
    romance_scam: {
      stateNotes: ["The New York Attorney General's Investor Protection Bureau takes complaints about investment fraud."],
      agencies: [{ name: "New York Attorney General", purpose: "File an investment-fraud or consumer complaint.", url: "https://ag.ny.gov" }],
    },
  },

  FL: {
    coerced_debt: {
      stateNotes: [NO_STATE_COERCED, "Using someone's personal identifying information without authorization is a crime in Florida (Fla. Stat. § 817.568); a police report may help with creditors."],
      sources: [{ kind: "statute", title: "Florida criminal use of personal identification information", citation: "Fla. Stat. § 817.568" }],
    },
    contribution_recovery: {
      stateNotes: [
        "Florida courts have enforced written agreements between unmarried partners about support and property (for example, Posik v. Layton, 1997).",
        "Without a written agreement, an attorney can evaluate whether unjust enrichment or another theory may apply.",
      ],
      sources: [{ kind: "case", title: "Posik v. Layton", citation: "695 So. 2d 759 (Fla. 5th DCA 1997)" }],
    },
    shared_obligation: {
      stateNotes: ["Florida small claims court handles claims up to $8,000 (Fla. Sm. Cl. R. 7.010). Verify the current limit."],
      sources: [{ kind: "court", title: "Florida Small Claims Rules", citation: "Fla. Sm. Cl. R. 7.010" }],
      professionalReviewAt: 8000,
    },
    romance_scam: {
      stateNotes: ["Florida's Office of Financial Regulation takes complaints about investment fraud."],
      agencies: [{ name: "Florida Office of Financial Regulation", purpose: "Report investment fraud.", url: "https://flofr.gov" }],
    },
  },

  IL: {
    coerced_debt: {
      stateNotes: [NO_STATE_COERCED],
      agencies: [{ name: "Illinois Attorney General — Identity Theft", purpose: "Identity theft hotline and assistance.", url: "https://illinoisattorneygeneral.gov" }],
    },
    contribution_recovery: {
      stateNotes: [
        "Illinois courts have refused to recognize property claims between unmarried partners that arise from the relationship itself (Hewitt v. Hewitt, 1979; Blumenthal v. Brewer, 2016).",
        "Claims that are independent of the relationship — such as a documented loan or a business investment — may be treated differently. Attorney review is strongly recommended before relying on any theory.",
      ],
      extraUrgency: [
        {
          when: { any: [yes("contributed_property", ""), yes("contributed_business", "")] },
          level: "soon",
          label: "Illinois limits relationship-based claims — get attorney review early to identify any independent claim.",
        },
      ],
      sources: [
        { kind: "case", title: "Hewitt v. Hewitt", citation: "77 Ill. 2d 49 (1979)" },
        { kind: "case", title: "Blumenthal v. Brewer", citation: "2016 IL 118781" },
      ],
      professionalReviewAt: 0,
    },
    shared_obligation: {
      stateNotes: ["Illinois small claims court handles claims up to $10,000 (Ill. S. Ct. R. 281). Verify the current limit."],
      sources: [{ kind: "court", title: "Illinois Supreme Court Rule 281", citation: "Ill. S. Ct. R. 281" }],
      agencies: [{ name: "Illinois Legal Aid Online", purpose: "Free legal information and small-claims guides.", url: "https://www.illinoislegalaid.org" }],
      professionalReviewAt: 10000,
    },
    romance_scam: {
      stateNotes: ["The Illinois Secretary of State Securities Department investigates investment fraud."],
      agencies: [{ name: "Illinois Securities Department", purpose: "Report investment fraud.", url: "https://www.ilsos.gov" }],
    },
  },

  US: {
    coerced_debt: { title: "Federal identity-theft & credit-reporting tools", stateNotes: ["We don't have state-specific content for your state yet. These federal tools are available everywhere."] },
    contribution_recovery: { stateNotes: ["We don't have state-specific content for your state yet. State law decides these claims, so attorney review is especially important."] },
    shared_obligation: { stateNotes: ["We don't have state-specific content for your state yet. Your state's small claims limit will determine whether you can file without a lawyer."] },
    romance_scam: { stateNotes: ["We don't have state-specific content for your state yet. Federal reporting channels work in every state."] },
  },
};

export const STATE_NAMES: Record<ModuleState, string> = {
  CA: "California",
  TX: "Texas",
  NY: "New York",
  FL: "Florida",
  IL: "Illinois",
  US: "Federal (all other states)",
};

const DEFAULT_TITLES: Record<RemedyId, string> = {
  coerced_debt: "Coerced debt & identity misuse",
  contribution_recovery: "Contribution recovery review",
  shared_obligation: "Abandoned shared obligations",
  romance_scam: "Romance & investment scam response",
};

function build(state: ModuleState, remedyId: RemedyId): StateRemedyModule {
  const base = BASE[remedyId];
  const o = OVERLAYS[state][remedyId];
  return {
    id: `${state}.${remedyId}`,
    state,
    remedyId,
    version: 1,
    status: o.status ?? "draft",
    title: o.title ?? `${DEFAULT_TITLES[remedyId]}${state === "US" ? "" : ` — ${STATE_NAMES[state]}`}`,
    effectiveDate: o.effectiveDate,
    lastVerified: undefined,
    reviewedBy: null,
    trigger: base.trigger,
    signals: [...base.signals, ...(o.extraSignals ?? [])],
    infoNeeded: [...base.infoNeeded, ...(o.extraInfo ?? [])],
    urgency: [...base.urgency, ...(o.extraUrgency ?? [])],
    stateNotes: o.stateNotes,
    requirements: o.requirements ?? [],
    procedure: o.procedure ?? base.procedure,
    extraEvidence: o.extraEvidence ?? [],
    sources: o.sources ?? [],
    agencies: o.agencies ?? [],
    deadlines: [...base.deadlines, ...(o.deadlines ?? [])],
    professionalReviewAt: o.professionalReviewAt ?? base.professionalReviewAt,
    changelog: [{ version: 1, date: "2026-10-15", note: "Initial draft for MVP. Awaiting attorney review." }],
  };
}

const REMEDY_IDS: RemedyId[] = ["coerced_debt", "contribution_recovery", "shared_obligation", "romance_scam"];

export const MODULES: StateRemedyModule[] = (Object.keys(OVERLAYS) as ModuleState[]).flatMap((s) =>
  REMEDY_IDS.map((r) => build(s, r)),
);

export const MODULE_BY_ID: Record<string, StateRemedyModule> = Object.fromEntries(MODULES.map((m) => [m.id, m]));

export const SUPPORTED_STATES: ModuleState[] = ["CA", "TX", "NY", "FL", "IL"];
