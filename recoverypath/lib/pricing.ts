import type { Entitlement } from "./types";

export type PlanId = "plan" | "passport" | "upgrade";

export const PLANS: Record<PlanId, { name: string; price: number; grants: Entitlement; blurb: string }> = {
  plan: {
    name: "Complete Recovery Plan",
    price: 79,
    grants: "plan",
    blurb: "Your full action plan, evidence checklist and Claim Readiness Report.",
  },
  passport: {
    name: "Recovery Plan + Attorney Case Passport",
    price: 129,
    grants: "passport",
    blurb: "Everything in the Recovery Plan, plus an attorney-ready case packet.",
  },
  upgrade: {
    name: "Attorney Case Passport upgrade",
    price: 50,
    grants: "passport",
    blurb: "Adds the Attorney Case Passport to your Recovery Plan ($129 total).",
  },
};

export const RANK: Record<Entitlement, number> = { free: 0, plan: 1, passport: 2 };

export function hasAccess(current: Entitlement, needed: Entitlement) {
  return RANK[current] >= RANK[needed];
}
