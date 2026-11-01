import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/content/assessment";
import { MODULES } from "@/lib/content/states";
import { analyzeCase, evaluate, matchRemedies, readinessFor, referencedFacts, summarizeLoss } from "@/lib/engine";
import type { FinancialEvent } from "@/lib/types";

const ev = (p: Partial<FinancialEvent> & Pick<FinancialEvent, "category" | "amount">): FinancialEvent => ({
  id: Math.random().toString(36).slice(2),
  description: "",
  evidence: "moderate",
  resolution: "unresolved",
  ...p,
});

describe("three-valued conditions", () => {
  it("treats unanswered and 'unsure' facts as unknown", () => {
    expect(evaluate({ fact: "x", op: "eq", value: "yes" }, {})).toBe("unknown");
    expect(evaluate({ fact: "x", op: "eq", value: "yes" }, { x: "unsure" })).toBe("unknown");
    expect(evaluate({ any: [{ fact: "x", op: "eq", value: "yes" }, { fact: "y", op: "eq", value: "yes" }] }, { y: "yes" })).toBe("true");
    expect(evaluate({ all: [{ fact: "x", op: "eq", value: "yes" }, { fact: "y", op: "eq", value: "no" }] }, { y: "yes" })).toBe("false");
    expect(evaluate({ not: { fact: "x", op: "includes", value: "a" } }, { x: ["b"] })).toBe("true");
  });
});

describe("remedy match", () => {
  it("identifies the California coerced-debt pathway from the spec scenario", () => {
    const answers = {
      state: "CA",
      relationship_type: "dating",
      relationship_status: "ended",
      debt_in_name: "no",
      coerced_borrowing: "yes",
      debt_how: ["threats_or_pressure"],
      debt_type: ["credit_card"],
      debt_on_credit_report: "yes",
      debt_still_open: "yes",
    };
    const ledger = [ev({ category: "card_in_name", amount: 14000, description: "Visa card" })];
    const [m] = matchRemedies(answers, ledger, { includeUnreviewed: true });
    expect(m.moduleId).toBe("CA.coerced_debt");
    expect(m.strength).toBe("strong");
    expect(m.why).toContain("You were pressured or threatened into borrowing");
    expect(m.why).toContain("You described threats, intimidation or pressure");
    expect(m.infoNeeded).toContain("Who currently owns the debt (the original creditor or a collector)");
    expect(m.infoNeeded).toContain("Whether a debt collector is involved");
    expect(m.linkedAmount).toBe(14000);
  });

  it("does not match on unknown facts", () => {
    expect(matchRemedies({ state: "CA", debt_in_name: "unsure" }, [], { includeUnreviewed: true })).toHaveLength(0);
  });

  it("matches from the ledger alone", () => {
    const m = matchRemedies({ state: "NY" }, [ev({ category: "shared_auto", amount: 7900 })], { includeUnreviewed: true });
    expect(m.map((x) => x.moduleId)).toEqual(["NY.shared_obligation"]);
  });

  it("falls back to federal modules for unsupported states", () => {
    const m = matchRemedies({ state: "other", romance_scam: "yes" }, [], { includeUnreviewed: true });
    expect(m[0].moduleId).toBe("US.romance_scam");
  });

  it("serves only published modules when unreviewed content is disabled", () => {
    expect(matchRemedies({ state: "CA", romance_scam: "yes" }, [], { includeUnreviewed: false })).toHaveLength(0);
  });

  it("sorts urgent pathways first", () => {
    const m = matchRemedies(
      { state: "TX", contributed_property: "yes", romance_scam: "yes", last_payment: "under_3d" },
      [ev({ category: "renovation", amount: 50000 })],
      { includeUnreviewed: true },
    );
    expect(m[0].remedyId).toBe("romance_scam");
  });
});

describe("loss & evidence", () => {
  it("totals the ledger by pathway and evidence strength", () => {
    const s = summarizeLoss([
      ev({ category: "card_in_name", amount: 11700, evidence: "strong" }),
      ev({ category: "renovation", amount: 18400, evidence: "moderate" }),
      ev({ category: "shared_auto", amount: 7900, evidence: "strong" }),
      ev({ category: "business_contribution", amount: 12000, evidence: "weak" }),
    ]);
    expect(s.total).toBe(50000);
    expect(s.byRemedy.contribution_recovery).toBe(30400);
    expect(s.byStrength.strong).toBe(19600);
  });

  it("computes weighted readiness and infers statuses from answers", () => {
    const facts = { police_or_ftc_report: "yes" };
    const r0 = readinessFor("coerced_debt", "TX", {}, facts);
    // police/ftc report (weight 2) of 17 total weight (3+3+3+2+2+2+1+1)
    expect(r0.percent).toBe(Math.round((2 / 17) * 100));
    const r1 = readinessFor("coerced_debt", "TX", { "coerced_debt:credit_report": "have", "coerced_debt:account_application": "requested" }, facts);
    expect(r1.percent).toBe(Math.round(((2 + 3 + 1.5) / 17) * 100));
    // CA adds the state statement item
    expect(readinessFor("coerced_debt", "CA", {}, {}).items.some((i) => i.id === "ca_coerced_statement")).toBe(true);
  });
});

