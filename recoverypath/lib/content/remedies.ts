import type { Agency, LedgerCategory, Remedy, RemedyId, Source } from "../types";

/**
 * Remedy library (MVP: 4 of the 12 planned pathways).
 *
 * Content here is general and federal. State-specific overlays live in
 * states.ts. Nothing in this file is a legal conclusion; every user-facing
 * string is phrased as "may", "worth investigating" or "ask an attorney".
 */

const FTC_IDTHEFT: Agency = {
  name: "FTC — IdentityTheft.gov",
  purpose: "Create an FTC Identity Theft Report and a personalized recovery plan.",
  url: "https://www.identitytheft.gov",
};
const ANNUAL_CREDIT_REPORT: Agency = {
  name: "AnnualCreditReport.com",
  purpose: "The official site for free credit reports from Equifax, Experian and TransUnion.",
  url: "https://www.annualcreditreport.com",
};
const CFPB: Agency = {
  name: "Consumer Financial Protection Bureau",
  purpose: "Submit a complaint about a creditor, bank, credit bureau or debt collector.",
  url: "https://www.consumerfinance.gov/complaint/",
};
const IC3: Agency = {
  name: "FBI Internet Crime Complaint Center (IC3)",
  purpose: "Report internet-enabled fraud, including romance and investment scams.",
  url: "https://www.ic3.gov",
};
const FTC_FRAUD: Agency = {
  name: "FTC — ReportFraud.ftc.gov",
  purpose: "Report the scam so it is shared with law enforcement.",
  url: "https://reportfraud.ftc.gov",
};
const LEGAL_AID: Agency = {
  name: "LawHelp.org",
  purpose: "Find free and low-cost legal aid organizations in your state.",
  url: "https://www.lawhelp.org",
};

const FCRA_605B: Source = {
  kind: "statute",
  title: "Fair Credit Reporting Act — block of information resulting from identity theft",
  citation: "15 U.S.C. § 1681c-2 (FCRA § 605B)",
  url: "https://www.law.cornell.edu/uscode/text/15/1681c-2",
};
const FCRA_611: Source = {
  kind: "statute",
  title: "Fair Credit Reporting Act — procedure in case of disputed accuracy",
  citation: "15 U.S.C. § 1681i (FCRA § 611)",
  url: "https://www.law.cornell.edu/uscode/text/15/1681i",
};
const FDCPA_809: Source = {
  kind: "statute",
  title: "Fair Debt Collection Practices Act — validation of debts",
  citation: "15 U.S.C. § 1692g",
  url: "https://www.law.cornell.edu/uscode/text/15/1692g",
};
const FCBA: Source = {
  kind: "statute",
  title: "Fair Credit Billing Act — correction of billing errors",
  citation: "15 U.S.C. § 1666",
  url: "https://www.law.cornell.edu/uscode/text/15/1666",
};
const REG_E: Source = {
  kind: "regulation",
  title: "Regulation E (Electronic Fund Transfer Act) — error resolution",
  citation: "12 C.F.R. part 1005",
  url: "https://www.consumerfinance.gov/rules-policy/regulations/1005/",
};

