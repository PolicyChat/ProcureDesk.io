import type { RuleStatus } from "@/lib/types";

export const STATUS_TONE: Record<RuleStatus, "gray" | "gold" | "teal" | "clay"> = {
  draft: "gray",
  legal_review: "gold",
  approved: "teal",
  published: "teal",
  retired: "clay",
};
