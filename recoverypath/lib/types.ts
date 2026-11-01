/**
 * RecoveryPath domain model.
 *
 * The chain this product is built around:
 *   relationship event → financial event → amount → evidence → remedy → action → outcome
 *
 * Everything that decides "what may apply" is deterministic and data-driven
 * (see lib/engine). The Claude layer only explains content defined here.
 */

// ---------------------------------------------------------------------------
// Facts & conditions
// ---------------------------------------------------------------------------

export type FactValue = string | string[] | number | boolean;
export type Facts = Record<string, FactValue | undefined>;

export type Leaf = {
  fact: string;
  op: "eq" | "neq" | "in" | "includes" | "includesAny" | "answered" | "gte" | "lte";
  value?: FactValue;
  /** Human-readable reason shown in "Why it appeared" when this leaf is true. */
  label?: string;
};

export type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }
  | Leaf;

/** Three-valued logic: a condition over facts the user hasn't answered is "unknown". */
export type Truth = "true" | "false" | "unknown";

// ---------------------------------------------------------------------------
// Assessment
// ---------------------------------------------------------------------------

export type Option = { value: string; label: string; hint?: string };

export type Question = {
  id: string;
  section: SectionId;
  prompt: string;
  help?: string;
  kind: "single" | "multi" | "select";
  options: Option[];
  showIf?: Condition;
};

export type SectionId = "about" | "debt" | "property" | "shared" | "scam";

// ---------------------------------------------------------------------------
// Remedies & state rules (the State Remedy Knowledge Graph)
// ---------------------------------------------------------------------------

export type RemedyId = "coerced_debt" | "contribution_recovery" | "shared_obligation" | "romance_scam";

/** "US" = federal-only fallback used for states without state-specific content. */
export type StateCode = "CA" | "TX" | "NY" | "FL" | "IL" | "US";

export type RuleStatus = "draft" | "legal_review" | "approved" | "published" | "retired";

export type Source = {
  title: string;
  citation?: string;
  url?: string;
  kind: "statute" | "case" | "agency" | "regulation" | "court";
};

export type Agency = { name: string; purpose: string; url?: string; phone?: string };

export type DeadlineNote = {
  label: string;
  description: string;
  /** False until verified against an official source and attorney reviewed. */
  verified: boolean;
};

export type EvidenceItem = {
  id: string;
  label: string;
  /** The requirement/element this evidence supports (Evidence Graph: remedy → element → evidence). */
  supports: string;
  why: string;
  where: string;
  /** 1 (helpful) – 3 (core). Used by Evidence Readiness. */
  weight: 1 | 2 | 3;
};

export type Remedy = {
  id: RemedyId;
  name: string;
  shortName: string;
  userLabel: string;
  summary: string;
  evidence: EvidenceItem[];
  baseSources: Source[];
  baseAgencies: Agency[];
  attorneyQuestions: string[];
};

export type Signal = { when: Condition; label: string };
export type InfoNeed = { fact?: string; label: string };
export type UrgencyRule = { when: Condition; level: "urgent" | "soon"; label: string };

/**
 * One versioned state × remedy module. Published modules are immutable:
 * a change produces a new version (see supabase/migrations legal_rule_versions).
 */
export type StateRemedyModule = {
  id: string; // e.g. "CA.coerced_debt"
  state: StateCode;
  remedyId: RemedyId;
  version: number;
  status: RuleStatus;
  title: string;
  effectiveDate?: string;
  lastVerified?: string;
  reviewedBy?: string | null;
  trigger: Condition;
  signals: Signal[];
  infoNeeded: InfoNeed[];
  urgency: UrgencyRule[];
  /** Plain-language, state-specific screening notes. Never a legal conclusion. */
  stateNotes: string[];
  requirements: string[];
  procedure: string[];
  extraEvidence: EvidenceItem[];
  sources: Source[];
  agencies: Agency[];
  deadlines: DeadlineNote[];
  /** Matching ledger amounts at or above this trigger a professional-review recommendation. */
  professionalReviewAt?: number;
  changelog: { version: number; date: string; note: string }[];
};

// ---------------------------------------------------------------------------
// User case data
// ---------------------------------------------------------------------------

export type LedgerCategory =
  | "card_in_name"
  | "loan_in_name"
  | "account_misuse"
  | "property_payment"
  | "renovation"
  | "business_contribution"
  | "shared_lease"
  | "shared_auto"
  | "shared_loan"
  | "shared_utilities"
  | "scam_transfer"
  | "scam_crypto"
  | "scam_giftcards"
  | "other";

export type EvidenceStrength = "strong" | "moderate" | "weak" | "none";

/** Phase-2 Recovery Tracker field — stored from day one. */
export type ResolutionStatus = "unresolved" | "disputed" | "attorney_review" | "resolved";

export type FinancialEvent = {
  id: string;
  category: LedgerCategory;
  description: string;
  amount: number;
  date?: string;
  evidence: EvidenceStrength;
  resolution: ResolutionStatus;
};

export type EvidenceStatus = "have" | "requested" | "not_requested" | "unavailable";

export type ActionStatus = "todo" | "in_progress" | "done";

export type DocumentMeta = {
  id: string;
  name: string;
  size: number;
  type: string;
  category: string; // evidence item id or "uncategorized"
  addedAt: string;
};

export type Entitlement = "free" | "plan" | "passport";

export type CaseState = {
  schema: 1;
  answers: Facts;
  ledger: FinancialEvent[];
  evidence: Record<string, EvidenceStatus>; // key: `${remedyId}:${evidenceId}`
  actions: Record<string, ActionStatus>;
  documents: DocumentMeta[];
  entitlement: Entitlement;
  rememberDevice: boolean;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Engine outputs
// ---------------------------------------------------------------------------

export type RemedyMatch = {
  remedyId: RemedyId;
  moduleId: string;
  moduleVersion: number;
  moduleStatus: RuleStatus;
  strength: "strong" | "possible" | "needs_info";
  why: string[];
  infoNeeded: string[];
  urgency: { level: "urgent" | "soon"; label: string }[];
  linkedAmount: number;
  linkedEvents: number;
};

export type EvidenceReadiness = {
  remedyId: RemedyId;
  percent: number;
  items: (EvidenceItem & { status: EvidenceStatus; key: string })[];
  missing: number;
};

export type PlanBucket = "do_first" | "next" | "then" | "after" | "professional" | "lower";

export type PlanAction = {
  id: string;
  bucket: PlanBucket;
  title: string;
  detail: string;
  remedyId?: RemedyId;
  evidenceKey?: string;
};