export const REMEDIES: Record<RemedyId, Remedy> = {
  coerced_debt: {
    id: "coerced_debt",
    name: "Coerced debt & identity misuse",
    shortName: "Coerced debt",
    userLabel: "Debt put in your name",
    summary:
      "When a partner opens accounts in your name, uses your credit without permission, or forces or tricks you into borrowing, there may be ways to dispute the debt with the creditor, block it from your credit report, and in some states use a specific coerced-debt procedure.",
    evidence: [
      { id: "credit_report", label: "Credit reports (all three bureaus)", supports: "The debt exists and is reported under your name", why: "Shows exactly which accounts are attributed to you, when they were opened and their current status.", where: "Free at AnnualCreditReport.com.", weight: 3 },
      { id: "account_application", label: "Account application / opening records", supports: "How the account was created and authorized", why: "May help establish how the account was opened, from what device, address or phone, and who signed.", where: "Request in writing from the creditor or account issuer. Keep a copy of your request.", weight: 3 },
      { id: "coercion_communications", label: "Messages showing pressure, threats or control", supports: "The debt was coerced, not freely agreed to", why: "Texts, emails, voicemails or social-media messages can corroborate threats, pressure, or control over your finances.", where: "Your phone, email and social accounts. Export or screenshot with dates visible.", weight: 3 },
      { id: "account_statements", label: "Account statements", supports: "How the account was used and who benefited", why: "Purchases, cash advances or transfers can show the money benefited someone else.", where: "The creditor's online portal or by written request.", weight: 2 },
      { id: "police_or_ftc_report", label: "FTC Identity Theft Report or police report", supports: "Third-party documentation of the misuse", why: "Often requested by creditors and credit bureaus before they block or remove identity-theft debt.", where: "IdentityTheft.gov for an FTC report; your local police department for a police report.", weight: 2 },
      { id: "creditor_correspondence", label: "Creditor and collector correspondence", supports: "What the creditor has been told and has demanded", why: "Collection letters and notices show who currently owns the debt and any response deadlines.", where: "Your mail and email. Ask collectors for a validation notice.", weight: 2 },
      { id: "payment_history", label: "Payment history", supports: "Who paid what, and when", why: "Shows whether you made payments under pressure or the partner paid at times.", where: "Account statements and your bank records.", weight: 1 },
      { id: "third_party_statement", label: "Protective order, advocate letter or other third-party statement", supports: "Corroboration of abuse or coercion", why: "Some procedures accept documentation from a court, advocate, or professional.", where: "Court records, a domestic-violence advocate, counselor or medical provider.", weight: 1 },
    ],
    baseSources: [FCRA_605B, FCRA_611, FDCPA_809],
    baseAgencies: [ANNUAL_CREDIT_REPORT, FTC_IDTHEFT, CFPB, LEGAL_AID],
    attorneyQuestions: [
      "Does my situation fit my state's coerced-debt or identity-theft procedures, and which one should I use first?",
      "Who currently owns this debt, and does that change my options?",
      "Is any of this debt secured by property (for example a car), and what happens to the collateral?",
      "Are there claims against the former partner directly for the amount of the debt?",
    ],
  },

  contribution_recovery: {
    id: "contribution_recovery",
    name: "Money contributed to a partner's property or business",
    shortName: "Property & business contributions",
    userLabel: "Money you put into his house or business",
    summary:
      "Unmarried partners usually don't get the property-division rules that apply in divorce. Depending on the state and the facts, claims based on an agreement, unjust enrichment, or ownership interest may be worth an attorney's review.",
    evidence: [
      { id: "payment_records", label: "Proof of each payment", supports: "You actually contributed the money", why: "Bank transfers, cancelled checks and card statements tie specific amounts to specific dates.", where: "Your bank and card statements; request older statements from the bank.", weight: 3 },
      { id: "promise_evidence", label: "Evidence of a promise or agreement", supports: "Repayment or ownership was promised or understood", why: "Many contribution claims turn on whether there was an agreement. Texts and emails can show one.", where: "Your messages, emails, notes, and anyone the promise was made in front of.", weight: 3 },
      { id: "ownership_records", label: "Deed, title or business registration", supports: "Who legally owns the property or business", why: "Shows whose name the asset is in and when it was acquired.", where: "County recorder (deeds), DMV (vehicles), Secretary of State (business filings).", weight: 2 },
      { id: "receipts_invoices", label: "Receipts and invoices for improvements", supports: "What your money paid for", why: "Connects your payments to improvements, inventory or equipment that benefited the partner.", where: "Contractors, stores, your email receipts.", weight: 2 },
      { id: "valuation", label: "Value before and after", supports: "The benefit the partner kept", why: "An appraisal, listing or valuation can show the property or business gained value.", where: "Appraisers, real-estate listings, tax assessments, business financials.", weight: 1 },
      { id: "witnesses", label: "List of people who knew about the arrangement", supports: "Corroboration of the agreement", why: "Friends, family or business contacts who heard the promise or saw your work.", where: "Write down names, contact details and what each person knows.", weight: 1 },
    ],
    baseSources: [],
    baseAgencies: [LEGAL_AID],
    attorneyQuestions: [
      "Does my state recognize claims between unmarried partners based on an express, implied or oral agreement?",
      "Is unjust enrichment, a constructive or resulting trust, or a partnership claim worth pursuing on these facts?",
      "Which limitation period applies to each contribution, and has any started running?",
      "Is the amount high enough that litigation costs make sense, or is small claims an option?",
    ],
  },

  shared_obligation: {
    id: "shared_obligation",
    name: "Abandoned shared obligations",
    shortName: "Shared debt left behind",
    userLabel: "Shared debt he left you with",
    summary:
      "When a co-borrower or co-tenant stops paying, the creditor can usually still collect from you — but you may be able to limit further damage and seek repayment of his share from him, sometimes in small claims court.",
    evidence: [
      { id: "signed_agreement", label: "The signed lease or loan agreement", supports: "Who is obligated, and on what terms", why: "Shows who signed and what each person agreed to.", where: "Your records, the landlord, lender or dealership.", weight: 3 },
      { id: "shared_payment_history", label: "Month-by-month payment history", supports: "Who paid, and how much you paid beyond your share", why: "The basis for calculating what he owes you.", where: "Lender/landlord ledger, your bank statements.", weight: 3 },
      { id: "payment_agreement", label: "Messages about splitting payments", supports: "There was an agreement to share the cost", why: "Shows the understanding about who would pay what.", where: "Texts, emails, payment-app memos.", weight: 2 },
      { id: "default_notices", label: "Late or default notices", supports: "Current status and urgency", why: "Shows deadlines and the risk of credit damage, repossession or eviction.", where: "Your mail and email; the creditor's portal.", weight: 2 },
      { id: "asset_possession", label: "Proof of who has the asset", supports: "He kept the benefit of the debt", why: "If he kept the car or the apartment, that matters to fairness and to some remedies.", where: "Registration, messages, photos, insurance records.", weight: 1 },
    ],
    baseSources: [],
    baseAgencies: [CFPB, LEGAL_AID],
    attorneyQuestions: [
      "Can I recover what I paid beyond my share from my former partner, and in which court?",
      "Can I be released from the lease or loan, or refinance it into his name alone?",
      "What happens to the vehicle or property if payments stop?",
    ],
  },

  romance_scam: {
    id: "romance_scam",
    name: "Romance & investment scam losses",
    shortName: "Romance/investment scam",
    userLabel: "Money lost to a romance or investment scam",
    summary:
      "Recovery depends heavily on how the money was sent and how fast it is reported. Banks, card issuers and payment apps have dispute and fraud processes; reports to the FBI and FTC create a record. Beware of anyone offering to recover your money for a fee.",
    evidence: [
      { id: "transaction_records", label: "Record of every payment", supports: "What was sent, how, when and to whom", why: "Needed for bank disputes, law-enforcement reports and any later recovery.", where: "Bank and app statements, wire confirmations, crypto transaction IDs, gift-card receipts and card numbers.", weight: 3 },
      { id: "conversation_logs", label: "Full conversation history", supports: "How you were deceived into sending money", why: "Shows the false story, the requests for money and the promises made.", where: "Export chats from dating apps, social media, WhatsApp, Telegram, email.", weight: 3 },
      { id: "scammer_identifiers", label: "Their profiles, usernames and numbers", supports: "Who received the money", why: "Helps investigators and platforms link your report to others.", where: "Screenshots of profiles, phone numbers, email addresses, photos they sent.", weight: 2 },
      { id: "platform_details", label: "Investment site, app or wallet details", supports: "Where the money went", why: "Website addresses, app names and wallet addresses can be traced and reported.", where: "Your browser history, app store, crypto exchange records.", weight: 2 },
      { id: "report_numbers", label: "Report and claim numbers", supports: "You reported promptly", why: "Banks and agencies ask for these; they also prove the date you reported.", where: "IC3 and FTC confirmation emails, your bank's claim reference.", weight: 2 },
      { id: "bank_dispute_records", label: "Bank or card dispute correspondence", supports: "The status of any dispute", why: "Tracks responses and deadlines for appeals.", where: "Your bank's letters, secure messages and email.", weight: 1 },
    ],
    baseSources: [FCBA, REG_E],
    baseAgencies: [IC3, FTC_FRAUD, CFPB],
    attorneyQuestions: [
      "Is there any realistic path to recover funds from the receiving bank, exchange or platform?",
      "Did my bank or payment app handle my dispute correctly?",
      "Are there tax consequences for these losses?",
    ],
  },
};