describe("recovery plan", () => {
  const caseData = {
    answers: {
      state: "CA",
      relationship_status: "ended",
      safety_concern: "no",
      debt_in_name: "yes",
      debt_how: ["opened_without_knowledge"],
      police_or_ftc_report: "no",
      contributed_property: "yes",
      property_title: "partner_only",
      promise_made: "verbal",
    },
    ledger: [
      ev({ category: "card_in_name", amount: 11700, description: "Chase card" }),
      ev({ category: "property_payment", amount: 24000, description: "Down payment" }),
    ],
    evidence: {},
  };

  it("orders actions and personalizes the first one", () => {
    const a = analyzeCase(caseData, { includeUnreviewed: true });
    expect(a.plan[0].bucket).toBe("do_first");
    expect(a.plan[0].title).toContain("Chase card");
    expect(a.plan.some((p) => p.id === "cd_ftc_report")).toBe(true);
    expect(a.plan.some((p) => p.id === "cd_ca_statement")).toBe(true);
    const pro = a.plan.find((p) => p.id === "pro_contribution_recovery");
    expect(pro?.detail).toContain("$24,000");
    expect(pro?.detail).toContain("ownership was never transferred");
    const order = a.plan.map((p) => p.bucket);
    expect([...order].sort((x, y) => ["do_first", "next", "then", "after", "professional", "lower"].indexOf(x) - ["do_first", "next", "then", "after", "professional", "lower"].indexOf(y))).toEqual(order);
    expect(a.snapshot.impact).toBe(35700);
    expect(a.snapshot.pathways).toBe(2);
  });

  it("drops evidence actions once evidence is in hand", () => {
    const a = analyzeCase({ ...caseData, evidence: { "coerced_debt:credit_report": "have" } }, { includeUnreviewed: true });
    expect(a.plan.some((p) => p.id === "cd_credit_reports")).toBe(false);
  });

  it("puts safety planning first when a safety concern is reported", () => {
    const a = analyzeCase({ ...caseData, answers: { ...caseData.answers, safety_concern: "yes" } }, { includeUnreviewed: true });
    expect(a.plan[0].id).toBe("safety_plan");
  });
});

describe("content integrity", () => {
  const known = new Set([
    ...QUESTIONS.map((q) => q.id),
    "ledger_coerced_debt",
    "ledger_contribution_recovery",
    "ledger_shared_obligation",
    "ledger_romance_scam",
  ]);

  it("every rule references only facts the intake can produce", () => {
    for (const m of MODULES) {
      const facts = [m.trigger, ...m.signals.map((s) => s.when), ...m.urgency.map((u) => u.when)].flatMap(referencedFacts);
      for (const f of facts) expect(known.has(f), `${m.id} references unknown fact ${f}`).toBe(true);
      for (const n of m.infoNeeded) if (n.fact) expect(known.has(n.fact)).toBe(true);
    }
  });

  it("covers 4 remedies × 5 states plus federal fallback, none marked attorney-reviewed", () => {
    expect(MODULES).toHaveLength(24);
    for (const m of MODULES) {
      expect(m.reviewedBy).toBeNull();
      expect(m.deadlines.every((d) => !d.verified)).toBe(true);
    }
  });

  it("question option values used in rules exist", () => {
    const values = new Map(QUESTIONS.map((q) => [q.id, new Set(q.options.map((o) => o.value))]));
    const check = (fact: string, v: unknown) => {
      if (fact.startsWith("ledger_")) return;
      const allowed = values.get(fact)!;
      for (const x of Array.isArray(v) ? v : [v]) expect(allowed.has(String(x)), `${fact}=${x}`).toBe(true);
    };
    const walk = (c: any): void => {
      if (c.fact) return c.value === undefined ? undefined : check(c.fact, c.value);
      (c.all ?? c.any ?? [c.not]).forEach(walk);
    };
    for (const m of MODULES) [m.trigger, ...m.signals.map((s) => s.when), ...m.urgency.map((u) => u.when)].forEach(walk);
  });
});
