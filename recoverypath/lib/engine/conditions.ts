import type { Condition, Facts, FactValue, Leaf, Truth } from "../types";

/** Answers that mean "I don't know" are treated as unknown, not false. */
const UNKNOWN_VALUES = new Set(["unsure", "prefer_not"]);

function isLeaf(c: Condition): c is Leaf {
  return (c as Leaf).fact !== undefined;
}

function present(v: FactValue | undefined): v is FactValue {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v !== "" && !UNKNOWN_VALUES.has(v);
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function evalLeaf(leaf: Leaf, facts: Facts): Truth {
  const v = facts[leaf.fact];
  if (leaf.op === "answered") return present(v) ? "true" : "false";
  if (!present(v)) return "unknown";
  const target = leaf.value;
  switch (leaf.op) {
    case "eq":
      return v === target ? "true" : "false";
    case "neq":
      return v !== target ? "true" : "false";
    case "in":
      return Array.isArray(target) && target.includes(v as string) ? "true" : "false";
    case "includes":
      return Array.isArray(v) && v.includes(target as string) ? "true" : "false";
    case "includesAny":
      return Array.isArray(v) && Array.isArray(target) && v.some((x) => target.includes(x)) ? "true" : "false";
    case "gte":
      return Number(v) >= Number(target) ? "true" : "false";
    case "lte":
      return Number(v) <= Number(target) ? "true" : "false";
  }
}

/** Kleene three-valued evaluation. Deterministic and side-effect free. */
export function evaluate(c: Condition, facts: Facts): Truth {
  if (isLeaf(c)) return evalLeaf(c, facts);
  if ("all" in c) {
    let unknown = false;
    for (const sub of c.all) {
      const t = evaluate(sub, facts);
      if (t === "false") return "false";
      if (t === "unknown") unknown = true;
    }
    return unknown ? "unknown" : "true";
  }
  if ("any" in c) {
    let unknown = false;
    for (const sub of c.any) {
      const t = evaluate(sub, facts);
      if (t === "true") return "true";
      if (t === "unknown") unknown = true;
    }
    return unknown ? "unknown" : "false";
  }
  const t = evaluate(c.not, facts);
  return t === "unknown" ? "unknown" : t === "true" ? "false" : "true";
}

/** Labels of the leaves that are true — the audit trail for "Why it appeared". */
export function trueLabels(c: Condition, facts: Facts): string[] {
  if (isLeaf(c)) return evalLeaf(c, facts) === "true" && c.label ? [c.label] : [];
  if ("not" in c) return [];
  const subs = "all" in c ? c.all : c.any;
  return subs.flatMap((s) => trueLabels(s, facts));
}

/** Facts referenced by a condition — used by the admin dashboard and tests. */
export function referencedFacts(c: Condition): string[] {
  if (isLeaf(c)) return [c.fact];
  if ("not" in c) return referencedFacts(c.not);
  return Array.from(new Set(("all" in c ? c.all : c.any).flatMap(referencedFacts)));
}

/** Human-readable rendering of a condition tree for the admin rule view. */
export function describe(c: Condition, depth = 0): string {
  const pad = "  ".repeat(depth);
  if (isLeaf(c)) {
    const val = c.value === undefined ? "" : ` ${JSON.stringify(c.value)}`;
    return `${pad}${c.fact} ${c.op}${val}`;
  }
  if ("not" in c) return `${pad}NOT\n${describe(c.not, depth + 1)}`;
  const kw = "all" in c ? "ALL OF" : "ANY OF";
  const subs = "all" in c ? c.all : c.any;
  return `${pad}${kw}\n${subs.map((s) => describe(s, depth + 1)).join("\n")}`;
}