export const REMEDY_ORDER: RemedyId[] = ["coerced_debt", "contribution_recovery", "shared_obligation", "romance_scam"];

// ---------------------------------------------------------------------------
// Financial ledger categories → pathway (Financial Harm Graph)
// ---------------------------------------------------------------------------

export const LEDGER_CATEGORIES: { id: LedgerCategory; label: string; remedyId: RemedyId | null; example: string }[] = [
  { id: "card_in_name", label: "Credit card in my name", remedyId: "coerced_debt", example: "Card he opened or ran up" },
  { id: "loan_in_name", label: "Loan in my name", remedyId: "coerced_debt", example: "Personal or auto loan I was pressured into" },
  { id: "account_misuse", label: "Other account misused", remedyId: "coerced_debt", example: "Phone or utility account" },
  { id: "property_payment", label: "Payments toward his home", remedyId: "contribution_recovery", example: "Down payment, mortgage payments" },
  { id: "renovation", label: "Renovations or repairs", remedyId: "contribution_recovery", example: "Kitchen remodel, new roof" },
  { id: "business_contribution", label: "Money into his business", remedyId: "contribution_recovery", example: "Startup costs, inventory, loans" },
  { id: "shared_lease", label: "Shared lease", remedyId: "shared_obligation", example: "Rent he stopped paying" },
  { id: "shared_auto", label: "Shared car loan", remedyId: "shared_obligation", example: "Car he kept" },
  { id: "shared_loan", label: "Shared loan or credit line", remedyId: "shared_obligation", example: "Joint personal loan" },
  { id: "shared_utilities", label: "Shared bills", remedyId: "shared_obligation", example: "Utilities, phone plan" },
  { id: "scam_transfer", label: "Money sent to a scammer", remedyId: "romance_scam", example: "Wire, Zelle, cash" },
  { id: "scam_crypto", label: "Crypto or 'investment' losses", remedyId: "romance_scam", example: "Trading app, crypto ATM" },
  { id: "scam_giftcards", label: "Gift cards", remedyId: "romance_scam", example: "Gift cards sent as payment" },
  { id: "other", label: "Something else", remedyId: null, example: "Any other loss" },
];

