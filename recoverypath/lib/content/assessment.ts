import type { Question, SectionId } from "../types";

/**
 * Guided Financial Harm Check.
 *
 * Asks what HAPPENED, never which legal remedy the user wants. Fact ids here
 * are the vocabulary the rules engine (lib/content/states.ts) reasons over —
 * renaming one is a rule change and needs a new module version.
 */

const YES_NO_UNSURE = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "I'm not sure" },
];
const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const SECTIONS: { id: SectionId; title: string; intro: string }[] = [
  { id: "about", title: "About you", intro: "A few basics so we can show options for the right state." },
  { id: "debt", title: "Debt in your name", intro: "Accounts, loans or cards connected to you." },
  { id: "property", title: "Money you put in", intro: "Contributions to a partner's home, property or business." },
  { id: "shared", title: "Shared obligations", intro: "Leases, loans and bills you share." },
  { id: "scam", title: "Online romance or investment", intro: "Money sent to someone you met or talked to online." },
];

export const STATES = [
  { value: "CA", label: "California" },
  { value: "FL", label: "Florida" },
  { value: "IL", label: "Illinois" },
  { value: "NY", label: "New York" },
  { value: "TX", label: "Texas" },
  { value: "other", label: "Another state" },
];

export const QUESTIONS: Question[] = [
  // ---- About -------------------------------------------------------------
  {
    id: "state",
    section: "about",
    prompt: "What state did this happen in?",
    help: "If it happened in more than one place, choose where you live now. Remedies are state-specific.",
    kind: "select",
    options: STATES,
  },
  {
    id: "relationship_type",
    section: "about",
    prompt: "What best describes the relationship?",
    kind: "single",
    options: [
      { value: "dating", label: "Dating, not living together" },
      { value: "cohabiting", label: "Living together, not married" },
      { value: "engaged", label: "Engaged" },
      { value: "online", label: "Online only — we never met in person" },
      { value: "married", label: "Married", hint: "Divorce courts handle most married-couple finances; some options here may still help." },
    ],
  },
  {
    id: "relationship_status",
    section: "about",
    prompt: "Where are things now?",
    kind: "single",
    options: [
      { value: "ended", label: "It has ended" },
      { value: "ending", label: "I'm in the process of leaving" },
      { value: "ongoing", label: "We're still together" },
    ],
  },
  {
    id: "safety_concern",
    section: "about",
    prompt: "Do you have any concerns for your safety right now?",
    help: "This only changes what resources we show you. You can skip it.",
    kind: "single",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "prefer_not", label: "Prefer not to say" },
    ],
  },

  // ---- Debt in your name -------------------------------------------------
  {
    id: "debt_in_name",
    section: "debt",
    prompt: "Did someone open or use an account in your name?",
    help: "Credit cards, loans, phone or utility accounts — opened, used or added to without your real agreement.",
    kind: "single",
    options: YES_NO_UNSURE,
  },
  {
    id: "coerced_borrowing",
    section: "debt",
    prompt: "Were you pressured or threatened into borrowing money or signing for credit?",
    kind: "single",
    options: YES_NO_UNSURE,
  },
  {
    id: "debt_how",
    section: "debt",
    prompt: "Which of these describe what happened? Choose all that apply.",
    kind: "multi",
    options: [
      { value: "opened_without_knowledge", label: "An account was opened without my knowledge" },
      { value: "used_without_permission", label: "My card or account was used without permission" },
      { value: "threats_or_pressure", label: "I signed because of threats, intimidation or pressure" },
      { value: "deceived", label: "I agreed, but was lied to about what it was for" },
      { value: "control_of_finances", label: "They controlled my money, mail or passwords" },
    ],
    showIf: { any: [{ fact: "debt_in_name", op: "eq", value: "yes" }, { fact: "coerced_borrowing", op: "eq", value: "yes" }] },
  },
  {
    id: "debt_type",
    section: "debt",
    prompt: "What kind of debt is it?",
    kind: "multi",
    options: [
      { value: "credit_card", label: "Credit card" },
      { value: "personal_loan", label: "Personal loan" },
      { value: "auto_loan", label: "Auto loan" },
      { value: "utility_phone", label: "Phone, internet or utility" },
      { value: "mortgage", label: "Mortgage or home loan" },
      { value: "other", label: "Something else" },
    ],
    showIf: { any: [{ fact: "debt_in_name", op: "eq", value: "yes" }, { fact: "coerced_borrowing", op: "eq", value: "yes" }] },
  },
  {
    id: "debt_on_credit_report",
    section: "debt",
    prompt: "Does it appear on your credit report?",
    kind: "single",
    options: YES_NO_UNSURE,
    showIf: { any: [{ fact: "debt_in_name", op: "eq", value: "yes" }, { fact: "coerced_borrowing", op: "eq", value: "yes" }] },
  },
  {
    id: "debt_still_open",
    section: "debt",
    prompt: "Is the account still open?",
    kind: "single",
    options: YES_NO_UNSURE,
    showIf: { any: [{ fact: "debt_in_name", op: "eq", value: "yes" }, { fact: "coerced_borrowing", op: "eq", value: "yes" }] },
  },
  {
    id: "debt_in_collections",
    section: "debt",
    prompt: "Has it gone to collections, or are you being contacted by a debt collector?",
    kind: "single",
    options: YES_NO_UNSURE,
    showIf: { any: [{ fact: "debt_in_name", op: "eq", value: "yes" }, { fact: "coerced_borrowing", op: "eq", value: "yes" }] },
  },
  {
    id: "police_or_ftc_report",
    section: "debt",
    prompt: "Have you filed a police report or an FTC identity theft report about it?",
    kind: "single",
    options: YES_NO,
    showIf: { any: [{ fact: "debt_in_name", op: "eq", value: "yes" }, { fact: "coerced_borrowing", op: "eq", value: "yes" }] },
  },

  // ---- Property & business -----------------------------------------------
  {
    id: "contributed_property",
    section: "property",
    prompt: "Did you contribute money toward a home or property you don't own (or don't fully own)?",
    help: "Down payment, mortgage payments, renovations, repairs, furniture or appliances.",
    kind: "single",
    options: YES_NO,
  },
  {
    id: "property_title",
    section: "property",
    prompt: "Whose name is the property in?",
    kind: "single",
    options: [
      { value: "partner_only", label: "Only my partner's" },
      { value: "joint", label: "Both of ours" },
      { value: "unsure", label: "I'm not sure" },
    ],
    showIf: { fact: "contributed_property", op: "eq", value: "yes" },
  },
  {
    id: "contributed_business",
    section: "property",
    prompt: "Did you put money, unpaid work or credit into your partner's business?",
    kind: "single",
    options: YES_NO,
  },
  {
    id: "promise_made",
    section: "property",
    prompt: "Was repayment or ownership promised?",
    kind: "single",
    options: [
      { value: "written", label: "Yes — in writing (including texts or email)" },
      { value: "verbal", label: "Yes — verbally" },
      { value: "implied", label: "It was understood, but never said directly" },
      { value: "no", label: "No" },
    ],
    showIf: { any: [{ fact: "contributed_property", op: "eq", value: "yes" }, { fact: "contributed_business", op: "eq", value: "yes" }] },
  },
  {
    id: "contribution_documented",
    section: "property",
    prompt: "Can you show the payments — bank transfers, receipts, cancelled checks?",
    kind: "single",
    options: [
      { value: "yes", label: "Yes, most of them" },
      { value: "partial", label: "Some of them" },
      { value: "no", label: "Not really" },
    ],
    showIf: { any: [{ fact: "contributed_property", op: "eq", value: "yes" }, { fact: "contributed_business", op: "eq", value: "yes" }] },
  },

  // ---- Shared obligations ------------------------------------------------
  {
    id: "shared_obligation",
    section: "shared",
    prompt: "Did your partner stop paying a shared loan, lease or bill?",
    kind: "single",
    options: YES_NO,
  },
  {
    id: "obligation_type",
    section: "shared",
    prompt: "Which obligations?",
    kind: "multi",
    options: [
      { value: "lease", label: "Apartment or house lease" },
      { value: "auto_loan", label: "Car loan or lease" },
      { value: "personal_loan", label: "Personal loan or credit line" },
      { value: "phone_plan", label: "Phone plan" },
      { value: "utilities", label: "Utilities" },
    ],
    showIf: { fact: "shared_obligation", op: "eq", value: "yes" },
  },
  {
    id: "obligation_role",
    section: "shared",
    prompt: "How are you on the account?",
    kind: "single",
    options: [
      { value: "co_borrower", label: "Co-signer or co-borrower" },
      { value: "joint_lease", label: "We're both on the lease" },
      { value: "mine_only", label: "It's only in my name, but it was for both of us" },
      { value: "unsure", label: "I'm not sure" },
    ],
    showIf: { fact: "shared_obligation", op: "eq", value: "yes" },
  },
  {
    id: "partner_kept_asset",
    section: "shared",
    prompt: "Did your partner keep the thing the debt paid for — like the car?",
    kind: "single",
    options: YES_NO,
    showIf: { fact: "shared_obligation", op: "eq", value: "yes" },
  },
  {
    id: "payments_missed",
    section: "shared",
    prompt: "Are payments currently being missed?",
    kind: "single",
    options: YES_NO_UNSURE,
    showIf: { fact: "shared_obligation", op: "eq", value: "yes" },
  },

  // ---- Romance / investment scam -----------------------------------------
  {
    id: "romance_scam",
    section: "scam",
    prompt: "Did you send money to someone you met romantically online?",
    help: "Including money sent for an emergency, travel, a visa, or an investment they recommended.",
    kind: "single",
    options: YES_NO,
  },
  {
    id: "never_met",
    section: "scam",
    prompt: "Have you ever met this person in person?",
    kind: "single",
    options: [
      { value: "never", label: "No, never" },
      { value: "met", label: "Yes" },
    ],
    showIf: { fact: "romance_scam", op: "eq", value: "yes" },
  },
  {
    id: "payment_method",
    section: "scam",
    prompt: "How did you send the money? Choose all that apply.",
    kind: "multi",
    options: [
      { value: "wire", label: "Bank wire" },
      { value: "p2p", label: "Zelle, Venmo, Cash App or PayPal" },
      { value: "crypto", label: "Cryptocurrency or a crypto ATM" },
      { value: "gift_cards", label: "Gift cards" },
      { value: "credit_card", label: "Credit or debit card" },
      { value: "cash_check", label: "Cash, check or courier" },
    ],
    showIf: { fact: "romance_scam", op: "eq", value: "yes" },
  },
  {
    id: "investment_platform",
    section: "scam",
    prompt: "Did they get you to invest through an app or trading website?",
    kind: "single",
    options: YES_NO_UNSURE,
    showIf: { fact: "romance_scam", op: "eq", value: "yes" },
  },
  {
    id: "last_payment",
    section: "scam",
    prompt: "When did you send the most recent payment?",
    kind: "single",
    options: [
      { value: "under_3d", label: "In the last 3 days" },
      { value: "under_30d", label: "In the last 30 days" },
      { value: "under_6m", label: "1–6 months ago" },
      { value: "under_1y", label: "6–12 months ago" },
      { value: "over_1y", label: "More than a year ago" },
    ],
    showIf: { fact: "romance_scam", op: "eq", value: "yes" },
  },
  {
    id: "scam_reported",
    section: "scam",
    prompt: "Who have you reported it to?",
    kind: "multi",
    options: [
      { value: "bank", label: "My bank or payment app" },
      { value: "ic3", label: "FBI (IC3)" },
      { value: "ftc", label: "FTC" },
      { value: "police", label: "Local police" },
      { value: "none", label: "No one yet" },
    ],
    showIf: { fact: "romance_scam", op: "eq", value: "yes" },
  },
  {
    id: "still_in_contact",
    section: "scam",
    prompt: "Are you still in contact, or being asked for more money (including fees to 'recover' your funds)?",
    kind: "single",
    options: YES_NO,
    showIf: { fact: "romance_scam", op: "eq", value: "yes" },
  },
];

export const QUESTION_BY_ID = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

/** Entry points from the homepage "What happened?" chips. Each pre-answers one gateway fact. */
export const ENTRY_POINTS = [
  { id: "debt", label: "Debt was put in my name", preset: { debt_in_name: "yes" } },
  { id: "property", label: "I put money into his house or business", preset: {} },
  { id: "shared", label: "He left me with shared debt", preset: { shared_obligation: "yes" } },
  { id: "scam", label: "I lost money through a romance/investment scam", preset: { romance_scam: "yes" } },
  { id: "unsure", label: "I'm not sure", preset: {} },
] as const;