export const CATEGORY_REMEDY: Record<LedgerCategory, RemedyId | null> = Object.fromEntries(
  LEDGER_CATEGORIES.map((c) => [c.id, c.remedyId]),
) as Record<LedgerCategory, RemedyId | null>;

// ---------------------------------------------------------------------------
// Glossary — the only terms the explanation layer will define.
// ---------------------------------------------------------------------------

export const GLOSSARY: Record<string, string> = {
  "coerced debt":
    "Debt someone incurred in your name, or forced you to take on, through threats, pressure, deception or control in a relationship.",
  "unjust enrichment":
    "A legal idea that someone who received a benefit at another person's expense, in circumstances where keeping it would be unfair, may have to pay it back.",
  "constructive trust":
    "A remedy where a court treats property legally owned by one person as held, at least partly, for another person who paid for it.",
  "co-borrower":
    "A person who signed a loan and is equally responsible for repaying all of it — not just half.",
  "small claims court":
    "A simplified court for lower-value disputes, usually without lawyers. Each state sets its own maximum amount.",
  "statute of limitations":
    "The deadline for starting a lawsuit. It differs by state and by type of claim, and missing it can end a claim.",
  "chargeback":
    "Reversing a card payment through your card issuer, usually after a dispute about the charge.",
  "debt validation":
    "A debt collector's written explanation of the amount owed and to whom, which you can request and dispute.",
  "identity theft report":
    "A report, such as one made at IdentityTheft.gov or to police, describing accounts opened or used without your permission.",
};
